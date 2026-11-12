(() => {
  const root = document.documentElement;
  const $$ = s => [...document.querySelectorAll(s)];
  // d: [фон тёмной, акцент], l: [фон светлой]
  const PAL = [
    { id: 'mono', name: 'Монохром', d: ['#050506', '#f1f1ef'], l: ['#f3f4f6'] },
    { id: 'gold', name: 'Шампань', d: ['#0a0805', '#d9c28a'], l: ['#f5f0e5'] },
    { id: 'sapphire', name: 'Сапфир', d: ['#04070f', '#8fb4ff'], l: ['#eef3fb'] },
    { id: 'emerald', name: 'Изумруд', d: ['#030a07', '#7fe3b5'], l: ['#eef5f0'] },
    { id: 'ruby', name: 'Бордо', d: ['#0b0406', '#ff8fa3'], l: ['#faf0f0'] },
    { id: 'amethyst', name: 'Аметист', d: ['#07050d', '#c4a6ff'], l: ['#f3f0fa'] }
  ];
  const DEF = { mode: 'dark', palette: 'mono', particles: true, density: 1, speed: 1, glow: 1, grain: true, radius: 20, font: 1, motion: true };
  let S = { ...DEF };
  try {
    const saved = JSON.parse(localStorage.getItem('settings') || 'null');
    if (saved) S = { ...DEF, ...saved }; else if (localStorage.getItem('theme')) S.mode = localStorage.getItem('theme');
  } catch {}
  const save = () => { try { localStorage.setItem('settings', JSON.stringify(S)); } catch {} };
  const mq = matchMedia('(prefers-color-scheme: dark)');
  function apply() {
    const dark = S.mode === 'auto' ? mq.matches : S.mode === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light'; root.dataset.palette = S.palette; root.dataset.motion = S.motion ? 'on' : 'off';
    root.style.setProperty('--gk', S.glow); root.style.setProperty('--r', S.radius + 'px'); root.style.setProperty('--fs', S.font);
    root.style.setProperty('--grain', S.grain ? '' : '0');
  }
  mq.addEventListener('change', () => { if (S.mode === 'auto') apply(); });
  apply();
  let sync = () => {}, pc = () => {};
  const commit = () => { apply(); save(); sync(); pc(); };

  const tb = document.getElementById('theme');
  if (tb) tb.addEventListener('click', () => { S.mode = root.dataset.theme === 'dark' ? 'light' : 'dark'; commit(); });

  // ---- прогресс, появление блоков, подсветка карточек ----
  const bar = document.querySelector('.progress'), header = document.querySelector('header');
  const onScroll = () => {
    const h = document.body.scrollHeight - innerHeight;
    if (bar) bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', scrollY > 10);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest('.card,.panel,.profile');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
  });

  // ---- панель настроек ----
  const rg = (k, label, min, max, step) => `<label class="rg"><span>${label}<b data-out="${k}"></b></span><input type="range" min="${min}" max="${max}" step="${step}" data-key="${k}"></label>`;
  const sw = (k, label) => `<label class="sw"><span>${label}</span><input type="checkbox" data-key="${k}"><i></i></label>`;
  const ui = document.createElement('div'); ui.id = 'settings';
  ui.innerHTML = `<div class="sbk"></div><aside class="sdrawer" aria-label="Настройки">
    <div class="shead"><b>Настройки</b><button class="theme sclose" aria-label="Закрыть">✕</button></div>
    <div class="sbody">
      <div class="sgroup"><h4>Режим</h4><div class="seg"><button data-v="dark">Тёмный</button><button data-v="light">Светлый</button><button data-v="auto">Авто</button></div></div>
      <div class="sgroup"><h4>Цветовая палитра</h4><div class="pals">${PAL.map(p => `<button class="pal" data-v="${p.id}" style="--a:${p.d[0]};--b:${p.l[0]};--c:${p.d[1]}"><i></i>${p.name}</button>`).join('')}</div></div>
      <div class="sgroup"><h4>Частицы</h4>${sw('particles', 'Показывать частицы')}${rg('density', 'Количество', .2, 2, .1)}${rg('speed', 'Скорость', .3, 2.5, .1)}</div>
      <div class="sgroup"><h4>Оформление</h4>${rg('glow', 'Яркость свечения', 0, 1.6, .1)}${rg('radius', 'Скругление углов', 6, 34, 1)}${rg('font', 'Размер текста', .9, 1.2, .05)}${sw('grain', 'Плёночное зерно')}${sw('motion', 'Плавные анимации')}</div>
    </div>
    <div class="sfoot"><button class="btn sm" id="sreset">Сбросить настройки</button></div></aside>`;
  document.body.appendChild(ui);
  const gear = document.createElement('button');
  gear.className = 'theme'; gear.setAttribute('aria-label', 'Настройки');
  gear.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>';
  if (tb) tb.insertAdjacentElement('afterend', gear);
  gear.onclick = () => ui.classList.add('open');
  window.openSettings = () => ui.classList.add('open'); window.__gear = gear;
  addEventListener('keydown', e => { if (e.key === 'Escape') ui.classList.remove('open'); });
  const fmt = { density: v => Math.round(v * 100) + '%', speed: v => Math.round(v * 100) + '%', glow: v => Math.round(v * 100) + '%', radius: v => v + 'px', font: v => Math.round(v * 100) + '%' };
  sync = () => {
    ui.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.v === S.mode));
    ui.querySelectorAll('.pal').forEach(b => b.classList.toggle('on', b.dataset.v === S.palette));
    ui.querySelectorAll('input[data-key]').forEach(i => {
      const v = S[i.dataset.key];
      if (i.type === 'checkbox') i.checked = !!v;
      else { i.value = v; const o = ui.querySelector(`[data-out="${i.dataset.key}"]`); if (o) o.textContent = fmt[i.dataset.key](+v); }
    });
  };
  ui.addEventListener('click', e => {
    const b = e.target.closest('.seg button, .pal');
    if (b) { S[b.classList.contains('pal') ? 'palette' : 'mode'] = b.dataset.v; commit(); }
    if (e.target.closest('.sbk, .sclose')) ui.classList.remove('open');
    if (e.target.closest('#sreset')) { S = { ...DEF }; commit(); }
  });
  ui.addEventListener('input', e => {
    const i = e.target; if (!i.dataset.key) return;
    S[i.dataset.key] = i.type === 'checkbox' ? i.checked : Number(i.value); commit();
  });
  sync();

  // ---- частицы снизу вверх (цвет из палитры и темы, параметры из настроек) ----
  const cv = document.createElement('canvas'); cv.id = 'bg'; document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  const OS = matchMedia('(prefers-reduced-motion: reduce)').matches ? .35 : 1;
  let W, H, ps = [], col = '235,235,240', raf = 0;
  const readCol = () => { col = getComputedStyle(root).getPropertyValue('--p').trim() || col; };
  new MutationObserver(readCol).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] }); readCol();
  const mk = (init, big) => ({ big, x: Math.random() * W, y: init ? Math.random() * H : H + 60,
    r: big ? Math.random() * 40 + 24 : Math.random() * 2 + .8,
    v: big ? Math.random() * .15 + .06 : Math.random() * .6 + .2,
    a: big ? Math.random() * .07 + .04 : Math.random() * .5 + .4, ph: Math.random() * 6.28, s: Math.random() * .6 + .2 });
  const build = () => {
    ps = [...Array.from({ length: Math.floor(Math.min(110, W / 12) * S.density) }, () => mk(true, false)),
          ...Array.from({ length: Math.round(7 * Math.min(S.density, 1.5)) }, () => mk(true, true))];
  };
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); build();
  };
  addEventListener('resize', size);
  function tick() {
    if (!S.particles) { ctx.clearRect(0, 0, W, H); raf = 0; return; }
    const sp = (S.motion ? S.speed : 0) * OS, k = Math.min(sp, 1);
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.y -= p.v * sp; p.ph += .01 * k; p.x += Math.sin(p.ph) * p.s * .4 * k;
      if (p.y < -p.r - 20) Object.assign(p, mk(false, p.big));
      const a = Math.max(p.a * Math.min(1, (p.y + 20) / (H * .35)) * Math.min(1, (H - p.y) / 80), 0);
      if (p.big) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.shadowBlur = 0; ctx.fillStyle = g;
      } else { ctx.fillStyle = ctx.shadowColor = `rgba(${col},${a})`; ctx.shadowBlur = p.r * 7; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }
  pc = () => { build(); if (S.particles && !raf) tick(); };
  size(); tick();

  // ---- показать/скрыть пароль ----
  const EYE = '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  $$('input[type=password]').forEach(i => {
    const w = document.createElement('div'); w.className = 'pwwrap'; i.parentNode.insertBefore(w, i); w.appendChild(i);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'eye'; b.setAttribute('aria-label', 'Показать пароль'); b.innerHTML = EYE;
    b.onclick = () => { const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.classList.toggle('on', show); b.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль'); };
    w.appendChild(b);
  });

  // ---- бургер-меню ----
  const rightEl = document.querySelector('.right'), linksEl = document.querySelector('.links');
  if (rightEl && linksEl) {
    const bg = document.createElement('button'); bg.className = 'theme burger'; bg.setAttribute('aria-label', 'Меню');
    bg.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    rightEl.appendChild(bg);
    bg.onclick = e => { e.stopPropagation(); linksEl.classList.toggle('open'); };
    document.addEventListener('click', e => { if (!e.target.closest('.links')) linksEl.classList.remove('open'); });
    linksEl.addEventListener('click', e => { if (e.target.closest('a')) linksEl.classList.remove('open'); });
  }

  // ---- анимированные счётчики ----
  const run = el => {
    const to = Number(el.dataset.count) || 0, suf = el.dataset.suffix || '', t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / 1000); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cio.unobserve(e.target); run(e.target); } }), { threshold: .3 });
  window.watchCounts = (r = document) => r.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
  watchCounts();

  // ---- конфетти ----
  window.burst = (x, y) => {
    if (!S.motion) return;
    for (let i = 0; i < 28; i++) {
      const el = document.createElement('i'); el.className = 'cf';
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.background = i % 3 ? `rgb(${col})` : 'var(--text)';
      document.body.appendChild(el);
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
      el.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 80}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
        { duration: 800 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => el.remove();
    }
  };

  // ---- 3D-наклон карточки и смена слов в заголовке ----
  if (matchMedia('(hover:hover)').matches) {
    document.addEventListener('pointermove', e => {
      const t = e.target.closest && e.target.closest('[data-tilt]'); if (!t || !S.motion) return;
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      t.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
    });
    document.addEventListener('pointerout', e => { const t = e.target.closest && e.target.closest('[data-tilt]'); if (t && !t.contains(e.relatedTarget)) t.style.transform = ''; });
  }
  $$('.rot').forEach(el => {
    const w = el.dataset.words.split('|'); let i = 0;
    setInterval(() => { if (!S.motion || document.hidden) return; el.classList.add('swap'); setTimeout(() => { i = (i + 1) % w.length; el.textContent = w[i]; el.classList.remove('swap'); }, 450); }, 3400);
  });
})();
