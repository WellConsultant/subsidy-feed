#!/usr/bin/env python3
"""subsidy-feed の全HTMLに対して以下を実施:
1) ナビの「補助金活用ガイド」を「補助金活用型経営サイト」にリネーム
2) フッター（<footer class="site"> 等）に同名リンクを追加（既に追加済みならスキップ）
"""
import os, re, glob

ROOT = "/Users/kazuhiroakutsu/Desktop/claude-skills/subsidy-feed"

OLD_LABEL = "補助金活用ガイド"
NEW_LABEL = "補助金活用型経営サイト"
LINK_URL  = "https://fp-1.info/hojokin/"

# フッター追加用：copyright 行 (&copy; Well Consultant) の直前に挿入
FOOTER_INSERT = (
    '<p><a href="' + LINK_URL + '" target="_blank" rel="noopener">'
    + NEW_LABEL + '</a></p>\n    '
)
COPY_PATTERN = re.compile(r'(<p>&copy; Well Consultant</p>)')

count_nav = 0
count_footer = 0
count_skip = 0

for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    orig = html

    # 1) ナビのリネーム
    if OLD_LABEL in html:
        html = html.replace(
            '>' + OLD_LABEL + '<',
            '>' + NEW_LABEL + '<'
        )
        if html != orig:
            count_nav += 1

    # 2) フッターに追加（既に NEW_LABEL がフッター内にあればスキップ）
    has_footer = '<footer' in html and '&copy; Well Consultant' in html
    already_in_footer = False
    if has_footer:
        # フッター以降の文字列に NEW_LABEL があるかチェック
        footer_idx = html.find('<footer')
        if footer_idx >= 0 and NEW_LABEL in html[footer_idx:]:
            already_in_footer = True
    if has_footer and not already_in_footer:
        new_html, n = COPY_PATTERN.subn(FOOTER_INSERT + r'\1', html, count=1)
        if n > 0:
            html = new_html
            count_footer += 1

    if html != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
    else:
        count_skip += 1

print(f"ナビ更新: {count_nav}件 / フッター追加: {count_footer}件 / 変更なし: {count_skip}件")
