/* ============================================================
   Helmet Detection CNN — Website interactions
   - Python syntax highlighting (dependency-free)
   - One-click copy for every code block
   - Mobile menu, scroll spy, reveal animations, back-to-top
   ============================================================ */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     PYTHON SYNTAX HIGHLIGHTER
     Line-by-line tokenizer: comments, strings, numbers,
     keywords, constants, builtins and function calls.
     ============================================================ */
  var KEYWORDS = {};
  'def class return if elif else for while in not and or import from as with try except finally raise pass break continue lambda global nonlocal assert yield del is async await'
    .split(' ').forEach(function (w) { KEYWORDS[w] = true; });

  var CONSTS = { 'True': 1, 'False': 1, 'None': 1, 'self': 1 };

  var BUILTINS = {};
  'print len range super int float str list dict set tuple sum enumerate zip sorted open isinstance type abs min max map filter'
    .split(' ').forEach(function (w) { BUILTINS[w] = true; });

  var TOKEN_RE = new RegExp([
    '(#[^\\n]*)',                                                       /* 1 comment   */
    '((?:[fFrRbB]{0,2})"(?:\\\\.|[^"\\\\\\n])*"|' +                     /* 2 string    */
    '(?:[fFrRbB]{0,2})\'(?:\\\\.|[^\'\\\\\\n])*\')',
    '(@\\w+)',                                                          /* 3 decorator */
    '(\\b0x[0-9A-Fa-f]+\\b|\\b\\d+\\.\\d*|\\b\\d+)',                    /* 4 number    */
    '([A-Za-z_]\\w*(?=\\s*\\())',                                       /* 5 call name */
    '([A-Za-z_]\\w*)'                                                   /* 6 word      */
  ].join('|'), 'g');

  function classify(word) {
    if (KEYWORDS[word]) return 'tok-kw';
    if (CONSTS[word]) return 'tok-const';
    if (BUILTINS[word]) return 'tok-builtin';
    return null;
  }

  function highlightLine(line) {
    var out = '', last = 0;
    var push = function (txt, cls) {
      out += cls ? '<span class="' + cls + '">' + esc(txt) + '</span>' : esc(txt);
    };
    line.replace(TOKEN_RE, function (m, com, str, dec, num, fname, word, offset) {
      push(line.slice(last, offset), null);
      if (com) push(m, 'tok-com');
      else if (str) push(m, 'tok-str');
      else if (dec) push(m, 'tok-dec');
      else if (num) push(m, 'tok-num');
      else if (fname) push(m, classify(fname) || 'tok-fn');
      else if (word) push(m, classify(word));
      last = offset + m.length;
      return m;
    });
    push(line.slice(last), null);
    return out;
  }

  /* ---------- keep the EXACT original text for copying ---------- */
  var rawCode = new Map();
  $$('pre code').forEach(function (el) {
    rawCode.set(el, el.textContent.replace(/\n+$/, ''));
  });

  /* ---------- render highlighted lines + line numbers ---------- */
  $$('code.python').forEach(function (el) {
    var raw = rawCode.get(el) || '';
    var lines = raw.split('\n');
    el.innerHTML = lines.map(function (l) {
      return '<span class="line">' + (highlightLine(l) || '&#8203;') + '</span>';
    }).join('');

    var card = el.closest('.code-card');
    if (card) {
      var meta = $('.meta-lines', card);
      if (meta) meta.textContent = lines.length + ' lines';
    }
  });

  /* ============================================================
     COPY BUTTONS
     ============================================================ */
  var btnTimers = new WeakMap();

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function doCopy(btn) {
    var target = document.getElementById(btn.getAttribute('data-copy'));
    if (!target) return;
    var text = rawCode.get(target);
    if (text === undefined) text = target.textContent.replace(/\n+$/, '');

    var label = $('.copy-label', btn);
    var finish = function (ok) {
      btn.classList.add('copied');
      if (label) label.textContent = ok ? 'Copied!' : 'Press Ctrl+C';
      window.clearTimeout(btnTimers.get(btn));
      btnTimers.set(btn, window.setTimeout(function () {
        btn.classList.remove('copied');
        if (label) label.textContent = 'Copy';
      }, 2000));
      if (!ok) showToast('Copy blocked by browser — select the code and press Ctrl+C.');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { finish(true); },
        function () { finish(fallbackCopy(text)); }
      );
    } else {
      finish(fallbackCopy(text));
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (btn) doCopy(btn);
  });

  /* ============================================================
     TOAST
     ============================================================ */
  var toast = $('#toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('show'); }, 2800);
  }

  /* YouTube placeholder link — replace href="#" with your video URL in index.html */
  var yt = $('#ytLink');
  if (yt) {
    yt.addEventListener('click', function (e) {
      if (yt.getAttribute('href') === '#') {
        e.preventDefault();
        showToast('Video link coming soon — check the YouTube description!');
      }
    });
  }

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#navLinks a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     SCROLL SPY (active nav link)
     ============================================================ */
  var spyIds = ['overview', 'setup', 'codes', 'how-to-run', 'notes'];
  var navMap = {};
  $$('.nav-links a').forEach(function (a) {
    navMap[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && navMap[en.target.id]) {
          $$('.nav-links a').forEach(function (a) { a.classList.remove('active'); });
          navMap[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    spyIds.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ============================================================
     REVEAL ON SCROLL + stagger delays
     ============================================================ */
  $$('.stagger').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) {
      el.style.setProperty('--d', (i * 70) + 'ms');
    });
  });

  var reveals = $$('.reveal');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  var toTop = $('#toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();
