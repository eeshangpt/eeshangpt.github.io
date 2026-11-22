// Small progressive enhancements. Every page works without this file.
// Loaded in the head (not deferred) so the `js` class is set before the first paint; the rest waits for the DOM.
(function () {
  var d = document;
  d.documentElement.classList.add('js');

  // /about/ is a 301 to /?from=about (see _redirects). Map the old About fragments to the home page's
  // sections and drop the marker from the address before anything else reads it.
  var aboutTarget = null;
  if (/[?&]from=about(&|$)/.test(location.search)) {
    var map = { '#experience': '#background', '#projects': '#background', '#skills': '#background' };
    aboutTarget = map[location.hash] || (location.hash && location.hash.length > 1 ? location.hash : '#about');
    try { history.replaceState(null, '', location.pathname + aboutTarget); } catch (e) {}
  }

  function samePage(a) {
    try { return new URL(a.getAttribute('href'), location.href).pathname === location.pathname; } catch (e) { return false; }
  }

  function init() {
    // Home: on phones the four story cards collapse behind a button; links to #stories or #results open them first.
    var box = d.getElementById('stories');
    var btn = d.querySelector('[data-stories-toggle]');
    function setOpen(open) {
      if (!box) return;
      box.classList.toggle('is-open', open);
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function openFor(hash) { if (hash === '#stories' || hash === '#results') setOpen(true); }
    if (btn && box) btn.addEventListener('click', function () { setOpen(!box.classList.contains('is-open')); });
    if (location.hash === '#stories' || location.hash === '#results') {
      openFor(location.hash);
      var t = d.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
    d.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
      if (!a || !samePage(a)) return;
      var href = a.getAttribute('href');
      openFor(href.slice(href.indexOf('#')));
    });
    window.addEventListener('hashchange', function () { openFor(location.hash); });

    // Arriving from the old /about/ address: scroll to the mapped section.
    if (aboutTarget) {
      var target = d.getElementById(aboutTarget.slice(1));
      if (target) window.addEventListener('load', function () { target.scrollIntoView(); });
    }

    // Phone menu: the five section links sit in a panel under the sticky bar (CSS shows it only on narrow screens with JS).
    var mbtn = d.querySelector('.c-menubtn');
    var panel = d.getElementById('site-menu');
    if (mbtn && panel) {
      var setMenu = function (open, focusBtn) {
        panel.classList.toggle('is-open', open);
        mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (!open && focusBtn) mbtn.focus();
      };
      mbtn.addEventListener('click', function () { setMenu(!panel.classList.contains('is-open')); });
      panel.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel.classList.contains('is-open')) setMenu(false, true);
      });
      d.addEventListener('click', function (e) {
        if (panel.classList.contains('is-open') && !panel.contains(e.target) && !mbtn.contains(e.target)) setMenu(false);
      });
    }

    // Case study: show one question set at a time. Without JS both sets are shown, one under the other.
    var group = d.querySelector('[data-set-toggle]');
    if (group) {
      var buttons = group.querySelectorAll('button[data-set]');
      var sets = d.querySelectorAll('.c-set');
      var show = function (name) {
        for (var j = 0; j < buttons.length; j++) buttons[j].setAttribute('aria-pressed', buttons[j].getAttribute('data-set') === name ? 'true' : 'false');
        for (var k = 0; k < sets.length; k++) sets[k].hidden = sets[k].getAttribute('data-set') !== name;
      };
      for (var b = 0; b < buttons.length; b++) buttons[b].addEventListener('click', function () { show(this.getAttribute('data-set')); });
      show(buttons[0].getAttribute('data-set'));
    }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
