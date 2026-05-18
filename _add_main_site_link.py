#!/usr/bin/env python3
"""subsidy-feed の全HTMLファイルのナビメニューに「補助金活用ガイド」(fp-1.info/hojokin) リンクを追加。
target="_top" で iframe 内からも親フレームに遷移できる。"""
import os, re, glob

ROOT = "/Users/kazuhiroakutsu/Desktop/claude-skills/subsidy-feed"
INSERT_HTML = '<li><a href="https://fp-1.info/hojokin/" target="_top">補助金活用ガイド</a></li>\n      '

# nav-cta の直前に挿入。既に追加済みのページはスキップ。
PATTERN = re.compile(r'(<li><a class="nav-cta")')

count_added = 0
count_skip = 0

for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    # archive/ や _systemフォルダ等で意図しない書き換えを避けたい場合はここでフィルタ追加可
    with open(path, encoding="utf-8") as f:
        html = f.read()
    if 'href="https://fp-1.info/hojokin/"' in html:
        count_skip += 1
        continue
    if 'nav-links' not in html:
        continue
    new_html, n = PATTERN.subn(INSERT_HTML + r'\1', html, count=1)
    if n == 0:
        continue
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_html)
    count_added += 1

print(f"追加: {count_added}件 / スキップ(既追加): {count_skip}件")
