/* museum.js: renders ROOMS from exhibits.js, lights exhibits as they enter view, lightbox. */
(function () {
  /* themes: ?theme=<name> (remembered). ?pick shows the switcher. */
  const THEMES = [['graphite', 'Graphite'], ['charcoal', 'Charcoal'], ['scope', 'Scope'], ['dusk', 'Dusk'], ['linen', 'Linen'], ['paper', 'Paper'], ['warm', 'Warm']];
  const qs = new URLSearchParams(location.search);
  const setTheme = t => { document.documentElement.dataset.theme = t; try { localStorage.setItem('ab_theme', t); } catch (_) {} document.querySelectorAll('.theme-pick button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t)); };
  if (qs.has('pick') || qs.has('theme')) {
    const p = document.createElement('div'); p.className = 'theme-pick';
    p.innerHTML = '<span>Theme</span>' + THEMES.map(([k, n]) => `<button data-t="${k}">${n}</button>`).join('');
    p.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTheme(b.dataset.t); });
    document.body.appendChild(p);
  }
  setTheme(document.documentElement.dataset.theme || 'graphite');
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zoomable = [];

  const img = (o, cls = '') => {
    const i = zoomable.push(o) - 1;
    return `<figure class="lit reveal ${cls}"><div class="work zoom ${o.light ? 'mat' : ''}" data-z="${i}">
      <img src="${o.src}.webp" alt="${esc(o.cap || '')}" width="${o.w}" height="${o.h}" loading="lazy" decoding="async"></div>
      ${o.cap ? `<figcaption class="cap">${esc(o.cap)}</figcaption>` : ''}</figure>`;
  };
  const label = e => `<aside class="label reveal">
      <h3 class="label-title">${esc(e.title)}</h3>
      <p class="label-meta">${esc(e.year)} · ${esc(e.medium)}</p>
      <p class="label-text">${esc(e.text)}</p>
      ${e.links ? `<div class="label-links">${e.links.map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}</div>` : ''}
    </aside>`;

  /* board viewer: 3D model / layout / schematic behind one row of tabs */
  const b3d = v => `<div class="b3d" data-model="${v.model}" data-alt="${esc(v.cap)}" style="--plate:transparent">
      <div class="b3d-stage"><img class="b3d-poster" src="${v.src}.webp" alt="${esc(v.cap)}" decoding="async"></div>
      <div class="b3d-ui"><div class="b3d-views" role="group" aria-label="Camera">
        <button data-view="iso" aria-pressed="true">Iso</button><button data-view="top">Top</button><button data-view="bottom">Bottom</button><button data-view="side">Side</button></div>
        <button class="b3d-spin" data-spin aria-pressed="true" title="Auto-rotate">⟳</button></div>
      <span class="b3d-hint">Drag to turn · scroll to zoom</span><span class="b3d-status" aria-live="polite"></span></div>`;
  const board = it => `<figure class="bview lit reveal" data-bv>
      <div class="bv-tabs" role="tablist">${it.views.map((v, i) => `<button role="tab" data-i="${i}" aria-selected="${!i}">${esc(v.label)}</button>`).join('')}</div>
      <div class="bv-stage work">${it.views.map((v, i) => v.model
        ? `<div class="bv-pane is-3d" data-cap="${esc(v.cap)}"${i ? ' hidden' : ''}>${b3d(v)}</div>`
        : `<div class="bv-pane zoom" data-z="${zoomable.push({ src: v.src, cap: v.cap }) - 1}" data-cap="${esc(v.cap)}" style="background:${v.plate || '#fff'}"${i ? ' hidden' : ''}><img src="${v.src}.webp" alt="${esc(v.cap)}" loading="lazy" decoding="async"></div>`).join('')}</div>
      <figcaption class="cap bv-cap">${esc(it.views[0].cap)}</figcaption></figure>`;

  const render = {
    salon: e => `<div class="salon-wrap" id="ex-${e.no}"><div class="salon">${e.photos.map(p => img(p, 'cell a-' + p.area)).join('')}</div>${label(e)}</div>`,
    piece: e => {
      const sq = e.img.h / e.img.w > 0.85 ? ' square' : '';
      return `<div class="piece${e.flip ? ' flip' : ''}${sq}" id="ex-${e.no}">${img(e.img)}${label(e)}</div>`;
    },
    pair: e => `<div class="piece${e.flip ? ' flip' : ''}" id="ex-${e.no}"><div class="pair">${e.imgs.map(p => img(p)).join('')}</div>${label(e)}</div>`,
    duo: e => `<div class="duo">${e.items.map(it => `<div class="duo-item" id="ex-${it.no}">${it.views ? board(it) : img(it.img)}${label(it)}</div>`).join('')}</div>`,
    video: e => `<div class="video-wall" id="ex-${e.no}">
        <figure class="lit reveal vw-v"><div class="work vframe">
          <video src="${e.video.src}" poster="${e.video.poster}" width="${e.video.w}" height="${e.video.h}" muted loop playsinline preload="metadata"></video>
          <button class="sound" type="button" aria-label="Play with sound">▶ Play with sound</button></div>
          <figcaption class="cap">${esc(e.video.cap)}</figcaption></figure>
        ${img(e.side[0], 'vw-b')}${img(e.side[1], 'vw-c')}
        ${label(e)}</div>`,
  };

  $('#rooms').innerHTML = ROOMS.map(r => `
    <section class="room" id="room-${r.id}" data-room="${r.id}">
      <div class="room-head reveal"><span class="room-num">${r.numeral}</span><h2 class="room-name">${esc(r.name)}</h2><span class="room-note">${esc(r.note)}</span></div>
      ${r.exhibits.map(e => render[e.kind](e)).join('')}
    </section>`).join('');
  $('#rooms-nav').innerHTML = ROOMS.map(r => `<a href="#room-${r.id}" data-for="${r.id}">${esc(r.name)}</a>`).join('');
  document.addEventListener('click', e => {
    const t = e.target.closest('.bv-tabs [role=tab]'); if (!t) return;
    const f = t.closest('[data-bv]'), i = +t.dataset.i, panes = f.querySelectorAll('.bv-pane');
    f.querySelectorAll('.bv-tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', b === t));
    panes.forEach((p, k) => p.hidden = k !== i);
    $('.bv-cap', f).textContent = panes[i].dataset.cap;
  });
  if (document.querySelector('.b3d')) import('./board3d.js').then(() => window.mountBoards3D && window.mountBoards3D()).catch(err => console.warn(err));
  $('#hang').innerHTML = WALL.map((p, k) => `<a class="hung" href="#${p.to}" style="--ar:${p.ar.toFixed(4)};--h:${p.h};--k:${k};--g:${p.g}" aria-label="${esc(p.label)}">
      <span class="frame${p.mat ? ' mat' : ''}${p.phone ? ' phone' : ''}"><img src="${p.src}.webp" alt="" ${k < 3 ? 'fetchpriority="high"' : 'loading="lazy"'}></span>
      <span class="plaque mono">${esc(p.label)}</span></a>`).join('');
  requestAnimationFrame(() => setTimeout(() => $('#hang').classList.add('lights'), 150));
  $('#seeking').textContent = GALLERY.seeking;
  $('#contacts').innerHTML = `<a href="mailto:${GALLERY.email}">${GALLERY.email}</a><a href="${GALLERY.linkedin}" target="_blank" rel="noopener">LinkedIn</a><a href="${GALLERY.resume}" target="_blank" rel="noopener">Résumé (PDF)</a>`;

  // lights come up as you walk in
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in-view'); }
  }), { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  document.querySelectorAll('.reveal, .lit').forEach(el => reduce ? el.classList.add('in-view') : io.observe(el));

  // videos: play muted while on screen; button restarts with sound
  document.querySelectorAll('.vframe').forEach(f => {
    const v = $('video', f), b = $('.sound', f);
    if (!reduce) new IntersectionObserver(([en]) => { if (v.muted) en.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.4 }).observe(v);
    b.addEventListener('click', () => {
      if (v.muted) { v.muted = false; v.loop = false; v.currentTime = 0; v.play(); b.textContent = '❚❚ Pause'; }
      else if (v.paused) { v.play(); b.textContent = '❚❚ Pause'; }
      else { v.pause(); b.textContent = '▶ Play'; }
    });
    v.addEventListener('ended', () => { b.textContent = '↺ Replay with sound'; v.muted = true; });
  });

  // nav: current room
  const navIO = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) document.querySelectorAll('.bar-nav a').forEach(a => a.classList.toggle('on', a.dataset.for === en.target.dataset.room));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('.room').forEach(r => navIO.observe(r));

  // lightbox
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb); let cur = 0;
  const show = i => { cur = (i + zoomable.length) % zoomable.length; const o = zoomable[cur]; lbImg.src = o.src + '.webp'; lbImg.alt = o.cap || ''; lbCap.textContent = o.cap || ''; };
  const open = i => { show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  document.addEventListener('click', e => { const z = e.target.closest('[data-z]'); if (z) open(+z.dataset.z); });
  $('.lb-close', lb).onclick = close; $('.lb-prev', lb).onclick = () => show(cur - 1); $('.lb-next', lb).onclick = () => show(cur + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
})();
