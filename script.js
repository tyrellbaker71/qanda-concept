/* =====================================================
   Q&A DRIVING ACADEMY - script.js
   Mobile menu, hero slideshow, road + progress, starting-point picker,
   gallery lightbox, photo placeholders, Google reviews.
   ===================================================== */

/* =====================================================
   GOOGLE BUSINESS CONFIG  (change these for each school)
   -----------------------------------------------------
   GOOGLE_PLACE_ID     Find it at:
       https://developers.google.com/maps/documentation/places/web-service/place-id
   GOOGLE_REVIEWS_URL  Link to the school's Google reviews. Easiest way: search the
       business on Google Maps, click "Reviews", then copy the page link.
       If left as a placeholder, the link is built from GOOGLE_PLACE_ID instead.
   GOOGLE_RATING       e.g. 4.8   (shown until live data loads; leave 0 to hide)
   GOOGLE_REVIEW_COUNT e.g. 37    (leave 0 to hide)
   GOOGLE_API_KEY      OPTIONAL. Only needed to show review cards. Create a Maps
       JavaScript API + Places API (New) key in Google Cloud and restrict it to
       your website address (HTTP referrers). Leave as placeholder to skip cards.
   ===================================================== */
const GOOGLE_PLACE_ID = "";
const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/to83JMd6a8ym5qTu8";
const GOOGLE_RATING = 0;
const GOOGLE_REVIEW_COUNT = 0;
const GOOGLE_API_KEY = "";
const GOOGLE_REVIEWS_TO_SHOW = 3;

(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false); // close after choosing a link
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 820) setMenu(false);
  });

  /* ---------- Hero slideshow ---------- */
  var slides = document.querySelectorAll('.hero .slide');
  var dotsWrap = document.querySelector('.hero-dots');
  var current = 0;
  var timer = null;
  var INTERVAL = 6000; // milliseconds between slides
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(n) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].removeAttribute('aria-current');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].setAttribute('aria-current', 'true');
  }

  function start() {
    if (reduceMotion || slides.length < 2) return;
    stop();
    timer = setInterval(function () { showSlide(current + 1); }, INTERVAL);
  }
  function stop() { clearInterval(timer); }

  if (slides.length > 1) {
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show slide ' + (i + 1));
      if (i === 0) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { showSlide(i); start(); });
      dotsWrap.appendChild(b);
    });
    start();
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }


  /* ---------- Photo placeholders: missing photos show a labelled box ---------- */
  function swapForPlaceholder(img) {
    if (!img.parentNode) return;
    if (img.dataset.fallback === 'wordmark') {
      var w = document.createElement('span');
      w.className = 'wordmark';
      w.textContent = 'Q&A Driving Academy';
      img.parentNode.replaceChild(w, img);
      return;
    }
    var ph = document.createElement('div');
    ph.className = 'ph';
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', img.alt || 'Photo');
    var label = document.createElement('span');
    var file = (img.getAttribute('src') || '').split('/').pop();
    label.textContent = 'Photo goes here: ' + file;
    ph.appendChild(label);
    img.parentNode.replaceChild(ph, img);
  }
  Array.prototype.forEach.call(document.querySelectorAll('img[data-photo], img[data-fallback]'), function (img) {
    img.addEventListener('error', function () { swapForPlaceholder(img); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) swapForPlaceholder(img);
    else if (img.complete) img.classList.add('can-zoom');
    img.addEventListener('load', function () { img.classList.add('can-zoom'); });
  });

  /* ---------- Hero road: perspective dashes ---------- */
  (function () {
    var g = document.getElementById('scene-dashes');
    if (!g) return;
    var NS = 'http://www.w3.org/2000/svg';
    var topY = 330, botY = 820, n = 10;
    function centreX(y) { return 700 - (y - topY) / (botY - topY) * 0; }  // straight road
    for (var i = 0; i < n; i++) {
      var f0 = Math.pow(i / n, 1.7), f1 = Math.pow((i + 0.45) / n, 1.7);
      var y0 = topY + f0 * (botY - topY), y1 = topY + f1 * (botY - topY);
      var w0 = 0.6 + f0 * 11, w1 = 0.6 + f1 * 11;
      var p = document.createElementNS(NS, 'polygon');
      p.setAttribute('class', 'scene-dash');
      p.setAttribute('points',
        (centreX(y0) - w0) + ',' + y0 + ' ' + (centreX(y0) + w0) + ',' + y0 + ' ' +
        (centreX(y1) + w1) + ',' + y1 + ' ' + (centreX(y1) - w1) + ',' + y1);
      g.appendChild(p);
    }
  })();

  /* ---------- The road: scroll progress + section markers ---------- */
  var road = document.querySelector('.road');
  var ticks = road ? Array.prototype.slice.call(road.querySelectorAll('.tick')) : [];
  var scrollRange = 1;
  var raf = 0;

  function layoutRoad() {
    if (!road) return;
    scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    ticks.forEach(function (t) {
      var el = document.getElementById(t.getAttribute('data-target'));
      if (!el) return;
      var y = el.getBoundingClientRect().top + window.pageYOffset;
      t.style.setProperty('--at', Math.max(0, Math.min(1, y / scrollRange)));
      t._at = Math.max(0, Math.min(1, y / scrollRange));
    });
    updateRoad();
  }
  function updateRoad() {
    raf = 0;
    if (!road) return;
    var p = Math.max(0, Math.min(1, window.pageYOffset / scrollRange));
    road.style.setProperty('--p', p);
    ticks.forEach(function (t) { t.classList.toggle('passed', p >= (t._at || 0) - 0.002); });
  }
  if (road) {
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(updateRoad); }, { passive: true });
    window.addEventListener('resize', layoutRoad);
    window.addEventListener('load', layoutRoad);
    layoutRoad();
  }

  /* ---------- Starting-point picker ---------- */
  var PICKS = {
    beginner: { label: 'I have never driven', lessons: ['beginner', 'learner'], text: 'We start with the basics and move at a pace you are comfortable with.' },
    nervous:  { label: 'I feel nervous', lessons: ['beginner', 'refresher'], text: 'Lessons are taught calmly and clearly, and adjusted to your experience and confidence.' },
    learning: { label: 'I am working towards my licence', lessons: ['learner', 'practical'], text: 'Structured lessons for learners working towards their licence, one step at a time.' },
    test:     { label: 'My test is coming up', lessons: ['test', 'practical'], text: 'Practise the manoeuvres and road skills you will be assessed on before test day.' },
    'while':  { label: 'It has been a while', lessons: ['refresher', 'practical'], text: 'Rebuild your confidence if you have not driven in a while or feel unsure on the road.' }
  };
  var LESSON_NAMES = {
    learner: 'Learner Driver Lessons', beginner: 'Beginner Driving Lessons', refresher: 'Refresher Lessons',
    test: 'Test Preparation', practical: 'Practical Driving Lessons'
  };
  var WA_NUMBER = '27724524602';

  var pickResult = document.getElementById('pick-result');
  if (pickResult) {
    var pickHeading = document.getElementById('pick-heading');
    var pickText = document.getElementById('pick-text');
    var pickWa = document.getElementById('pick-wa');
    var lessonRows = document.querySelectorAll('.lesson[data-lesson]');

    Array.prototype.forEach.call(document.querySelectorAll('input[name="start"]'), function (radio) {
      radio.addEventListener('change', function () {
        var pick = PICKS[radio.value];
        if (!pick) return;
        var names = pick.lessons.map(function (k) { return LESSON_NAMES[k]; });
        pickHeading.textContent = 'Start with ' + names.join(' and ');
        pickText.textContent = pick.text;
        var msg = 'Hi Q&A Driving Academy, I would like to book a lesson. My starting point: ' + pick.label + '.';
        pickWa.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
        pickResult.hidden = false;
        Array.prototype.forEach.call(lessonRows, function (row) {
          var match = pick.lessons.indexOf(row.getAttribute('data-lesson')) !== -1;
          row.classList.toggle('is-match', match);
          row.querySelector('.fit').hidden = !match;
        });
        layoutRoad();
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var grid = document.getElementById('gallery-grid');
  var box = document.getElementById('lightbox');
  var boxImg = box.querySelector('img');
  var index = 0;
  var lastFocus = null;

  function galleryImages() { return Array.prototype.slice.call(grid.querySelectorAll('img')); }

  function openBox(i) {
    var images = galleryImages();
    if (!images.length) return;
    index = (i + images.length) % images.length;
    boxImg.src = images[index].currentSrc || images[index].src;
    boxImg.alt = images[index].alt;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function closeBox() {
    box.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  // Photos become clickable (and keyboard-focusable) once they have really loaded
  grid.addEventListener('load', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG') return;
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
  }, true);
  galleryImages().forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) { img.tabIndex = 0; img.setAttribute('role', 'button'); }
  });
  grid.addEventListener('click', function (e) {
    var img = e.target.closest('img');
    if (!img) return;
    lastFocus = img;
    openBox(galleryImages().indexOf(img));
  });
  grid.addEventListener('keydown', function (e) {
    var img = e.target.closest('img');
    if (img && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); lastFocus = img; openBox(galleryImages().indexOf(img));
    }
  });

  box.querySelector('.lb-close').addEventListener('click', closeBox);
  box.querySelector('.lb-prev').addEventListener('click', function () { openBox(index - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { openBox(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') closeBox();
    if (e.key === 'ArrowLeft') openBox(index - 1);
    if (e.key === 'ArrowRight') openBox(index + 1);
  });

  /* ---------- Google reviews ---------- */
  function isSet(v) { return typeof v === 'string' && v !== '' && v.indexOf('YOUR_') !== 0; }

  var elRating = document.getElementById('g-rating');
  var elStars = document.getElementById('g-stars');
  var elCount = document.getElementById('g-count');
  var elLink = document.getElementById('g-link');
  var elCards = document.getElementById('g-cards');

  function starsPct(r) { return Math.max(0, Math.min(5, r)) / 5 * 100 + '%'; }

  function showSummary(rating, count) {
    rating = Number(rating) || 0;
    count = Number(count) || 0;
    if (rating > 0) {
      elRating.textContent = rating.toFixed(1);
      elRating.hidden = false;
      elStars.querySelector('.stars-fill').textContent = '\u2605\u2605\u2605\u2605\u2605';
      elStars.querySelector('.stars-fill').style.width = starsPct(rating);
      elStars.setAttribute('aria-label', 'Rated ' + rating.toFixed(1) + ' out of 5');
      elStars.hidden = false;
    }
    elCount.textContent = count > 0
      ? 'Based on ' + count + ' Google review' + (count === 1 ? '' : 's')
      : 'Read what our learners say on Google';
  }

  function renderCards(reviews) {
    reviews.slice(0, GOOGLE_REVIEWS_TO_SHOW).forEach(function (r) {
      var text = r.text || '';
      if (!text) return;
      var card = document.createElement('article');
      card.className = 'review-card';

      var stars = document.createElement('div');
      stars.className = 'stars';
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', 'Rated ' + r.rating + ' out of 5');
      var fill = document.createElement('span');
      fill.className = 'stars-fill';
      fill.textContent = '\u2605\u2605\u2605\u2605\u2605';
      fill.style.width = starsPct(r.rating);
      stars.appendChild(fill);

      var p = document.createElement('p');
      p.className = 'review-text';
      p.textContent = text;                       // textContent keeps it safe

      var who = document.createElement('div');
      who.className = 'reviewer';
      var a = r.authorAttribution || {};
      if (a.photoURI) {
        var img = document.createElement('img');
        img.src = a.photoURI; img.alt = ''; img.width = 40; img.height = 40;
        img.referrerPolicy = 'no-referrer';
        who.appendChild(img);
      }
      var info = document.createElement('div');
      var name = document.createElement(a.uri ? 'a' : 'strong');
      name.textContent = a.displayName || 'Google user';
      if (a.uri) { name.href = a.uri; name.target = '_blank'; name.rel = 'noopener'; }
      var strong = document.createElement('strong');
      strong.appendChild(name);
      info.appendChild(strong);
      if (r.relativePublishTimeDescription) {
        var when = document.createElement('span');
        when.textContent = r.relativePublishTimeDescription;
        info.appendChild(when);
      }
      who.appendChild(info);

      card.appendChild(stars); card.appendChild(p); card.appendChild(who);
      elCards.appendChild(card);
    });
    if (elCards.children.length) elCards.hidden = false;
  }

  if (elRating) {
    // Link to all reviews
    if (isSet(GOOGLE_REVIEWS_URL)) {
      elLink.href = GOOGLE_REVIEWS_URL; elLink.hidden = false;
    } else if (isSet(GOOGLE_PLACE_ID)) {
      elLink.href = 'https://search.google.com/local/reviews?placeid=' + encodeURIComponent(GOOGLE_PLACE_ID);
      elLink.hidden = false;
    }

    // Summary from the manual values first (works with no API key)
    showSummary(GOOGLE_RATING, GOOGLE_REVIEW_COUNT);

    // Optional: live rating, count and review cards via Google Places
    if (isSet(GOOGLE_API_KEY) && isSet(GOOGLE_PLACE_ID)) {
      window.__initGooglePlaces = function () {
        google.maps.importLibrary('places').then(function (lib) {
          var place = new lib.Place({ id: GOOGLE_PLACE_ID });
          return place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews'] }).then(function () {
            if (place.rating) showSummary(place.rating, place.userRatingCount);
            if (place.reviews && place.reviews.length) renderCards(place.reviews);
          });
        }).catch(function (err) { console.warn('Google reviews could not be loaded:', err); });
      };
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_API_KEY) +
              '&loading=async&callback=__initGooglePlaces';
      document.head.appendChild(s);
    }
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
