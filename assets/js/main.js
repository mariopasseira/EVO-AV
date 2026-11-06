/* Sweet River Audiovisuais — comportamento partilhado */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  /* ---- Navegação: estado ao fazer scroll ---- */
  function updateNav() {
    if (!nav) return;
    var scrolled = window.scrollY > 24;
    nav.classList.toggle('is-scrolled', scrolled && !nav.classList.contains('menu-open'));
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---- Menu móvel ---- */
  function setMenu(open) {
    if (!toggle || !links) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    links.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    updateNav();
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    nav.addEventListener('click', function (e) {
      if (e.target === nav) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---- Revelação suave ao entrar no ecrã ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }
  /* rede de segurança: nada fica escondido se o observador não disparar */
  function revealAll() { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }
  setTimeout(revealAll, 3000);
  window.addEventListener('pageshow', function (e) { if (e.persisted) revealAll(); });

  /* ---- Vídeos: poster até clique, depois reprodução ---- */
  document.querySelectorAll('.vtile[data-src]').forEach(function (tile) {
    function play() {
      if (tile.classList.contains('is-playing')) return;
      var video = document.createElement('video');
      video.src = tile.getAttribute('data-src');
      video.controls = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = 'auto';
      video.setAttribute('aria-label', tile.getAttribute('aria-label') || 'Vídeo');
      var poster = tile.querySelector('img');
      if (poster) video.poster = poster.currentSrc || poster.src;
      tile.classList.add('is-playing');
      tile.appendChild(video);
      if (poster) poster.remove();
      /* pausa os outros vídeos em reprodução */
      document.querySelectorAll('.vtile video').forEach(function (v) { if (v !== video) v.pause(); });
      video.play().catch(function () {});
    }
    tile.addEventListener('click', play);
    tile.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
  });

  /* ---- Formulário de contacto (Formspree, sem sair da página) ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    var submit = form.querySelector('[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var honey = form.querySelector('[name="_gotcha"]');
      if (honey && honey.value) return;
      var original = submit.innerHTML;
      submit.disabled = true;
      submit.textContent = 'A enviar…';
      status.className = 'form__status';
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          status.textContent = 'Mensagem enviada. Obrigado pelo contacto, respondemos em breve com uma proposta à medida.';
          status.className = 'form__status is-ok';
        } else {
          throw new Error('bad status');
        }
      }).catch(function () {
        status.textContent = 'Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por email para geral@swtriver.com.';
        status.className = 'form__status is-err';
      }).finally(function () {
        submit.disabled = false;
        submit.innerHTML = original;
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  /* ---- Ano no rodapé ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
