#!/usr/bin/env python3
"""subsidies.json 全件を内部ブログ記事としてHTMLに書き出す。

- 出力先: blog/s/{id}.html
- データ源: subsidies.json を主、parse_cache(JSON) のより詳細な情報があれば name一致でマージ
- 既存の build_blog.py（parse_cache駆動・都道府県スラグ形式）とは独立

実行:  python3 build_all_articles.py
"""

import json
import os
import re
from datetime import datetime
from html import escape

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUT_DIR = os.path.join(REPO_ROOT, 'blog', 's')
SUBSIDIES_JSON = '/Users/kazuhiroakutsu/Desktop/claude-skills/02_プロジェクト/subsidy-collector/data/subsidies.json'
PARSE_CACHE_DIR = '/Users/kazuhiroakutsu/Desktop/claude-skills/02_プロジェクト/subsidy-collector/data/parse_cache'
TODAY = datetime.today().strftime('%Y-%m-%d')


# ---------- ユーティリティ ----------
def format_amount(amount):
    if amount is None or amount == '':
        return None
    try:
        n = int(amount)
    except (ValueError, TypeError):
        return None
    if n >= 100000000:
        oku = n / 100000000
        if oku == int(oku):
            return f'{int(oku)}億円'
        return f'{oku:.1f}億円'
    if n >= 10000:
        man = n / 10000
        if man == int(man):
            return f'{int(man):,}万円'
        return f'{man:,.1f}万円'
    return f'{n:,}円'


def normalize_name(name):
    if not name:
        return ''
    s = re.sub(r'[\s\u3000]+', '', name)
    s = re.sub(r'[【】「」『』〈〉（）()［］\[\]]', '', s)
    return s


def load_parse_cache_by_name():
    """parse_cache/*.json を name で索引化する。
    subsidies.json 側に同名のものがあれば詳細情報をマージするために使う。"""
    m = {}
    if not os.path.isdir(PARSE_CACHE_DIR):
        return m
    for fn in os.listdir(PARSE_CACHE_DIR):
        if not fn.endswith('.json'):
            continue
        try:
            with open(os.path.join(PARSE_CACHE_DIR, fn), encoding='utf-8') as f:
                d = json.load(f)
        except Exception:
            continue
        nm = d.get('name')
        if not nm:
            continue
        m[normalize_name(nm)] = d
    return m


def merge_parse_cache(item, cache_map):
    """subsidies.json のエントリに parse_cache の詳細情報をマージ。"""
    nm = normalize_name(item.get('name', ''))
    if not nm:
        return item
    # 完全一致
    d = cache_map.get(nm)
    if not d:
        # 部分一致（短い方が長い方に含まれる）
        for k, v in cache_map.items():
            if k and (k in nm or nm in k):
                if abs(len(k) - len(nm)) <= max(len(k), len(nm)) * 0.4:
                    d = v
                    break
    if not d:
        return item
    merged = dict(item)
    for k, v in d.items():
        if v in (None, '', [], {}):
            continue
        if merged.get(k) in (None, '', [], {}):
            merged[k] = v
    return merged


# ---------- 都道府県タグ ----------
PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県',
    '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]


def detect_region(item):
    """regions フィールド → description → name から都道府県を抽出"""
    regions = item.get('regions') or []
    for r in regions:
        if r in PREFECTURES:
            return r
    # description / name からの抽出
    for haystack in (item.get('description') or '', item.get('name') or '', item.get('implementing_org') or ''):
        for pref in PREFECTURES:
            if pref in haystack:
                return pref
    return '全国'


# ---------- CSS ----------
PAGE_CSS = '''* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic UI", sans-serif; margin: 0; background: #f5f7fa; color: #1a1a1a; line-height: 1.9; font-size: 16px; }
a { color: #1a3a5c; }
.container { max-width: 780px; margin: 0 auto; padding: 0 20px; }

nav.site-nav { background: #122a44; padding: 14px 0; }
nav.site-nav .container { display: flex; align-items: center; justify-content: space-between; max-width: 1100px; }
.nav-logo { color: white; text-decoration: none; font-weight: 700; font-size: 15px; }
.nav-links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
.nav-links a { color: rgba(255,255,255,0.9); text-decoration: none; font-size: 13px; }
.nav-links a:hover { color: white; }
.nav-cta { background: #d35400; color: white !important; padding: 8px 14px !important; border-radius: 6px; font-weight: 600; }

header.article-head { background: linear-gradient(135deg, #1a3a5c 0%, #2c5282 100%); color: white; padding: 48px 0 36px; }
header.article-head .container { max-width: 780px; }
header.article-head .meta { font-size: 12px; opacity: 0.85; margin: 0 0 12px; letter-spacing: 0.05em; }
header.article-head h1 { margin: 0 0 10px; font-size: 24px; font-weight: 700; line-height: 1.55; }
header.article-head .subtitle { margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #ffd49a; }
header.article-head .tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
header.article-head .tag { background: rgba(255,255,255,0.15); color: white; font-size: 11px; padding: 4px 12px; border-radius: 999px; }

main.article { background: white; padding: 40px 44px; margin: -20px auto 40px; border-radius: 10px; box-shadow: 0 2px 12px rgba(26,58,92,0.06); max-width: 780px; }
main.article .lead { font-size: 15px; line-height: 2.0; margin: 0 0 28px; padding: 18px 22px; background: #f5f7fa; border-left: 4px solid #d35400; color: #333; text-align: left; }
main.article h2 { font-size: 20px; color: #1a3a5c; margin: 36px 0 16px; padding: 0 0 10px; border-bottom: 2px solid #e4e9ef; line-height: 1.5; }
main.article h3 { font-size: 15px; color: #1a3a5c; margin: 24px 0 10px; line-height: 1.5; }
main.article p { margin: 0 0 16px; text-align: left; }
main.article ul { padding-left: 1.2em; margin: 0 0 20px; }
main.article li { margin-bottom: 8px; text-align: left; }
main.article .info-box { background: #fafbfc; border: 1px solid #e4e9ef; border-radius: 8px; padding: 18px 22px; margin: 16px 0 24px; }
main.article .info-box dl { margin: 0; display: grid; grid-template-columns: 130px 1fr; gap: 10px 16px; }
main.article .info-box dt { font-size: 13px; color: #1a3a5c; font-weight: 700; }
main.article .info-box dd { font-size: 13px; margin: 0; color: #333; }
main.article .disclaimer { margin-top: 32px; padding: 16px 20px; background: #fff8f0; border: 1px solid #f0d5a0; border-radius: 6px; font-size: 13px; line-height: 1.85; color: #7a5020; }
main.article .source-link { margin-top: 22px; padding: 14px 18px; background: #f0f4f8; border-radius: 6px; font-size: 13px; }
main.article .source-link a { color: #1a3a5c; font-weight: 700; word-break: break-all; }
main.article .article-cta { margin: 40px 0 0; padding: 30px 28px; background: linear-gradient(135deg, #1a3a5c 0%, #2c5282 100%); border-radius: 10px; text-align: center; color: white; }
main.article .article-cta h3 { color: white; margin: 0 0 12px; font-size: 18px; line-height: 1.5; border: none; padding: 0; }
main.article .article-cta p { color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.85; margin: 0 0 18px; text-align: center; }
main.article .article-cta .cta-btn { display: inline-block; background: #d35400; color: white; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 700; transition: background 0.2s, transform 0.2s; }
main.article .article-cta .cta-btn:hover { background: #b34700; transform: translateY(-2px); }
main.article .article-cta .cta-note { font-size: 12px; opacity: 0.78; margin-top: 12px; }
.back-link { display: inline-block; margin: 24px 0 0; color: #1a3a5c; text-decoration: none; font-size: 14px; font-weight: 600; }
.back-link:hover { text-decoration: underline; }

footer.site { background: #1a1a1a; color: rgba(255,255,255,0.85); padding: 28px 0; text-align: center; font-size: 13px; margin-top: 40px; }
footer.site p { margin: 6px 0; }

@media (max-width: 600px) {
  body { font-size: 15px; }
  header.article-head { padding: 36px 0 28px; }
  header.article-head h1 { font-size: 19px; }
  main.article { padding: 26px 20px; margin-top: -12px; }
  main.article h2 { font-size: 17px; }
  main.article h3 { font-size: 14px; }
  main.article .info-box dl { grid-template-columns: 1fr; gap: 4px 0; }
  main.article .info-box dt { margin-top: 8px; }
}'''


NAV_HTML = '''<nav class="site-nav">
  <div class="container">
    <a class="nav-logo" href="/">補助金情報フィード</a>
    <ul class="nav-links">
      <li><a href="/">トップ</a></li>
      <li><a href="/blog/">解説記事</a></li>
      <li><a class="nav-cta" href="https://www.funnel-build.com/hojokin-contact-legacy2" target="_blank" rel="noopener">お問い合わせ</a></li>
    </ul>
  </div>
</nav>'''

FOOTER_HTML = '''<footer class="site">
  <div class="container">
    <p>本サイトは公的機関が公開している補助金情報を自動収集しています。</p>
    <p>最新・正確な情報は必ず各補助金の公式ページでご確認ください。</p>
    <p>&copy; Well Consultant</p>
  </div>
</footer>'''


# ---------- 本文組み立て ----------
def clean_name(name):
    """一覧で見やすいよう、先頭の【XX】や「補助金・助成金：」プレフィックスを除去"""
    if not name:
        return ''
    s = name
    s = re.sub(r'^【[^】]*】\s*', '', s)
    s = re.sub(r'^補助金・助成金[：:]\s*', '', s)
    s = re.sub(r'^助成金[：:]\s*', '', s)
    s = re.sub(r'^支援情報[：:]\s*', '', s)
    s = re.sub(r'^融資・貸付[：:]\s*', '', s)
    return s.strip() or name


def build_lead(item, region):
    """記事冒頭のリード文を組み立てる"""
    summary = item.get('summary') or ''
    description = item.get('description') or ''
    name = clean_name(item.get('name') or '')
    parts = []
    if region != '全国':
        parts.append(f'{region}で公募されている「{name}」についてご紹介します。')
    else:
        parts.append(f'全国を対象に公募されている「{name}」についてご紹介します。')
    if summary:
        parts.append(summary)
    elif description:
        # description の冒頭を抜粋（改行を半角スペースに）
        snippet = re.sub(r'\s+', ' ', description).strip()
        if len(snippet) > 240:
            snippet = snippet[:240] + '…'
        parts.append(snippet)
    parts.append('本記事では、制度の概要・申請スケジュール・情報源を整理してお届けします。詳細は必ず公式ページでご確認ください。')
    return ''.join(parts)


def render_article(item, region):
    name_raw = item.get('name') or '（補助金名不明）'
    name = clean_name(name_raw)
    detail_url = item.get('detail_url') or ''
    description = item.get('description') or ''
    summary = item.get('summary') or ''
    org = item.get('implementing_org') or ''
    purpose = item.get('purpose') or ''
    subsidy_rate = item.get('subsidy_rate') or ''
    max_amount = item.get('max_amount')
    max_amount_str = format_amount(max_amount)
    subsidy_types = item.get('subsidy_types') or ''
    application_start = item.get('application_start') or ''
    application_end = item.get('application_end') or ''
    project_period = item.get('project_period') or ''
    eligible_businesses = item.get('eligible_businesses') or []
    eligible_expenses = item.get('eligible_expenses') or []
    review_criteria = item.get('review_criteria') or []
    bonus_points = item.get('bonus_points') or []
    notes = item.get('notes') or []
    tags = item.get('tags') or []

    # info box
    info_items = []
    if org:
        info_items.append(('実施機関', escape(org)))
    if region and region != '全国':
        info_items.append(('対象地域', escape(region)))
    sched = ''
    if application_start and application_end:
        sched = f'{escape(application_start)}〜{escape(application_end)}'
    elif application_end:
        sched = f'〜{escape(application_end)}'
    elif application_start:
        sched = f'{escape(application_start)}〜'
    if sched:
        info_items.append(('受付期間', sched))
    if project_period:
        info_items.append(('事業実施期間', escape(project_period)))
    if max_amount_str:
        info_items.append(('補助上限額', escape(max_amount_str)))
    if subsidy_rate:
        info_items.append(('補助率', escape(subsidy_rate)))
    if not info_items:
        info_items.append(('情報', '詳細は下記の公式ページをご確認ください'))
    info_box_inner = '\n      '.join(
        f'<dt>{k}</dt><dd>{v}</dd>' for k, v in info_items
    )

    # tag row
    head_tags = []
    if region and region != '全国':
        head_tags.append(region)
    for t in tags[:4]:
        if t and t != region:
            head_tags.append(t)
    tag_row_html = ''.join(
        f'<span class="tag">{escape(t)}</span>' for t in head_tags
    )

    # サブタイトル（上限額）
    h1_subline = ''
    if max_amount_str:
        h1_subline = f'    <p class="subtitle">最大{escape(max_amount_str)}</p>\n'

    # 本文セクション
    sections = []

    if purpose:
        sections.append(f'''  <h2>制度の目的と背景</h2>
  <p>{escape(purpose)}</p>''')
    elif description:
        # description を制度概要として使う（簡易）
        paragraphs = [p.strip() for p in re.split(r'\n\s*\n', description) if p.strip()]
        body_paras = ''.join(f'  <p>{escape(p)}</p>\n' for p in paragraphs[:4])
        sections.append('  <h2>制度の概要</h2>\n' + body_paras.rstrip())

    # 補助率・上限額
    if subsidy_rate or max_amount_str or subsidy_types:
        rate_parts = ['  <h2>補助率と上限額</h2>',
                      '  <p>本補助金の補助率・上限額は以下のとおりです。詳細は公募要領をご確認ください。</p>']
        if subsidy_rate:
            rate_parts.append(f'  <p>◼︎ 補助率<br>{escape(subsidy_rate)}</p>')
        if max_amount_str:
            rate_parts.append(f'  <p>◼︎ 補助上限額<br>{escape(max_amount_str)}</p>')
        if subsidy_types:
            rate_parts.append(f'  <p>◼︎ 内訳・支援枠<br>{escape(subsidy_types)}</p>')
        sections.append('\n'.join(rate_parts))

    if eligible_businesses:
        lis = '\n'.join(f'    <li>{escape(str(b))}</li>' for b in eligible_businesses)
        sections.append(f'''  <h2>対象となる事業者</h2>
  <p>本補助金の対象となる事業者は以下のとおりです。</p>
  <ul>
{lis}
  </ul>''')

    if eligible_expenses:
        lis = '\n'.join(f'    <li>{escape(str(e))}</li>' for e in eligible_expenses)
        sections.append(f'''  <h2>対象経費</h2>
  <p>補助対象となる経費は以下のとおりです。</p>
  <ul>
{lis}
  </ul>''')

    # 申請スケジュール（日付があれば）
    if application_start or application_end or project_period:
        parts = []
        if application_start and application_end:
            parts.append(f'受付期間は{escape(application_start)}から{escape(application_end)}までです。')
        elif application_end:
            parts.append(f'受付締切は{escape(application_end)}です。')
        if project_period:
            parts.append(f'事業実施期間は{escape(project_period)}です。')
        parts.append('スケジュールは変更される場合があるため、必ず公式ページの最新情報をご確認ください。')
        sections.append('  <h2>申請スケジュール</h2>\n  <p>' + ''.join(parts) + '</p>')

    if review_criteria:
        crit_items = []
        for c in review_criteria:
            if isinstance(c, dict):
                cname = c.get('criterion') or ''
                cdesc = c.get('description') or ''
                if cname and cdesc:
                    crit_items.append(f'    <li>◼︎ {escape(cname)}：{escape(cdesc)}</li>')
                elif cname:
                    crit_items.append(f'    <li>◼︎ {escape(cname)}</li>')
            else:
                crit_items.append(f'    <li>◼︎ {escape(str(c))}</li>')
        if crit_items:
            sections.append(f'''  <h2>審査のポイント</h2>
  <p>審査では以下の観点から事業計画が評価されます。</p>
  <ul>
{chr(10).join(crit_items)}
  </ul>''')

    if bonus_points:
        lis = '\n'.join(f'    <li>{escape(str(b))}</li>' for b in bonus_points)
        sections.append(f'''  <h2>加点項目</h2>
  <p>以下のいずれかに該当する事業者は、審査において加点の対象となります。</p>
  <ul>
{lis}
  </ul>''')

    if notes:
        lis = '\n'.join(f'    <li>{escape(str(n))}</li>' for n in notes)
        sections.append(f'''  <h2>活用にあたっての注意点</h2>
  <ul>
{lis}
  </ul>''')

    body_html = '\n\n'.join(sections)

    # 情報源
    source_html = ''
    if detail_url:
        source_html = f'''  <div class="source-link">
    <strong>◼︎ 情報源（公式ページ）</strong><br>
    <a href="{escape(detail_url)}" target="_blank" rel="noopener">{escape(detail_url)}</a>
  </div>'''

    # 免責
    disclaimer_html = '''  <div class="disclaimer">
    ※本記事は公的機関が公開している情報を自動収集し、記事化したものです。最新の公募要件・スケジュール・様式等は必ず公式ページでご確認ください。
  </div>'''

    # CTA
    cta_html = '''  <div class="article-cta">
    <h3>補助金の申請・活用についてご相談はこちらから</h3>
    <p>「この補助金を自社で活用できるか知りたい」「申請書作成を任せたい」「他にどんな補助金が使えるか相談したい」など、お気軽にお問い合わせください。初回のご相談は無料です。</p>
    <a class="cta-btn" href="https://www.funnel-build.com/hojokin-contact-legacy2" target="_blank" rel="noopener">無料相談のお申し込み</a>
    <p class="cta-note">※本記事の内容についてのご質問もお受けしています</p>
  </div>'''

    # リード
    lead_text = build_lead(item, region)

    # メタ
    meta_desc_parts = [name]
    if max_amount_str:
        meta_desc_parts.append(f'上限{max_amount_str}')
    if subsidy_rate:
        meta_desc_parts.append(f'補助率{subsidy_rate[:30]}')
    if application_end:
        meta_desc_parts.append(f'締切{application_end}')
    meta_desc = ' / '.join(meta_desc_parts)[:160]

    return f'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{escape(name)}｜補助金情報フィード</title>
<meta name="description" content="{escape(meta_desc)}">
<style>
{PAGE_CSS}
</style>
</head>
<body>

{NAV_HTML}

<header class="article-head">
  <div class="container">
    <p class="meta">{TODAY} 掲載 / カテゴリ：補助金解説</p>
    <h1>{escape(name)}</h1>
{h1_subline}    <div class="tag-row">
{tag_row_html}
    </div>
  </div>
</header>

<main class="article">

  <p class="lead">{escape(lead_text)}</p>

  <div class="info-box">
    <dl>
      {info_box_inner}
    </dl>
  </div>

{body_html}

{source_html}

{disclaimer_html}

{cta_html}

  <a class="back-link" href="/">← 補助金一覧に戻る</a>

</main>

{FOOTER_HTML}

</body>
</html>
'''


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    with open(SUBSIDIES_JSON, encoding='utf-8') as f:
        subsidies = json.load(f)
    print(f'[build-all] loaded {len(subsidies)} subsidies')

    cache_map = load_parse_cache_by_name()
    print(f'[build-all] loaded {len(cache_map)} parse_cache entries')

    count = 0
    id_to_slug = {}
    for item in subsidies:
        sid = item.get('id')
        if not sid:
            continue
        merged = merge_parse_cache(item, cache_map)
        region = detect_region(merged)
        html = render_article(merged, region)
        out_path = os.path.join(OUT_DIR, f'{sid}.html')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)
        id_to_slug[sid] = f'/blog/s/{sid}.html'
        count += 1

    print(f'[build-all] wrote {count} articles to {OUT_DIR}')


if __name__ == '__main__':
    main()
