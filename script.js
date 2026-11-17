// Small progressive enhancements. Every page works without this file.
(function () {
  var d = document;

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
    if (!a) return;
    var href = a.getAttribute('href'), i = href.indexOf('#'), path = href.slice(0, i);
    if (path && path !== location.pathname) return;
    openFor(href.slice(i));
  });
  window.addEventListener('hashchange', function () { openFor(location.hash); });

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
    show('wiki');
  }
})();
