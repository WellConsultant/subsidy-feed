#!/usr/bin/env python3
"""
subsidy-feed ブログビルドスクリプト

機能:
  1. subsidy-collectorのparse_cache(JSON)から補助金解説記事HTMLを一括生成
  2. blog/index.html（記事一覧）を全記事カードで再生成
  3. ../index.html のトップ「詳しく解説した記事」セクションを最新記事で更新

実行: python3 build_blog.py
"""

import json
import os
import re
from datetime import datetime
from html import escape

# ========== 設定 ==========
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
BLOG_DIR = os.path.join(REPO_ROOT, 'blog')
PARSE_CACHE_DIR = '/Users/kazuhiroakutsu/Desktop/claude-skills/02_プロジェクト/subsidy-collector/data/parse_cache'
SUBSIDIES_JSON = '/Users/kazuhiroakutsu/Desktop/claude-skills/02_プロジェクト/subsidy-collector/data/subsidies.json'
TOP_INDEX_HTML = os.path.join(REPO_ROOT, 'index.html')
BLOG_INDEX_HTML = os.path.join(BLOG_DIR, 'index.html')
TODAY = datetime.today().strftime('%Y-%m-%d')
TOP_LATEST_N = 6  # トップページに出す最新記事数

# 既存の手書き記事（再生成せず保護）
PROTECTED = set([
    '2026-04-10-oita-junkan-keizai.html',
])

# 記事化に不適切なタイトル（様式・書類・ガイドブック等）のフィルタ用語
INVALID_NAME_SUBSTRINGS = [
    '不明',
    '書類について',
    '様式について',
]
INVALID_NAME_SUFFIXES = [
    'ガイドブック', '計画書', '手引き', '様式', '申請書',
    'について', '留意事項', 'マニュアル', 'Q&A', 'Ｑ＆Ａ',
    'チェックリスト', 'リーフレット', '一覧', '概要',
]
INVALID_NAME_EXACT = set([
    '助成事業', '補助事業', '支援事業',
])


def is_valid_subsidy_name(name):
    """補助金の制度名として妥当なタイトルか判定"""
    if not name:
        return False
    stripped = name.strip()
    if not stripped:
        return False
    if stripped in INVALID_NAME_EXACT:
        return False
    for s in INVALID_NAME_SUBSTRINGS:
        if s in stripped:
            return False
    for suf in INVALID_NAME_SUFFIXES:
        if stripped.endswith(suf):
            return False
    # 最低限の長さ
    if len(stripped) < 6:
        return False
    return True

PREFECTURE_ROMAJI = {
    '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '宮城県': 'miyagi',
    '秋田県': 'akita', '山形県': 'yamagata', '福島県': 'fukushima',
    '茨城県': 'ibaraki', '栃木県': 'tochigi', '群馬県': 'gunma',
    '埼玉県': 'saitama', '千葉県': 'chiba', '東京都': 'tokyo', '神奈川県': 'kanagawa',
    '新潟県': 'niigata', '富山県': 'toyama', '石川県': 'ishikawa', '福井県': 'fukui',
    '山梨県': 'yamanashi', '長野県': 'nagano', '岐阜県': 'gifu', '静岡県': 'shizuoka',
    '愛知県': 'aichi', '三重県': 'mie',
    '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo',
    '奈良県': 'nara', '和歌山県': 'wakayama',
    '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama',
    '広島県': 'hiroshima', '山口県': 'yamaguchi',
    '徳島県': 'tokushima', '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi',
    '福岡県': 'fukuoka', '佐賀県': 'saga', '長崎県': 'nagasaki', '熊本県': 'kumamoto',
    '大分県': 'oita', '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa',
}


# ========== ユーティリティ ==========
def format_amount(amount):
    """金額を「○円」「○万円」「○億円」に整形"""
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


def slug_for(prefecture, used_slugs):
    """都道府県名からスラッグを生成。衝突時は連番"""
    base = PREFECTURE_ROMAJI.get(prefecture, 'japan')
    if base not in used_slugs:
        used_slugs[base] = 0
        return base
    used_slugs[base] += 1
    return f'{base}-{used_slugs[base] + 1}'


def normalize_name(name):
    """補助金名の正規化（マッチング用）"""
    if not name:
        return ''
    s = re.sub(r'[\s\u3000]+', '', name)
    s = re.sub(r'[【】「」『』〈〉（）()［］\[\]]', '', s)
    return s


def build_detail_url_map(subsidies_json_path):
    """subsidies.jsonから name -> detail_url のマップを作成"""
    with open(subsidies_json_path) as f:
        data = json.load(f)
    m = {}
    for d in data:
        name = d.get('name')
        url = d.get('detail_url')
        if name and url:
            m[normalize_name(name)] = url
    return m


def find_detail_url(name, url_map):
    """補助金名から detail_url を検索（完全一致 → 部分一致）"""
    if not name:
        return None
    norm = normalize_name(name)
    if norm in url_map:
        return url_map[norm]
    # 部分一致
    for k, v in url_map.items():
        if norm and (norm in k or k in norm):
            return v
    return None


def get_region(data):
    """regions[0] または データから都道府県を抽出"""
    regions = data.get('regions') or []
    if regions:
        return regions[0]
    return '全国'


def get_primary_region(data):
    """都道府県っぽいものを優先（県・府・都・道を含むもの）"""
    regions = data.get('regions') or []
    for r in regions:
        if any(suffix in r for suffix in ['県', '府', '都', '道']):
            return r
    if regions:
        return regions[0]
    return '全国'


# ========== HTMLテンプレート ==========
PAGE_CSS = '''* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic UI", sans-serif; margin: 0; background: #f5f7fa; color: #1a1a1a; line-height: 1.9; font-size: 16px; }
a { color: #1a3a5c; }
.container { max-width: 760px; margin: 0 auto; padding: 0 20px; }

nav.site-nav { background: #1a3a5c; padding: 14px 0; }
nav.site-nav .container { display: flex; align-items: center; justify-content: space-between; max-width: 1100px; }
.nav-logo { color: white; text-decoration: none; font-weight: 700; font-size: 15px; }
.nav-links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
.nav-links a { color: rgba(255,255,255,0.9); text-decoration: none; font-size: 13px; }
.nav-links a:hover { color: white; }
.nav-cta { background: #d35400; color: white !important; padding: 8px 14px !important; border-radius: 6px; font-weight: 600; }

header.article-head { background: linear-gradient(135deg, #1a3a5c 0%, #2c5282 100%); color: white; padding: 48px 0 36px; }
header.article-head .container { max-width: 760px; }
header.article-head .meta { font-size: 12px; opacity: 0.85; margin: 0 0 12px; letter-spacing: 0.05em; }
header.article-head h1 { margin: 0 0 10px; font-size: 26px; font-weight: 700; line-height: 1.55; }
header.article-head .subtitle { margin: 0 0 14px; font-size: 18px; font-weight: 700; color: #ffd49a; }
header.article-head .tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
header.article-head .tag { background: rgba(255,255,255,0.15); color: white; font-size: 11px; padding: 4px 12px; border-radius: 999px; }

main.article { background: white; padding: 44px 48px; margin: -20px auto 40px; border-radius: 10px; box-shadow: 0 2px 12px rgba(26,58,92,0.06); max-width: 760px; }
main.article .lead { font-size: 15px; line-height: 2.0; margin: 0 0 32px; padding: 18px 22px; background: #f5f7fa; border-left: 4px solid #d35400; color: #333; }
main.article h2 { font-size: 21px; color: #1a3a5c; margin: 40px 0 18px; padding: 0 0 10px; border-bottom: 2px solid #e4e9ef; line-height: 1.5; }
main.article h3 { font-size: 16px; color: #1a3a5c; margin: 28px 0 12px; line-height: 1.5; }
main.article p { margin: 0 0 18px; text-align: left; }
main.article ul { padding-left: 1.2em; margin: 0 0 22px; }
main.article li { margin-bottom: 8px; text-align: left; }
main.article .info-box { background: #fafbfc; border: 1px solid #e4e9ef; border-radius: 8px; padding: 18px 24px; margin: 20px 0 24px; }
main.article .info-box dl { margin: 0; display: grid; grid-template-columns: 130px 1fr; gap: 10px 18px; }
main.article .info-box dt { font-size: 13px; color: #1a3a5c; font-weight: 700; }
main.article .info-box dd { font-size: 13px; margin: 0; color: #333; }
main.article .disclaimer { margin-top: 36px; padding: 18px 22px; background: #fff8f0; border: 1px solid #f0d5a0; border-radius: 6px; font-size: 13px; line-height: 1.85; color: #7a5020; }
main.article .source-link { margin-top: 24px; padding: 16px 20px; background: #f0f4f8; border-radius: 6px; font-size: 13px; }
main.article .source-link a { color: #1a3a5c; font-weight: 700; word-break: break-all; }
main.article .article-cta { margin: 40px 0 0; padding: 32px 30px; background: linear-gradient(135deg, #1a3a5c 0%, #2c5282 100%); border-radius: 10px; text-align: center; color: white; }
main.article .article-cta h3 { color: white; margin: 0 0 12px; font-size: 19px; line-height: 1.5; }
main.article .article-cta p { color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.85; margin: 0 0 20px; text-align: center; }
main.article .article-cta .cta-btn { display: inline-block; background: #d35400; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 700; transition: background 0.2s, transform 0.2s; }
main.article .article-cta .cta-btn:hover { background: #b34700; transform: translateY(-2px); }
main.article .article-cta .cta-note { font-size: 12px; opacity: 0.75; margin-top: 14px; }
.back-link { display: inline-block; margin: 24px 0 0; color: #1a3a5c; text-decoration: none; font-size: 14px; font-weight: 600; }
.back-link:hover { text-decoration: underline; }

footer.site { background: #1a3a5c; color: rgba(255,255,255,0.85); padding: 28px 0; text-align: center; font-size: 13px; margin-top: 40px; }
footer.site p { margin: 6px 0; }

@media (max-width: 600px) {
  body { font-size: 15px; }
  header.article-head { padding: 36px 0 28px; }
  header.article-head h1 { font-size: 20px; }
  main.article { padding: 28px 22px; margin-top: -12px; }
  main.article h2 { font-size: 18px; }
  main.article h3 { font-size: 15px; }
  main.article .info-box dl { grid-template-columns: 1fr; gap: 4px 0; }
  main.article .info-box dt { margin-top: 8px; }
}'''


NAV_HTML = '''<nav class="site-nav">
  <div class="container">
    <a class="nav-logo" href="/">補助金情報フィード</a>
    <ul class="nav-links">
      <li><a href="/">トップ</a></li>
      <li><a href="/blog/">解説記事</a></li>
      <li><a href="/#download">無料ダウンロード</a></li>
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


def render_article(data, url_map):
    """parse_cache JSONから記事HTMLを生成"""
    name = data.get('name') or '（補助金名不明）'
    org = data.get('implementing_org') or ''
    purpose = data.get('purpose') or ''
    summary = data.get('summary') or ''
    subsidy_rate = data.get('subsidy_rate') or ''
    max_amount = data.get('max_amount')
    max_amount_str = format_amount(max_amount) or '（公募要領参照）'
    subsidy_types = data.get('subsidy_types') or ''
    application_start = data.get('application_start') or ''
    application_end = data.get('application_end') or ''
    project_period = data.get('project_period') or ''
    eligible_businesses = data.get('eligible_businesses') or []
    eligible_expenses = data.get('eligible_expenses') or []
    ineligible_items = data.get('ineligible_items') or []
    review_criteria = data.get('review_criteria') or []
    bonus_points = data.get('bonus_points') or []
    notes = data.get('notes') or []
    industries = data.get('industries') or []
    regions = data.get('regions') or []
    tags = data.get('tags') or []

    prefecture = get_primary_region(data)
    detail_url = find_detail_url(name, url_map)

    # リード文
    lead_parts = []
    if prefecture != '全国':
        lead_parts.append(f'{prefecture}では、')
    else:
        lead_parts.append('')
    if summary:
        lead_parts.append(summary)
    else:
        lead_parts.append(f'{name}が公募されています。')
    lead_text = ''.join(lead_parts)
    lead_text += '本記事では、制度の概要・補助率・対象経費・申請スケジュール・注意点までを公募要領ベースで整理してお届けします。'

    # infoボックス
    info_items = []
    if org:
        info_items.append(('実施機関', escape(org)))
    if regions:
        info_items.append(('対象地域', escape('、'.join(regions))))
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
    info_items.append(('補助上限額', escape(max_amount_str)))
    if subsidy_rate:
        info_items.append(('補助率', escape(subsidy_rate)))
    info_box_inner = '\n      '.join(
        f'<dt>{k}</dt><dd>{v}</dd>' for k, v in info_items
    )

    # タイトル下のサブタイトル（金額）
    h1_subline = ''
    if max_amount:
        h1_subline = f'    <p class="subtitle">最大{escape(max_amount_str)}</p>\n'

    # タグ行
    head_tags = []
    if prefecture != '全国':
        head_tags.append(prefecture)
    for t in tags[:4]:
        if t != prefecture:
            head_tags.append(t)
    tag_row_html = ''.join(
        f'<span class="tag">{escape(t)}</span>' for t in head_tags
    )

    # 本文セクション
    sections = []

    # 制度の目的と背景
    if purpose:
        sections.append(f'''  <h2>制度の目的と背景</h2>
  <p>{escape(purpose)}</p>''')

    # 補助率と上限額
    rate_section = []
    if subsidy_rate or max_amount or subsidy_types:
        rate_section.append('  <h2>補助率と上限額</h2>')
        intro = '本補助金の補助率と上限額は以下のとおりです。'
        if subsidy_types and len(subsidy_types) > 80:
            intro += '支援枠や取り組み内容によって金額が分かれているため、自社の計画に応じて確認が必要です。'
        rate_section.append(f'  <p>{escape(intro)}</p>')
        if subsidy_rate:
            rate_section.append(f'  <p>◼︎ 補助率<br>{escape(subsidy_rate)}</p>')
        if max_amount:
            rate_section.append(f'  <p>◼︎ 補助上限額<br>{escape(max_amount_str)}</p>')
        if subsidy_types:
            rate_section.append(f'  <p>◼︎ 内訳・支援枠<br>{escape(subsidy_types)}</p>')
        sections.append('\n'.join(rate_section))

    # 対象となる事業者
    if eligible_businesses:
        lis = '\n'.join(f'    <li>{escape(str(b))}</li>' for b in eligible_businesses)
        sections.append(f'''  <h2>対象となる事業者</h2>
  <p>本補助金の対象となる事業者は以下のとおりです。申請前に自社が要件を満たしているかご確認ください。</p>
  <ul>
{lis}
  </ul>''')

    # 対象経費
    if eligible_expenses:
        lis = '\n'.join(f'    <li>{escape(str(e))}</li>' for e in eligible_expenses)
        sections.append(f'''  <h2>対象経費</h2>
  <p>補助対象となる経費は以下のとおりです。公募要領で定める範囲を超える経費は対象外となるため、申請時には個別に確認してください。</p>
  <ul>
{lis}
  </ul>''')

    # 対象外の経費
    if ineligible_items:
        lis = '\n'.join(f'    <li>{escape(str(i))}</li>' for i in ineligible_items)
        sections.append(f'''  <h3>◼︎ 対象外となる経費・事項</h3>
  <ul>
{lis}
  </ul>''')

    # 申請スケジュール
    if application_start or application_end or project_period:
        parts = []
        if application_start and application_end:
            parts.append(f'受付期間は{escape(application_start)}から{escape(application_end)}までです。')
        elif application_end:
            parts.append(f'受付締切は{escape(application_end)}です。')
        if project_period:
            parts.append(f'事業実施期間は{escape(project_period)}となっています。')
        parts.append('スケジュールがタイトなため、検討中の事業者は早めに準備を始めることをおすすめします。')
        sections.append(f'''  <h2>申請スケジュール</h2>
  <p>{''.join(parts)}</p>''')

    # 審査のポイント
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
  <p>審査では、以下の観点から事業計画が評価されます。申請書の記載にあたっては、これらの項目を意識して具体的な内容を盛り込むことが重要です。</p>
  <ul>
{chr(10).join(crit_items)}
  </ul>''')

    # 加点項目
    if bonus_points:
        lis = '\n'.join(f'    <li>{escape(str(b))}</li>' for b in bonus_points)
        sections.append(f'''  <h3>◼︎ 加点項目</h3>
  <p>以下のいずれかに該当する事業者は、審査において加点の対象となります。</p>
  <ul>
{lis}
  </ul>''')

    # 注意点
    if notes:
        lis = '\n'.join(f'    <li>{escape(str(n))}</li>' for n in notes)
        sections.append(f'''  <h2>活用にあたっての注意点</h2>
  <p>本補助金を活用するにあたり、特に留意しておきたいポイントは以下のとおりです。</p>
  <ul>
{lis}
  </ul>''')

    body_html = '\n\n'.join(sections)

    # 情報源
    source_html = ''
    if detail_url:
        source_html = f'''  <div class="source-link">
    <strong>◼︎ 情報源</strong><br>
    掲載ページ：<a href="{escape(detail_url)}" target="_blank" rel="noopener">{escape(detail_url)}</a>
  </div>'''

    # お問い合わせCTA
    cta_html = '''  <div class="article-cta">
    <h3>補助金の申請・活用についてご相談はこちらから</h3>
    <p>「この補助金を自社で活用できるか知りたい」「申請書作成を任せたい」「他にどんな補助金が使えるか相談したい」など、お気軽にお問い合わせください。初回のご相談は無料です。</p>
    <a class="cta-btn" href="https://www.funnel-build.com/hojokin-contact-legacy2" target="_blank" rel="noopener">無料相談のお申し込み</a>
    <p class="cta-note">※本記事の内容についてのご質問もお受けしています</p>
  </div>'''

    # メタ
    meta_desc_parts = [name]
    if max_amount:
        meta_desc_parts.append(f'上限{max_amount_str}')
    if subsidy_rate:
        meta_desc_parts.append(f'補助率{subsidy_rate[:30]}')
    if application_end:
        meta_desc_parts.append(f'締切{application_end}')
    meta_desc = ' / '.join(meta_desc_parts)[:160]

    html = f'''<!DOCTYPE html>
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
    <p class="meta">{TODAY} 公開 / カテゴリ：補助金解説</p>
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

  <div class="disclaimer">
    ※本記事は、公開情報をもとに自動生成しています。補助金制度は予告なく内容が変更されることがあります。申請にあたっては、必ず実施機関が公表している最新の公募要領・様式をご確認ください。
  </div>

{source_html}

{cta_html}

  <a class="back-link" href="/">← 補助金情報フィード トップへ戻る</a>

</main>

{FOOTER_HTML}

</body>
</html>
'''
    return html


# ========== 記事カード生成 ==========
def render_card_for_list(data, filename, card_type='list'):
    """blog/index.html 用のカード"""
    name = data.get('name') or ''
    summary = data.get('summary') or ''
    max_amount = data.get('max_amount')
    max_amount_str = format_amount(max_amount) or '公募要領参照'
    subsidy_types = data.get('subsidy_types') or ''
    tags = data.get('tags') or []
    prefecture = get_primary_region(data)

    # カード用サマリを短縮
    short_summary = summary[:110] + ('…' if len(summary) > 110 else '')

    # 補助金種類サブタイトル
    amount_sub = ''
    if max_amount:
        amount_sub = '<small>補助上限</small>'

    tag_pills = ''.join(
        f'<span class="blog-card-tag">{escape(t)}</span>' for t in tags[:3]
    )

    data_tags = ','.join(tags + [prefecture])

    return f'''    <article class="blog-card" data-tags="{escape(data_tags)}">
      <a href="/blog/{escape(filename)}">
        <div class="blog-card-head">
          <span class="blog-card-region">{escape(prefecture)}</span>
          <p class="blog-card-amount">{escape(max_amount_str)}{amount_sub}</p>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-tags">
            {tag_pills}
          </div>
          <h2>{escape(name)}</h2>
          <p>{escape(short_summary)}</p>
          <div class="blog-card-meta">
            <span>{TODAY}</span>
            <span class="blog-card-read">続きを読む →</span>
          </div>
        </div>
      </a>
    </article>'''


def render_card_for_top(data, filename):
    """index.html トップ用のコンパクトなカード"""
    name = data.get('name') or ''
    summary = data.get('summary') or ''
    max_amount = data.get('max_amount')
    max_amount_str = format_amount(max_amount) or '公募要領参照'
    prefecture = get_primary_region(data)

    short_summary = summary[:90] + ('…' if len(summary) > 90 else '')

    amount_sub = ''
    if max_amount:
        amount_sub = '<small>補助上限</small>'

    return f'''    <article class="blog-top-card">
      <a href="/blog/{escape(filename)}">
        <div class="blog-top-card-head">
          <span class="blog-top-card-region">{escape(prefecture)}</span>
          <p class="blog-top-card-amount">{escape(max_amount_str)}{amount_sub}</p>
        </div>
        <div class="blog-top-card-body">
          <h3>{escape(name)}</h3>
          <p>{escape(short_summary)}</p>
          <p class="blog-top-card-read">続きを読む →</p>
        </div>
      </a>
    </article>'''


# ========== メイン処理 ==========
def main():
    print(f'Blog build start: {TODAY}')
    print(f'Parse cache: {PARSE_CACHE_DIR}')
    print(f'Blog dir:    {BLOG_DIR}')

    os.makedirs(BLOG_DIR, exist_ok=True)

    url_map = build_detail_url_map(SUBSIDIES_JSON)
    print(f'detail_url map: {len(url_map)}')

    # parse_cacheから全件読み込み
    files = sorted(os.listdir(PARSE_CACHE_DIR))
    records = []
    filtered_out = 0
    for fn in files:
        with open(os.path.join(PARSE_CACHE_DIR, fn)) as f:
            data = json.load(f)
        name = data.get('name') or ''
        if not is_valid_subsidy_name(name):
            filtered_out += 1
            continue
        records.append((fn, data))
    print(f'parse_cache records: {len(records)} (filtered out: {filtered_out})')

    # スラッグ生成 → ファイル名決定
    used_slugs = {}
    articles = []  # (filename, data)
    for fn, data in records:
        prefecture = get_primary_region(data)
        base_slug = slug_for(prefecture, used_slugs)
        filename = f'{TODAY}-{base_slug}.html'
        articles.append((filename, data))

    # 既存保護記事を追加（最初の大分県記事）
    for protected_name in PROTECTED:
        protected_path = os.path.join(BLOG_DIR, protected_name)
        if os.path.exists(protected_path):
            # 既存ファイルをそのまま保持し、リストには parse_cache から該当データで追加
            for fn, data in records:
                if '大分県ものづくり循環経済' in (data.get('name') or ''):
                    # 保護記事をリストに入れる（データは使うがファイルは上書きしない）
                    articles.append((protected_name, data))
                    break

    # 重複除去（同一ファイル名）
    seen = set()
    deduped = []
    for fn, d in articles:
        if fn in seen:
            continue
        seen.add(fn)
        deduped.append((fn, d))
    articles = deduped

    # 記事HTML生成
    generated = 0
    skipped = 0
    for filename, data in articles:
        if filename in PROTECTED:
            skipped += 1
            continue
        html = render_article(data, url_map)
        out_path = os.path.join(BLOG_DIR, filename)
        with open(out_path, 'w') as f:
            f.write(html)
        generated += 1
    print(f'articles generated: {generated}, protected: {skipped}')

    # 日付文字列パースのため、articles は生成順（既に地域順）
    # blog/index.html を再生成
    cards_list = [render_card_for_list(d, fn) for fn, d in articles]
    blog_index_html = build_blog_index_html(cards_list, len(articles))
    with open(BLOG_INDEX_HTML, 'w') as f:
        f.write(blog_index_html)
    print(f'blog/index.html regenerated: {len(cards_list)} cards')

    # 保護記事を先頭に、残りから TOP_LATEST_N 件をトップに載せる
    top_articles = []
    # 保護記事を先頭に
    for fn, d in articles:
        if fn in PROTECTED:
            top_articles.append((fn, d))
    for fn, d in articles:
        if fn in PROTECTED:
            continue
        if len(top_articles) >= TOP_LATEST_N:
            break
        top_articles.append((fn, d))

    top_cards = [render_card_for_top(d, fn) for fn, d in top_articles]
    update_top_page(top_cards, len(articles))
    print(f'top index.html updated: {len(top_cards)} cards')

    print('Blog build done.')


def build_blog_index_html(cards, total):
    """blog/index.html の全体を生成"""
    cards_html = '\n\n'.join(cards)
    return f'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>補助金解説記事一覧｜補助金情報フィード</title>
<meta name="description" content="全国の補助金・助成金を公募要領ベースでわかりやすく解説した記事一覧。{total}件の解説記事を公開中。">
<link rel="canonical" href="https://hojokin.well-c.biz/blog/">
<style>
* {{ box-sizing: border-box; }}
html {{ scroll-behavior: smooth; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic UI", sans-serif; margin: 0; background: #f5f7fa; color: #1a1a1a; line-height: 1.7; }}
a {{ color: #1a3a5c; }}
.container {{ max-width: 1100px; margin: 0 auto; padding: 0 20px; }}

nav.site-nav {{ background: #1a3a5c; padding: 14px 0; }}
.nav-inner {{ display: flex; align-items: center; justify-content: space-between; }}
.nav-logo {{ color: white; text-decoration: none; font-weight: 700; font-size: 15px; }}
.nav-links {{ list-style: none; display: flex; gap: 24px; padding: 0; margin: 0; align-items: center; text-align: left; }}
.nav-links li {{ margin: 0; }}
.nav-links a {{ color: rgba(255,255,255,0.85); text-decoration: none; font-size: 14px; padding: 8px 0; transition: color 0.2s; }}
.nav-links a:hover {{ color: white; }}
.nav-cta {{ background: #d35400; color: white !important; padding: 10px 18px !important; border-radius: 6px; font-weight: 600; transition: background 0.2s; }}
.nav-cta:hover {{ background: #b34700; }}

header.page-head {{ background: linear-gradient(135deg, #1a3a5c 0%, #2c5282 100%); color: white; padding: 56px 0 44px; }}
header.page-head h1 {{ margin: 0 0 12px; font-size: 28px; font-weight: 700; letter-spacing: 0.02em; }}
header.page-head p {{ margin: 0; opacity: 0.9; font-size: 15px; line-height: 1.85; max-width: 760px; }}

main.container {{ padding-top: 40px; padding-bottom: 60px; }}

.blog-search {{ margin: 0 0 20px; }}
.blog-search input {{ width: 100%; padding: 14px 18px; border: 1px solid #d4dae2; border-radius: 8px; font-size: 14px; background: white; }}
.blog-search input:focus {{ outline: none; border-color: #1a3a5c; box-shadow: 0 0 0 3px rgba(26,58,92,0.12); }}

.blog-filters {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 28px; }}
.blog-filter {{ background: white; border: 1px solid #e4e9ef; color: #1a3a5c; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 999px; cursor: pointer; transition: all 0.2s; }}
.blog-filter:hover {{ background: #f0f4f8; }}
.blog-filter.active {{ background: #1a3a5c; color: white; border-color: #1a3a5c; }}

.blog-count {{ font-size: 13px; color: #666; margin: 0 0 20px; text-align: left; }}

.blog-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }}
.blog-card {{ background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(26,58,92,0.06); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }}
.blog-card:hover {{ transform: translateY(-3px); box-shadow: 0 8px 20px rgba(26,58,92,0.12); }}
.blog-card a {{ text-decoration: none; color: #1a1a1a; display: flex; flex-direction: column; height: 100%; }}
.blog-card-head {{ background: linear-gradient(135deg, #1a3a5c 0%, #2c5282 100%); color: white; padding: 20px 22px; }}
.blog-card-region {{ display: inline-block; background: rgba(255,255,255,0.18); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.04em; margin-bottom: 10px; }}
.blog-card-amount {{ font-size: 20px; font-weight: 700; margin: 0; }}
.blog-card-amount small {{ font-size: 12px; opacity: 0.85; font-weight: 500; display: block; margin-top: 2px; }}
.blog-card-body {{ padding: 20px 22px; flex: 1; display: flex; flex-direction: column; }}
.blog-card-body h2 {{ font-size: 16px; line-height: 1.55; margin: 0 0 10px; color: #1a3a5c; font-weight: 700; text-align: left; }}
.blog-card-body p {{ font-size: 13px; line-height: 1.85; color: #555; margin: 0 0 14px; text-align: left; flex: 1; }}
.blog-card-meta {{ display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #888; border-top: 1px solid #eef1f5; padding-top: 12px; }}
.blog-card-tags {{ display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }}
.blog-card-tag {{ background: #f5f7fa; color: #1a3a5c; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }}
.blog-card-read {{ color: #d35400; font-weight: 700; }}

.empty-state {{ background: white; border-radius: 10px; padding: 60px 30px; text-align: center; color: #888; font-size: 14px; display: none; }}
.empty-state.visible {{ display: block; }}

footer.site {{ background: #1a3a5c; color: rgba(255,255,255,0.85); padding: 28px 0; text-align: center; font-size: 13px; }}
footer.site p {{ margin: 6px 0; }}

@media (max-width: 600px) {{
  header.page-head {{ padding: 36px 0 28px; }}
  header.page-head h1 {{ font-size: 22px; }}
  header.page-head p {{ font-size: 13px; }}
  .blog-grid {{ grid-template-columns: 1fr; gap: 16px; }}
  .nav-inner {{ flex-wrap: wrap; gap: 12px; justify-content: center; }}
  .nav-logo {{ flex-basis: 100%; text-align: center; }}
  .nav-links {{ gap: 14px; flex-wrap: wrap; justify-content: center; }}
}}
</style>
</head>
<body>

<nav class="site-nav">
  <div class="container nav-inner">
    <a class="nav-logo" href="/">補助金情報フィード</a>
    <ul class="nav-links">
      <li><a href="/">トップ</a></li>
      <li><a href="/blog/">解説記事</a></li>
      <li><a href="/#download">無料ダウンロード</a></li>
      <li><a href="/archive/">アーカイブ</a></li>
      <li><a class="nav-cta" href="https://www.funnel-build.com/hojokin-contact-legacy2" target="_blank" rel="noopener">お問い合わせ</a></li>
    </ul>
  </div>
</nav>

<header class="page-head">
  <div class="container">
    <h1>補助金解説記事</h1>
    <p>公募要領ベースで、中小企業経営者・士業・コンサルタントの方向けに補助金の概要・対象・金額・申請方法をわかりやすく解説した記事一覧です。現在{total}件を公開しています。</p>
  </div>
</header>

<main class="container">

  <div class="blog-search">
    <input type="text" id="blog-search-input" placeholder="キーワード検索（補助金名・地域・業種など）">
  </div>

  <div class="blog-filters">
    <button class="blog-filter active" data-filter="all">すべて</button>
    <button class="blog-filter" data-filter="設備投資">設備投資</button>
    <button class="blog-filter" data-filter="研究開発">研究開発</button>
    <button class="blog-filter" data-filter="人材育成">人材育成</button>
    <button class="blog-filter" data-filter="DX">DX・デジタル</button>
    <button class="blog-filter" data-filter="環境">環境対応</button>
    <button class="blog-filter" data-filter="創業">創業</button>
    <button class="blog-filter" data-filter="事業承継">事業承継</button>
    <button class="blog-filter" data-filter="販路開拓">販路開拓</button>
  </div>

  <p class="blog-count"><span id="visible-count">{total}</span>件の解説記事</p>

  <div class="blog-grid" id="blog-grid">

{cards_html}

  </div>

  <div class="empty-state" id="empty-state">
    該当する記事が見つかりませんでした。キーワードやフィルタを変更してお試しください。
  </div>

  <a href="/" style="display:inline-block;margin-top:36px;color:#1a3a5c;text-decoration:none;font-weight:600;font-size:14px;">← 補助金情報フィード トップへ戻る</a>

</main>

<footer class="site">
  <div class="container">
    <p>本サイトは公的機関が公開している補助金情報を自動収集しています。</p>
    <p>最新・正確な情報は必ず各補助金の公式ページでご確認ください。</p>
    <p>&copy; Well Consultant</p>
  </div>
</footer>

<script>
(function() {{
  var buttons = document.querySelectorAll('.blog-filter');
  var cards = document.querySelectorAll('.blog-card');
  var countEl = document.getElementById('visible-count');
  var emptyEl = document.getElementById('empty-state');
  var searchEl = document.getElementById('blog-search-input');
  var currentFilter = 'all';
  var currentQuery = '';

  function applyFilters() {{
    var visible = 0;
    cards.forEach(function(card) {{
      var tags = (card.dataset.tags || '').toLowerCase();
      var text = card.textContent.toLowerCase();
      var matchFilter = (currentFilter === 'all' || tags.indexOf(currentFilter.toLowerCase()) !== -1);
      var matchQuery = (!currentQuery || text.indexOf(currentQuery) !== -1 || tags.indexOf(currentQuery) !== -1);
      if (matchFilter && matchQuery) {{
        card.style.display = '';
        visible++;
      }} else {{
        card.style.display = 'none';
      }}
    }});
    countEl.textContent = visible;
    if (visible === 0) {{
      emptyEl.classList.add('visible');
    }} else {{
      emptyEl.classList.remove('visible');
    }}
  }}

  buttons.forEach(function(btn) {{
    btn.addEventListener('click', function() {{
      buttons.forEach(function(b) {{ b.classList.remove('active'); }});
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    }});
  }});

  searchEl.addEventListener('input', function() {{
    currentQuery = searchEl.value.trim().toLowerCase();
    applyFilters();
  }});
}})();
</script>

</body>
</html>
'''


def update_top_page(top_cards, total):
    """トップページ index.html の「詳しく解説した記事」セクションを更新"""
    with open(TOP_INDEX_HTML) as f:
        html = f.read()

    cards_html = '\n\n'.join(top_cards)
    new_section = f'''<section class="section blog-section" id="blog-latest">
  <h2 class="section-title">
    <span>詳しく解説した記事 <span class="badge">{total}件</span></span>
    <a class="blog-section-more" href="/blog/">すべての記事を見る →</a>
  </h2>
  <p class="blog-section-note">公募要領をベースに、補助金の概要・対象・金額・申請方法をわかりやすく解説しています。中小企業経営者・士業・コンサルタントの方の情報収集にご活用ください。</p>
  <div class="blog-top-grid">

{cards_html}

  </div>
</section>'''

    # 既存のblog-sectionを置換
    pattern = re.compile(
        r'<section class="section blog-section" id="blog-latest">.*?</section>',
        re.DOTALL,
    )
    if pattern.search(html):
        html = pattern.sub(new_section, html, count=1)
    else:
        # 未挿入の場合：本日の新着セクション直後に挿入
        marker = '</section>\n\n<section class="section">\n  <h2 class="section-title">当サイトに収録している公募中の補助金'
        replacement = f'</section>\n\n{new_section}\n\n<section class="section">\n  <h2 class="section-title">当サイトに収録している公募中の補助金'
        html = html.replace(marker, replacement, 1)

    with open(TOP_INDEX_HTML, 'w') as f:
        f.write(html)


if __name__ == '__main__':
    main()
