#!/usr/bin/env python3
"""重複した共通CTAエリアをクリーンアップし、正しく1つだけ残す。

ロジック:
  - すべての <!-- 共通CTAエリア --> 開始コメント〜対応する終了位置までを削除
  - その後 inject_common.py を再実行することで1つだけ再配置される想定
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

targets = []
targets.extend(sorted((ROOT / "archive").glob("*.html")))
targets.append(ROOT / "blog" / "index.html")
targets.extend(sorted((ROOT / "blog" / "main").glob("*.html")))
targets.append(ROOT / "about" / "index.html")
targets = [t for t in targets if t.exists()]


def cleanup(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")
    original = html

    # まず正常な閉じタグつきブロックを全削除
    html = re.sub(
        r'<!-- ========= 共通CTAエリア =========.*?<!-- ========= /共通CTAエリア ========= -->\n?',
        '', html, flags=re.DOTALL
    )

    # 次に閉じタグなしで残った旧CTAブロック（`<div class="common-cta-area">...</div>` まで）を削除
    # 旧ブロック構造: <!-- 共通CTAエリア --> <div class="common-cta-area"> <div class="common-wide"> 3 sections </div> </div>
    html = re.sub(
        r'<!-- ========= 共通CTAエリア =========[^\n]*\n\s*<div class="common-cta-area">\s*<div class="common-wide">.*?</section>\s*</div>\s*</div>\n?',
        '', html, flags=re.DOTALL
    )

    if html != original:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def main():
    changed = 0
    for t in targets:
        if cleanup(t):
            print(f"  [cleaned] {t.relative_to(ROOT)}")
            changed += 1
    print(f"\n{changed} files cleaned.")


if __name__ == "__main__":
    main()
