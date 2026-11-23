/* Q&A Driving Academy — vanilla JS: menu, header state, starting-point guide, lightbox. */
(function () {
  'use strict';
  var WA = 'https://wa.me/27724524602?text=';

  /* ---- Header + mobile menu ---- */
  var head = document.querySelector('.site-head');
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.firstElementChild.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.querySelector('a').focus();
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); }
  });
  window.matchMedia('(min-width:861px)').addEventListener('change', function () { setMenu(false); });
  function onScroll() { head.classList.toggle('stuck', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- Current section in nav ---- */
  var links = {};
  nav.querySelectorAll('a[href^="#"]:not(.btn)').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        if (links[e.target.id]) links[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (k) { var s = document.getElementById(k); if (s) io.observe(s); });
  }

  /* ---- Starting-point guide ---- */
  var LESSONS = { learner: 'Learner Driver Lessons', beginner: 'Beginner Driving Lessons', refresher: 'Refresher Lessons', test: 'Test Preparation', practical: 'Practical Driving Lessons' };
  var PICKS = {
    beginner: { label: 'I have never driven', l: ['beginner', 'learner'], t: 'We start with the basics and move at a pace you are comfortable with.' },
    nervous:  { label: 'I feel nervous', l: ['beginner', 'refresher'], t: 'Lessons are taught calmly and clearly, and adjusted to your experience and confidence.' },
    learning: { label: 'I am working towards my licence', l: ['learner', 'practical'], t: 'Structured lessons for learners working towards their licence, one step at a time.' },
    test:     { label: 'My test is coming up', l: ['test', 'practical'], t: 'Practise the manoeuvres and road skills you will be assessed on before test day.' },
    'while':  { label: 'It has been a while', l: ['refresher', 'practical'], t: 'Rebuild your confidence if you have not driven in a while or feel unsure on the road.' }
  };
  var result = document.getElementById('result'), idle = document.getElementById('idle');
  document.querySelectorAll('input[name="start"]').forEach(function (r) {
    r.addEventListener('change', function () {
      var p = PICKS[r.value]; if (!p) return;
      var names = p.l.map(function (k) { return LESSONS[k]; });
      document.getElementById('r-h').textContent = 'Start with ' + names.join(' and ');
      document.getElementById('r-p').textContent = p.t;
      document.getElementById('r-wa').href = WA + encodeURIComponent('Hi Q&A Driving Academy, I would like to book a lesson. My starting point: ' + p.label + '. I am interested in ' + names.join(' and ') + '.');
      idle.hidden = true; result.hidden = false;
      result.classList.remove('pop'); void result.offsetWidth; result.classList.add('pop');
      document.querySelectorAll('.lrow[data-lesson]').forEach(function (row) {
        row.classList.toggle('match', p.l.indexOf(row.getAttribute('data-lesson')) > -1);
      });
    });
  });

  /* ---- Gallery lightbox ---- */
  var gal = document.getElementById('gal'), lb = document.getElementById('lb');
  var lbImg = lb.querySelector('img'), ct = lb.querySelector('.ct'), data = window.GALLERY || [], idx = 0, opener = null;
  function show(i) {
    idx = (i + data.length) % data.length;
    lbImg.src = data[idx][0]; lbImg.alt = data[idx][1];
    ct.textContent = (idx + 1) + ' / ' + data.length;
  }
  function openLb(i, from) {
    opener = from; show(i); lb.hidden = false; document.body.style.overflow = 'hidden';
    lb.querySelector('.x').focus();
  }
  function closeLb() {
    lb.hidden = true; lbImg.removeAttribute('src'); document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  gal.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]'); if (b) openLb(+b.getAttribute('data-i'), b);
  });
  lb.querySelector('.x').addEventListener('click', closeLb);
  lb.querySelector('.pv').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.nx').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') { // keep focus inside the dialog
      var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
