#!/usr/bin/env python3
"""index.html の都道府県別一覧セクション内のリンクを、
外部ページから内部ブログ記事ページに差し替える。

- <td><a href="https://...">NAME</a></td> → <td><a href="/blog/s/{id}.html">NAME</a></td>
- <td>NAME</td>（リンク無し） → <td><a href="/blog/s/{id}.html">NAME</a></td>
- id は subsidies.json の detail_url / name から特定
- 差し替え対象は「当サイトに収録している公募中の補助金」セクションの範囲のみ

実行: python3 link_subsidies.py
"""

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
INDEX_HTML = os.path.join(REPO_ROOT, 'index.html')
SUBSIDIES_JSON = '/Users/kazuhiroakutsu/Desktop/claude-skills/02_プロジェクト/subsidy-collector/data/subsidies.json'

SECTION_START_MARK = '<h2 class="section-title">当サイトに収録している公募中の補助金'
SECTION_END_MARK = '</details>\n</section>'  # 都道府県別一覧の終わり
# セクション終端は最後の </details> の直後の </section>


def normalize_name(name):
    if not name:
        return ''
    s = re.sub(r'[\s\u3000]+', '', name)
    s = re.sub(r'[【】「」『』〈〉（）()［］\[\]]', '', s)
    return s


def build_id_maps():
    with open(SUBSIDIES_JSON, encoding='utf-8') as f:
        data = json.load(f)
    by_url = {}
    by_name = {}
    for item in data:
        sid = item.get('id')
        if not sid:
            continue
        url = (item.get('detail_url') or '').strip()
        if url:
            by_url[url] = sid
            # 末尾スラッシュ差異対策
            if url.endswith('/'):
                by_url[url.rstrip('/')] = sid
            else:
                by_url[url + '/'] = sid
        name = item.get('name') or ''
        if name:
            by_name[normalize_name(name)] = sid
    return by_url, by_name


def find_id(url, name, by_url, by_name):
    if url and url in by_url:
        return by_url[url]
    if url:
        # 末尾 / 差異
        if url.rstrip('/') in by_url:
            return by_url[url.rstrip('/')]
        if (url + '/') in by_url:
            return by_url[url + '/']
    if name:
        n = normalize_name(name)
        if n in by_name:
            return by_name[n]
    return None


def replace_links(section_html, by_url, by_name):
    """セクションHTML内のリンクを差し替える"""
    stats = {'linked': 0, 'unlinked': 0, 'skipped_link': 0, 'skipped_text': 0}

    # パターン1: <td><a href="URL" ...>TEXT</a></td>
    def repl_linked(m):
        url = m.group(1)
        text = m.group(2)
        sid = find_id(url, text, by_url, by_name)
        if not sid:
            stats['skipped_link'] += 1
            return m.group(0)  # 変更せず
        stats['linked'] += 1
        return f'<td><a href="/blog/s/{sid}.html">{text}</a></td>'

    # <td> 内に <a href="..."> を1つだけ含むパターンにマッチ
    # 次の <td> や行末まで
    pattern_linked = re.compile(
        r'<td><a href="([^"]+)"[^>]*>([^<]+)</a></td>',
    )
    section_html = pattern_linked.sub(repl_linked, section_html)

    # パターン2: <td>TEXT</td>（テキストだけ、<a>がない）
    # ただし、既に差し替え済みの <td><a href="/blog/s/...">...</a></td> は除く必要がある
    # また日付セル <td class="date">...</td> も除く
    def repl_unlinked(m):
        text = m.group(1).strip()
        # 空や記号のみはスキップ
        if not text or text in ('-', '—'):
            return m.group(0)
        sid = find_id(None, text, by_url, by_name)
        if not sid:
            stats['skipped_text'] += 1
            return m.group(0)
        stats['unlinked'] += 1
        return f'<td><a href="/blog/s/{sid}.html">{text}</a></td>'

    # <td>TEXT</td> パターン。class属性が無く、<a>を含まない
    pattern_unlinked = re.compile(
        r'<td>([^<>]+)</td>'
    )
    section_html = pattern_unlinked.sub(repl_unlinked, section_html)

    return section_html, stats


def main():
    by_url, by_name = build_id_maps()
    print(f'[link] loaded {len(by_url)} url->id, {len(by_name)} name->id')

    with open(INDEX_HTML, encoding='utf-8') as f:
        content = f.read()

    # 一覧セクションの範囲を特定
    start = content.find(SECTION_START_MARK)
    if start == -1:
        print('[link] section start not found')
        return
    # start の前に最も近い <section class="section"> を探す（セクションブロックの開始位置）
    sec_open = content.rfind('<section class="section">', 0, start)
    if sec_open == -1:
        print('[link] <section> open tag not found before title')
        return

    # セクションの終端：sec_open から始まる最初の </section> ではない
    # 入れ子は無い想定だが、sec_open 以降で最初の </section> を探す
    sec_close = content.find('</section>', start)
    if sec_close == -1:
        print('[link] </section> close tag not found')
        return
    sec_close_end = sec_close + len('</section>')

    before = content[:sec_open]
    section = content[sec_open:sec_close_end]
    after = content[sec_close_end:]

    print(f'[link] section range: {sec_open}..{sec_close_end} ({len(section)} chars)')

    new_section, stats = replace_links(section, by_url, by_name)
    print(f'[link] replaced: linked={stats["linked"]}, unlinked={stats["unlinked"]}, '
          f'skipped_link={stats["skipped_link"]}, skipped_text={stats["skipped_text"]}')

    new_content = before + new_section + after
    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'[link] updated: {INDEX_HTML}')


if __name__ == '__main__':
    main()
