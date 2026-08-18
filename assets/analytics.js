/* fp-1.info/hojokin-feed GA4 カスタムイベントトラッキング */
(function () {
  'use strict';
  if (!document.getElementById('traingo-embed')) {
    var contact = document.createElement('section');
    contact.id = 'site-contact-form';
    contact.style.cssText = 'max-width:600px;margin:56px auto 0;padding:28px;background:#fff;border:1px solid #ddd;border-radius:6px;';
    contact.innerHTML = '<h2 style="margin:0 0 8px;font-size:22px;">お問い合わせ</h2><p style="margin:0 0 18px;color:#666;">補助金についてのご相談はこちらからお問い合わせください。</p><iframe id="traingo-embed" src="https://lp2.well-c.biz/f/form-jq8c?embed=1" title="お問い合わせフォーム" width="100%" frameborder="0" scrolling="no" style="border:0;background:transparent;max-width:560px;display:block;margin:0 auto;height:600px;min-height:600px"></iframe>';
    var footer = document.querySelector('footer.site');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(contact, footer);
    else document.body.appendChild(contact);
    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://lp2.well-c.biz') return;
      if (e.data && e.data.type === 'traingo:resize' && e.data.height) {
        var iframe = document.getElementById('traingo-embed');
        if (iframe) { iframe.style.height = e.data.height + 'px'; iframe.style.minHeight = '0'; }
      }
    });
  }
  if (typeof gtag !== 'function') return;

  /* ---- ページ種別の自動判定 ---- */
  var path = location.pathname;
  var pageType = 'other';
  if (path === '/' || path === '/index.html') pageType = 'top';
  else if (path === '/blog/' || path === '/blog/index.html') pageType = 'article_index';
  else if (path.indexOf('/blog/') === 0) pageType = 'article';
  else if (path.indexOf('/archive/') === 0) pageType = 'archive';
  else if (path.indexOf('/about/') === 0) pageType = 'about';
  else if (path.indexOf('/gkc-dashboard') === 0) pageType = 'dashboard';

  /* ---- 拡張ページビュー ---- */
  gtag('event', 'page_view_enhanced', { page_type: pageType });

  /* ---- スクロール深度 (25/50/75/100%) ---- */
  var scrollFired = {};
  var thresholds = [25, 50, 75, 100];
  function getScrollPercent() {
    var h = document.documentElement;
    var b = document.body;
    var st = window.pageYOffset || h.scrollTop || b.scrollTop || 0;
    var sh = Math.max(h.scrollHeight, b.scrollHeight) - Math.max(h.clientHeight, b.clientHeight);
    return sh > 0 ? Math.round((st / sh) * 100) : 0;
  }
  window.addEventListener('scroll', function () {
    var pct = getScrollPercent();
    thresholds.forEach(function (t) {
      if (pct >= t && !scrollFired[t]) {
        scrollFired[t] = true;
        gtag('event', 'scroll_depth', { percent: String(t), page_type: pageType, threshold: String(t) });
      }
    });
  }, { passive: true });

  /* ---- 滞在時間 (30s / 60s / 180s) ---- */
  var timeFired = {};
  [[30, '30s'], [60, '1m'], [180, '3m']].forEach(function (pair) {
    setTimeout(function () {
      if (!timeFired[pair[0]]) {
        timeFired[pair[0]] = true;
        gtag('event', 'time_on_page', { stay_seconds: String(pair[0]), page_type: pageType, threshold: pair[1] });
      }
    }, pair[0] * 1000);
  });

  /* ---- 記事読了 (記事ページで60秒以上滞在) ---- */
  if (pageType === 'article') {
    setTimeout(function () {
      gtag('event', 'article_read_complete', { page_type: pageType });
    }, 60000);
  }

  /* ---- CTAクリック ---- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var text = (el.textContent || '').trim().substring(0, 60);
    var classes = el.className || '';

    // CTAボタン判定
    if (classes.indexOf('cta-btn') !== -1 || classes.indexOf('nav-cta') !== -1 ||
        classes.indexOf('cta-button') !== -1 || classes.indexOf('shindan-btn') !== -1 ||
        el.closest('.article-cta') || el.closest('.cta-section') ||
        el.closest('.download-card') || el.closest('.shindan-section')) {
      gtag('event', 'cta_click', { cta_label: text, link_url: href, page_type: pageType });
    }

    // ダウンロードリンク
    if (href.match(/\.(xlsx|pdf|csv|zip)(\?|$)/i) || el.closest('.download-section')) {
      gtag('event', 'download_click', { link_url: href, cta_label: text, page_type: pageType });
    }

    // 外部リンク
    if (el.hostname && el.hostname !== location.hostname) {
      gtag('event', 'outbound_click', { link_url: href, cta_label: text, page_type: pageType });
    }

    // 内部遷移（ページ種別の変化を追跡）
    if (el.hostname === location.hostname || !el.hostname) {
      var toPath = href.replace(/https?:\/\/[^/]+/, '');
      var toType = 'other';
      if (toPath === '/' || toPath === '/index.html') toType = 'top';
      else if (toPath === '/blog/' || toPath === '/blog/index.html') toType = 'article_index';
      else if (toPath.indexOf('/blog/') === 0) toType = 'article';
      else if (toPath.indexOf('/archive/') === 0) toType = 'archive';
      else if (toPath.indexOf('/about/') === 0) toType = 'about';
      if (toType !== pageType && toType !== 'other') {
        gtag('event', 'internal_nav', { from_type: pageType, to_type: toType, page_type: pageType });
      }
    }
  });

  /* ---- ページ離脱時の滞在秒数 ---- */
  var pageStart = Date.now();
  function sendExit() {
    var sec = Math.round((Date.now() - pageStart) / 1000);
    if (navigator.sendBeacon) {
      gtag('event', 'page_exit', { stay_seconds: String(sec), page_type: pageType });
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendExit();
  });
})();
