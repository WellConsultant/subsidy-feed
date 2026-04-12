#!/usr/bin/env python3
"""全ページにナビ・CTA・フッターを一括注入するスクリプト。

対象:
  - archive/index.html, archive/2026-*.html
  - blog/index.html
  - blog/main/*.html
  - about/index.html

処理:
  1. 既存の <nav class="site-nav">...</nav> を共通ナビで置換
  2. 既存の <footer class="site">...</footer> を共通フッターで置換
  3. </main> または </body> の直前に CTAエリア（ダウンロード＋診断＋相談）を挿入
  4. </body> 直前に LINEモーダル＋JSを挿入
  5. <head> に common.css の <link> と Typeform script を挿入
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

# ---- index.html から共通パーツを抽出 ----
src = INDEX.read_text(encoding="utf-8")

def extract(pattern, text, flags=re.DOTALL):
    m = re.search(pattern, text, flags)
    if not m:
        raise RuntimeError(f"Pattern not found: {pattern[:60]}")
    return m.group(0)

NAV_HTML = extract(r'<nav class="site-nav">.*?</nav>', src)
FOOTER_HTML = extract(r'<footer class="site">.*?</footer>', src)
DOWNLOAD_SECTION = extract(r'<section class="section download-section".*?</section>\s*(?=<section)', src)
SHINDAN_SECTION = extract(r'<section class="section shindan-section".*?</section>\s*(?=<section)', src)
SOUDAN_SECTION = extract(r'<section class="cta-section" id="soudan">.*?</section>', src)
MODAL_HTML = extract(r'<!-- LINE受け取りモーダル -->.*?</div>\s*</div>\s*</div>', src)
MODAL_JS = extract(r'<script>\s*\(function\(\)\{\s*var overlay = document\.getElementById\(\'lineModalOverlay\'\).*?</script>', src)

CTA_AREA = f'''
<!-- ========= 共通CTAエリア ========= -->
<div class="common-cta-area">
  <div class="common-wide">
    {DOWNLOAD_SECTION.strip()}
    {SHINDAN_SECTION.strip()}
    {SOUDAN_SECTION.strip()}
  </div>
</div>
<!-- ========= /共通CTAエリア ========= -->
'''

COMMON_CSS_LINK = '<link rel="stylesheet" href="/assets/common.css">'
TYPEFORM_SCRIPT = '<script src="//embed.typeform.com/next/embed.js" defer></script>'
GTAG_SNIPPET = '''<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CKY4MXRRK0"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-CKY4MXRRK0');</script>'''
ANALYTICS_SCRIPT = '<script src="/assets/analytics.js" defer></script>'

# ---- 対象ファイル収集 ----
targets = []
targets.extend(sorted((ROOT / "archive").glob("*.html")))
targets.append(ROOT / "blog" / "index.html")
targets.extend(sorted((ROOT / "blog" / "main").glob("*.html")))
targets.append(ROOT / "about" / "index.html")
targets = [t for t in targets if t.exists()]


def inject(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")
    original = html

    # 1) common.css link 追加（既に含まれていれば skip）
    if COMMON_CSS_LINK not in html:
        html = html.replace('</head>', f'  {COMMON_CSS_LINK}\n</head>', 1)

    # 2) Typeform script 追加（既に含まれていれば skip）
    if 'embed.typeform.com/next/embed.js' not in html:
        html = html.replace('</head>', f'  {TYPEFORM_SCRIPT}\n</head>', 1)

    # 2b) GA4 gtag 追加（既に含まれていれば skip）
    if 'G-CKY4MXRRK0' not in html:
        html = html.replace('</head>', f'  {GTAG_SNIPPET}\n</head>', 1)

    # 3) 既存ナビを共通ナビで置換
    nav_pattern = re.compile(r'<nav class="site-nav">.*?</nav>', re.DOTALL)
    if nav_pattern.search(html):
        html = nav_pattern.sub(NAV_HTML, html, count=1)
    else:
        # ナビがない場合は <body> 直後に挿入
        html = re.sub(r'(<body[^>]*>)', r'\1\n' + NAV_HTML, html, count=1)

    # 4) 既存のCTAエリアを除去（重複防止）
    html = re.sub(r'<!-- ========= 共通CTAエリア =========.*?<!-- ========= /共通CTAエリア ========= -->\n?', '', html, flags=re.DOTALL)

    # 5) 既存フッターを共通フッターで置換。なければ </body> 直前に挿入
    footer_pattern = re.compile(r'<footer class="site">.*?</footer>', re.DOTALL)
    if footer_pattern.search(html):
        html = footer_pattern.sub(FOOTER_HTML, html, count=1)
    else:
        html = html.replace('</body>', f'\n{FOOTER_HTML}\n</body>', 1)

    # 6) CTAエリアを </main> 直前に挿入（なければ <footer> 直前）
    if re.search(r'</main>', html):
        html = re.sub(r'(</main>)', CTA_AREA + r'\1', html, count=1)
    else:
        html = re.sub(r'(<footer class="site">)', CTA_AREA + r'\1', html, count=1)

    # 7) 既存のLINEモーダルを除去
    html = re.sub(r'<!-- LINE受け取りモーダル -->.*?</div>\s*</div>\s*</div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<script>\s*\(function\(\)\{\s*var overlay = document\.getElementById\(\'lineModalOverlay\'\).*?</script>', '', html, flags=re.DOTALL)

    # 8) LINEモーダル＋JSを </body> 直前に挿入
    html = html.replace('</body>', f'\n{MODAL_HTML}\n\n{MODAL_JS}\n\n</body>', 1)

    # 9) analytics.js 追加（既に含まれていれば skip）
    if 'analytics.js' not in html:
        html = html.replace('</body>', f'{ANALYTICS_SCRIPT}\n</body>', 1)

    if html != original:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def main():
    changed = 0
    for t in targets:
        try:
            if inject(t):
                print(f"  [updated] {t.relative_to(ROOT)}")
                changed += 1
            else:
                print(f"  [skip]    {t.relative_to(ROOT)}")
        except Exception as e:
            print(f"  [error]   {t.relative_to(ROOT)}: {e}")
    print(f"\n{changed} / {len(targets)} files updated.")


if __name__ == "__main__":
    main()
