/* 侧边栏增强：超长条目悬停提示 + 折叠/展开切换 */
(function () {
  var KEY = 'side-nav-collapsed';

  document.addEventListener('DOMContentLoaded', function () {
    // ── 超长条目：悬停显示完整名称 ──
    var selector = [
      '.terminal-mkdocs-side-nav-item',
      '.terminal-mkdocs-side-nav-item--active',
      '.terminal-mkdocs-side-nav-section-no-index',
      '.side-nav-details > summary',
    ].join(',');
    document.querySelectorAll(selector).forEach(function (el) {
      var text = (el.textContent || '').trim();
      if (text && !el.hasAttribute('title')) {
        el.setAttribute('title', text);
      }
    });

    // ── 折叠/展开按钮 ──
    var grid = document.querySelector('.terminal-mkdocs-main-grid');
    if (!grid || !document.getElementById('terminal-mkdocs-side-panel')) return;

    var btn = document.createElement('button');
    btn.id = 'side-nav-toggle';
    btn.type = 'button';
    document.body.appendChild(btn);

    function apply(collapsed) {
      document.body.classList.toggle('side-nav-collapsed', collapsed);
      btn.textContent = collapsed ? '»' : '«';
      btn.title = collapsed ? '显示侧边栏' : '折叠侧边栏';
      try {
        localStorage.setItem(KEY, collapsed ? '1' : '0');
      } catch (e) { /* ignore */ }
    }

    var collapsed = false;
    try {
      collapsed = localStorage.getItem(KEY) === '1';
    } catch (e) { /* ignore */ }
    apply(collapsed);

    btn.addEventListener('click', function () {
      apply(!document.body.classList.contains('side-nav-collapsed'));
    });
  });
})();
