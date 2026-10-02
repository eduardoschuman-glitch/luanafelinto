/* Configuração */
var WHATSAPP = '5551993734545';
var WHATSAPP_MSG = 'Oi! Vim pela página e quero saber mais sobre o Lisa o Ano Todo.';
var PIXEL_ID = '';
var MIDIA = 'https://eduardoschuman-glitch.github.io/luanafelinto-midia/';

/* Meta Pixel */
(function () {
  if (!PIXEL_ID) return;
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  fbq('track', 'ViewContent', { content_name: 'Lisa o Ano Todo' });
})();
function rastrear(tipo, evento, dados) {
  if (typeof window.fbq === 'function') window.fbq(tipo, evento, dados || {});
}

/* WhatsApp */
(function () {
  var link = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(WHATSAPP_MSG);
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = link;
    a.addEventListener('click', function () {
      rastrear('track', 'Contact', { content_name: 'Lisa o Ano Todo', origem: a.getAttribute('data-wa') });
    });
  });
})();

/* Cabeçalho */
(function () {
  var h = document.querySelector('.site-header');
  function atualizar() { h.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', atualizar, { passive: true });
  atualizar();
})();

/* Vídeo de fundo do topo */
(function () {
  var v = document.querySelector('.hero-video');
  var retrato = window.matchMedia('(orientation: portrait)').matches;
  var nome = retrato ? 'fundo-mobile' : 'fundo-desktop';
  v.poster = 'assets/poster-' + nome + '.jpg';
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.setAttribute('muted', '');
  v.setAttribute('playsinline', '');
  v.setAttribute('webkit-playsinline', '');
  v.setAttribute('autoplay', '');
  v.preload = 'auto';
  v.src = MIDIA + 'videos/' + nome + '.mp4';
  var naTela = true;
  function tocar() { if (naTela && !document.hidden) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
  v.addEventListener('loadeddata', tocar);
  v.addEventListener('canplay', tocar);
  v.load();
  tocar();
  ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { if (v.paused) tocar(); }, { passive: true, once: true });
  });
  document.addEventListener('visibilitychange', function () { document.hidden ? v.pause() : tocar(); });
  new IntersectionObserver(function (e) {
    naTela = e[0].isIntersecting;
    naTela ? tocar() : v.pause();
  }).observe(v);
})();

/* Vídeo da Luana */
(function () {
  var v = document.querySelector('.lisa-video');
  var frame = document.querySelector('.lisa-frame');
  var barra = document.querySelector('.lisa-progress i');
  var som = document.querySelector('.lisa-som');
  var naTela = false;
  var jaTocou = false;
  var somRastreado = false;

  v.controls = false;
  v.disablePictureInPicture = true;

  var querSom = true;
  v.muted = false;
  function marcarSom() { som.textContent = v.muted ? 'ATIVAR SOM' : 'SOM LIGADO'; }
  function tocar() {
    if (!naTela || document.hidden) return;
    v.muted = !querSom ? true : v.muted;
    v.play().then(marcarSom).catch(function () {
      if (!v.muted) { v.muted = true; marcarSom(); v.play().catch(function () {}); }
    });
  }
  function liberarSom() {
    if (querSom && v.muted) { v.muted = false; marcarSom(); if (naTela && !document.hidden) v.play().catch(function () { v.muted = true; marcarSom(); }); }
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (!frame.contains(e.target)) liberarSom(); }, { passive: true });
  });

  new IntersectionObserver(function (e) {
    naTela = e[0].intersectionRatio >= 0.5;
    naTela ? tocar() : v.pause();
  }, { threshold: [0, 0.5, 1] }).observe(v);

  document.addEventListener('visibilitychange', function () {
    document.hidden ? v.pause() : tocar();
  });

  function alternarSom() {
    v.muted = !v.muted;
    querSom = !v.muted;
    marcarSom();
    if (!v.muted && !somRastreado) { somRastreado = true; rastrear('trackCustom', 'VideoSom', { content_name: 'Lisa o Ano Todo' }); }
    tocar();
  }
  frame.addEventListener('click', alternarSom);
  frame.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternarSom(); }
  });

  v.addEventListener('pause', function () { if (naTela && !document.hidden) tocar(); });
  v.addEventListener('playing', function () {
    if (!jaTocou) { jaTocou = true; rastrear('trackCustom', 'VideoPlay', { content_name: 'Lisa o Ano Todo' }); }
  });
  v.addEventListener('webkitbeginfullscreen', function () { if (v.webkitExitFullscreen) v.webkitExitFullscreen(); });
  v.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  (function atualizar() {
    if (v.duration) barra.style.width = (v.currentTime / v.duration * 100) + '%';
    requestAnimationFrame(atualizar);
  })();
})();

/* Carrossel antes e depois */
(function () {
  var track = document.querySelector('.car-track');
  if (!track) return;
  var slides = track.querySelectorAll('.car-slide');
  var dots = document.querySelectorAll('.car-dots button');
  var atual = 0;

  function ir(i) {
    atual = (i + slides.length) % slides.length;
    track.scrollTo({ left: atual * track.clientWidth, behavior: 'auto' });
    marcar();
  }
  function marcar() {
    dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === atual ? 'true' : 'false'); });
  }
  track.addEventListener('scroll', function () {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== atual) { atual = i; marcar(); }
  }, { passive: true });
  document.querySelector('.car-prev').addEventListener('click', function () { ir(atual - 1); });
  document.querySelector('.car-next').addEventListener('click', function () { ir(atual + 1); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { ir(k); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual - 1); }
  });
  window.addEventListener('resize', function () { track.scrollLeft = atual * track.clientWidth; });
})();

/* Abas de cuidados */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function ativar(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { ativar(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      ativar(n); n.focus();
    });
  });
})();

/* Entrada suave ao rolar */
(function () {
  var itens = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { itens.forEach(function (el) { el.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  itens.forEach(function (el) { io.observe(el); });
})();

/* Barra fixa no celular */
(function () {
  var barra = document.querySelector('.sticky-bar');
  var link = barra.querySelector('a');
  var inicio = document.querySelector('#plano');
  var bloqueios = ['#plano', '#fechamento', '#rodape'].map(function (s) { return document.querySelector(s); });
  var passouTopo = false;
  var visiveis = new Set();

  function atualizar() {
    var mostrar = passouTopo && visiveis.size === 0;
    barra.classList.toggle('is-visible', mostrar);
    barra.setAttribute('aria-hidden', mostrar ? 'false' : 'true');
    link.tabIndex = mostrar ? 0 : -1;
  }
  new IntersectionObserver(function (e) {
    passouTopo = !e[0].isIntersecting && e[0].boundingClientRect.top < 0;
    atualizar();
  }).observe(inicio);
  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) { e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target); });
    atualizar();
  });
  bloqueios.forEach(function (el) { if (el) io.observe(el); });
})();
