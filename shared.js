/* ============================================================
   SHARED.JS — background fx, tilt, and page-transition system
   ============================================================ */
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Matrix-style binary rain ---- */
(function () {
  var canvas = document.getElementById('rain');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, cols, drops, fontSize = 15;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.floor(W / fontSize);
    drops = new Array(cols).fill(0).map(function () { return Math.random() * -100; });
  }
  window.addEventListener('resize', resize);
  resize();

  var chars = '01';
  function drawRain() {
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = fontSize + 'px "IBM Plex Mono", monospace';
    for (var i = 0; i < cols; i++) {
      var text = chars[Math.floor(Math.random() * 2)];
      var x = i * fontSize;
      var y = drops[i] * fontSize;
      var bright = Math.random() > 0.96;
      ctx.fillStyle = bright ? 'rgba(0,255,65,0.95)' : (i % 3 === 0 ? 'rgba(0,255,65,0.50)' : 'rgba(0,200,50,0.35)');
      ctx.fillText(text, x, y);
      if (y > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.35;
    }
  }

  if (!reduceMotion) {
    (function loop() { drawRain(); requestAnimationFrame(loop); })();
  } else {
    ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fillRect(0, 0, W, H);
  }
})();

/* ---- Parallax blobs/grid + card tilt ---- */
(function () {
  var blobLayer = document.getElementById('blobLayer');
  var gridLayer = document.getElementById('gridLayer');
  var heroInner = document.getElementById('heroInner');
  if (reduceMotion) return;

  window.addEventListener('mousemove', function (e) {
    var x = e.clientX / window.innerWidth - 0.5;
    var y = e.clientY / window.innerHeight - 0.5;
    if (blobLayer) blobLayer.style.transform = 'translate3d(' + (x * 50) + 'px,' + (y * 50) + 'px,0)';
    if (gridLayer) gridLayer.style.transform = 'translate3d(' + (x * -25) + 'px,' + (y * -25) + 'px,0)';
    if (heroInner) heroInner.style.transform = 'perspective(1000px) rotateX(' + (y * -5) + 'deg) rotateY(' + (x * 7) + 'deg)';
  });

  document.querySelectorAll('.card, .about-card, .stat-card, .exp-card, .contact-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(900px) rotateX(' + (y * -6) + 'deg) rotateY(' + (x * 8) + 'deg) translateY(-3px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();

/* ============================================================
   TRANSITION SYSTEM
   Every internal nav link should call:  navigateWithTransition(url, mode)
   mode: 'rocket' (going to projects), 'levelup' (going to experience),
         'boot' (going home / anywhere else)
   On arrival, each page calls playEntrance() on load, which reads
   sessionStorage to know which mode to reverse/settle into.
   ============================================================ */

function buildOverlay(mode) {
  var el = document.getElementById('transitionOverlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'transitionOverlay';
    document.body.appendChild(el);
  }
  el.className = mode;
  el.innerHTML = '';
  return el;
}

var ROCKET_SVG = '<svg class="rocket-svg" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:56px;margin:0 auto 22px;display:block;">' +
  '<path d="M30 4 C20 4 12 20 10 45 L50 45 C48 20 40 4 30 4Z" fill="#0d2210" stroke="#00FF41" stroke-width="1.5"/>' +
  '<path d="M30 4 L22 22 L38 22 Z" fill="#00FF41" opacity="0.5"/>' +
  '<circle cx="30" cy="28" r="6" fill="none" stroke="#00FF41" stroke-width="1.5"/>' +
  '<circle cx="30" cy="28" r="3" fill="rgba(0,255,65,0.3)"/>' +
  '<rect x="10" y="45" width="40" height="30" rx="2" fill="#0a1f0d" stroke="#00FF41" stroke-width="1.2"/>' +
  '<path d="M10 55 L2 78 L10 74 Z" fill="#051208" stroke="#00FF41" stroke-width="1"/>' +
  '<path d="M50 55 L58 78 L50 74 Z" fill="#051208" stroke="#00FF41" stroke-width="1"/>' +
  '<path d="M18 75 L14 88 L46 88 L42 75 Z" fill="#030e05" stroke="#00FF41" stroke-width="1"/>' +
  '</svg>';

function navigateWithTransition(url, mode) {
  mode = mode || 'boot';
  if (reduceMotion) { window.location.href = url; return; }
  sessionStorage.setItem('enterMode', mode);
  var el = buildOverlay(mode);

  if (mode === 'rocket') {
    el.innerHTML =
      ROCKET_SVG +
      '<div class="t-console" id="tConsole"></div>';
    var msgs = ['LOCKING NAV TO PROJECT LOG...', 'FUEL: NOMINAL', 'T-MINUS LAUNCH...', 'IGNITION!'];
    runConsole(msgs, function () { window.location.href = url; }, 420);
  } else if (mode === 'levelup') {
    el.innerHTML =
      '<div style="text-align:center;">' +
      '<div class="t-levelbanner">LEVEL 2 — EXPERIENCE LOG</div>' +
      '<div class="t-console" id="tConsole"></div>' +
      '<div class="t-bar"><div class="t-bar-fill" id="tBar"></div></div>' +
      '</div>';
    var msgs2 = ['SAVING PROGRESS...', 'LOADING TIMELINE DATA...', 'READY PLAYER ONE'];
    runConsole(msgs2, function () { window.location.href = url; }, 380, true);
  } else {
    el.innerHTML = '<div class="t-crt-line"></div>';
    setTimeout(function () { window.location.href = url; }, 480);
  }

  requestAnimationFrame(function () { el.classList.add('visible'); });
}

function runConsole(messages, done, stepMs, showBar) {
  var consoleEl = document.getElementById('tConsole');
  var delay = 0;
  messages.forEach(function (msg, i) {
    delay += i === 0 ? 0 : stepMs;
    setTimeout(function () {
      var line = document.createElement('span');
      line.className = 't-line';
      line.textContent = msg;
      consoleEl.appendChild(line);
      if (showBar) {
        var bar = document.getElementById('tBar');
        if (bar) bar.style.width = Math.round(((i + 1) / messages.length) * 100) + '%';
      }
    }, delay);
  });
  setTimeout(done, delay + stepMs + 260);
}

/* Called on DOMContentLoaded by each page to reveal content with a
   matching "arrival" flourish based on how the user got here. */
function playEntrance() {
  var mode = sessionStorage.getItem('enterMode');
  sessionStorage.removeItem('enterMode');
  var main = document.querySelector('main');
  if (main) main.classList.add('page-enter');

  if (reduceMotion || !mode) return;

  var el = buildOverlay(mode === 'rocket' ? 'boot' : mode); // arrival always settles via a quick boot/level flash
  if (mode === 'rocket') {
    el.innerHTML = '<div class="t-crt-line"></div><div class="t-levelbanner" style="position:absolute;bottom:14%;left:0;right:0;">ORBIT REACHED</div>';
  } else if (mode === 'levelup') {
    el.innerHTML = '<div style="text-align:center;"><div class="t-levelbanner">LEVEL 2 LOADED</div><div class="pixel-loader"><span></span><span></span><span></span><span></span></div></div>';
  } else {
    el.innerHTML = '<div class="t-crt-line"></div>';
  }
  el.classList.add('visible');
  setTimeout(function () { el.classList.remove('visible'); }, mode === 'levelup' ? 650 : 500);
}

document.addEventListener('DOMContentLoaded', playEntrance);

/* ============================================================
   CUSTOM CURSOR — glow dot + lagging reticle ring + pixel trail
   Skipped on touch devices and when reduced motion is requested.
   ============================================================ */
(function () {
  var canUse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion || !canUse) return;

  document.body.classList.add('custom-cursor');

  var dot = document.createElement('div');
  dot.id = 'cursorDot';
  var ring = document.createElement('div');
  ring.id = 'cursorRing';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  var ringX = mouseX, ringY = mouseY;
  var lastPixel = 0;

  function spawnPixel(x, y) {
    var p = document.createElement('div');
    p.className = 'cursor-pixel';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 650);
  }

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    var now = performance.now();
    if (now - lastPixel > 45) { lastPixel = now; spawnPixel(mouseX, mouseY); }
  });

  window.addEventListener('mousedown', function () { dot.style.transform = 'translate3d(-50%,-50%,0) scale(1.8)'; });
  window.addEventListener('mouseup', function () { dot.style.transform = 'translate3d(-50%,-50%,0) scale(1)'; });

  /* Lagging ring follow (eased), driven by rAF */
  (function ringLoop() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(ringLoop);
  })();

  /* Reticle enlarges + turns amber over anything clickable */
  var hoverSelector = 'a, button, .btn, .card, .hub-card, [onclick]';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(hoverSelector)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(hoverSelector)) ring.classList.remove('hover');
  });

  /* Hide the custom cursor if the pointer leaves the window */
  document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { dot.style.opacity = '1'; ring.style.opacity = '0.6'; });
})();

/* ---- HUD coordinate ticker (used on projects page, harmless elsewhere) ---- */
(function () {
  var hudCoords = document.getElementById('hudCoords');
  if (!hudCoords) return;
  setInterval(function () {
    var ra = Math.floor(Math.random() * 24) + 'h ' + Math.floor(Math.random() * 60) + 'm ' + Math.floor(Math.random() * 60) + 's';
    var dec = (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 90) + '\u00b0 ' + Math.floor(Math.random() * 60) + "'";
    hudCoords.textContent = 'RA ' + ra + ' / DEC ' + dec;
  }, 3000);
})();