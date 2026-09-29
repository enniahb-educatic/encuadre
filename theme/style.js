/* Tramas · Género 1.1.0. Navegación y movimiento para eXeLearning 4.0.
 * No sustituye los controles ni la lógica de las actividades de eXeLearning. */
(function () {
  'use strict';
  function motion() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var observer;
    function start() {
      if (observer) observer.disconnect();
      document.body.classList.toggle('tramas-motion', !reduced.matches);
      document.querySelectorAll('.tramas-enter').forEach(function (item) {
        item.classList.remove('tramas-enter');
      });
      if (reduced.matches || !('IntersectionObserver' in window)) return;
      var cards = 0;
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var item = entry.target;
          observer.unobserve(item);
          if (item.dataset.tramasSeen) return;
          item.dataset.tramasSeen = 'true';
          item.classList.add('tramas-enter');
          function done(event) {
            if (event.target !== item) return;
            item.classList.remove('tramas-enter');
            item.removeEventListener('animationend', done);
            item.removeEventListener('animationcancel', done);
          }
          item.addEventListener('animationend', done);
          item.addEventListener('animationcancel', done);
        });
      }, { threshold: 0, rootMargin: '0px 0px -16px 0px' });
      document.querySelectorAll('.exe-content .box, .exe-content .tramas-tarjeta').forEach(function (item) {
        if (item.classList.contains('tramas-tarjeta')) {
          item.style.setProperty('--tramas-delay', ((cards++ % 3) * 90 + 100) + 'ms');
        } else item.style.setProperty('--tramas-delay', '80ms');
        observer.observe(item);
      });
    }
    start();
    if (reduced.addEventListener) reduced.addEventListener('change', start);
  }
  function ready() {
    var body = document.body;
    if (!body.classList.contains('exe-export')) return;
    motion();
    try { if (window.self !== window.top) body.classList.add('in-iframe'); }
    catch (e) { body.classList.add('in-iframe'); }
    if (!body.classList.contains('exe-web-site')) return;
    var nav = document.getElementById('siteNav');
    if (!nav || document.getElementById('siteNavToggler')) return;
    var labels = window.$exe_i18n || {};
    var narrow = window.matchMedia('(max-width: 760px)');
    var query = new URLSearchParams(window.location.search);
    var collapsed = query.has('nav') ? query.get('nav') === 'false' : narrow.matches;
    var toggle = document.createElement('button');
    toggle.type = 'button'; toggle.id = 'siteNavToggler'; toggle.className = 'toggler';
    toggle.title = labels.menu || 'Menú';
    toggle.setAttribute('aria-label', labels.menu || 'Menú');
    toggle.setAttribute('aria-controls', 'siteNav');
    nav.before(toggle);
    function updateLinks() {
      document.querySelectorAll('.nav-buttons a, #siteNav a').forEach(function (link) {
        var original = link.getAttribute('href');
        if (!original || original[0] === '#' || /^(javascript|mailto|tel):/i.test(original)) return;
        try {
          var url = new URL(original, window.location.href);
          if (url.origin !== window.location.origin) return;
          if (collapsed) url.searchParams.set('nav', 'false');
          else url.searchParams.delete('nav');
          link.href = url.href;
        } catch (e) { /* Mantener el enlace original si no se puede resolver. */ }
      });
    }
    function setMenu(value) {
      var wasCollapsed = collapsed;
      collapsed = value;
      body.classList.toggle('siteNav-off', collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
      nav.classList.remove('tramas-menu-opening');
      if (wasCollapsed && !collapsed && body.classList.contains('tramas-motion')) {
        // Restart only on opening; do not retain a transform after the animation.
        void nav.offsetWidth;
        nav.classList.add('tramas-menu-opening');
      }
      updateLinks();
    }
    setMenu(collapsed);
    toggle.addEventListener('click', function () { setMenu(!collapsed); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !collapsed && nav.contains(document.activeElement)) {
        setMenu(true); toggle.focus();
      }
    });
    var search = document.getElementById('exe-client-search');
    if (search && body.classList.contains('exe-search-on')) {
      var button = document.createElement('button');
      button.type = 'button'; button.id = 'searchBarTogger'; button.className = 'toggler';
      button.title = labels.search || 'Buscar';
      button.setAttribute('aria-label', labels.search || 'Buscar');
      button.setAttribute('aria-controls', 'exe-client-search');
      button.setAttribute('aria-expanded', 'false');
      nav.before(button);
      button.addEventListener('click', function () {
        var show = getComputedStyle(search).display === 'none';
        search.style.display = show ? 'block' : 'none';
        button.setAttribute('aria-expanded', String(show));
        if (show) {
          if (narrow.matches) setMenu(true);
          var field = document.getElementById('exe-client-search-text');
          if (field) { field.classList.add('form-control'); field.focus(); }
        }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
}());
