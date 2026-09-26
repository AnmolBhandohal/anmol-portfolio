/* ═══════════════════════════════════════════════════════════
   explorer.js — schematic explorer with a real magnifier.

   The full sheet sits on the left. Each block's HD screenshot is
   registered onto the sheet (position/scale found by template
   matching), so the cursor maps to an exact pixel in the HD image.

   Hover a block → a lens rides the cursor on the sheet, and the
   right-hand LOUPE shows that spot from the HD image at native
   resolution (≈2–3.5× what the sheet shows). Scroll / + − changes
   zoom. Click pins the view; click again → full screen.
   Touch: tap a block, then drag inside the loupe to pan.
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
                  || localStorage.getItem('ab_motion') === 'off';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

window.explorerHTML = function (key) {
  const d = window[key]; if (!d) return '';
  const tabs = ['Overview', ...d.blocks.map(b => b.label)];
  return `<figure class="sx" data-sx="${key}">
  <div class="sx-head"><span class="lab-tag">SCHEMATIC EXPLORER</span>
    <span class="sx-hint"><span class="sx-m">Move over a block to magnify · scroll to zoom · click to pin</span><span class="sx-t">Tap a block · drag the loupe to pan</span></span></div>
  <div class="sx-body">
    <div class="sx-stage" style="background:${d.plate}">
      <img class="sx-full" src="${d.full}" alt="${d.fullAlt}" decoding="async">
      ${d.blocks.map((b, i) => `<button class="sx-hot" data-b="${i}" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%"
          aria-label="Magnify ${b.label}"><em><i>${String(i + 1).padStart(2, '0')}</i>${b.label}</em></button>`).join('')}
      <span class="sx-lens" aria-hidden="true"></span>
    </div>
    <div class="sx-pane">
      <div class="sx-tabs" role="tablist" aria-label="Schematic blocks">
        ${tabs.map((t, i) => `<button role="tab" data-t="${i - 1}" aria-selected="${i === 0}">${i ? `<i>${String(i).padStart(2, '0')}</i>` : ''}${t}</button>`).join('')}
      </div>
      <div class="sx-view">
        <div class="sx-over" data-v="-1">
          <ol class="sx-list">
            ${d.blocks.map((b, i) => `<li><button data-b="${i}"><i>${String(i + 1).padStart(2, '0')}</i>
              <b>${b.label}</b><span>${b.short}</span></button></li>`).join('')}
          </ol>
          ${d.board ? `<button class="sx-board" data-board style="background:${d.board.plate}" aria-label="Open the 3D board view full screen">
            <img src="${d.board.src}" alt="${d.board.alt}" loading="lazy" decoding="async"><span>${d.board.cap} ⤢</span></button>` : ''}
        </div>
        <div class="sx-zoom" data-v="z" hidden>
          <div class="sx-loupe" style="background-color:${d.plate.startsWith('#') ? d.plate : '#fff'}" tabindex="0"
               aria-label="Magnified view. Use arrow keys to pan, plus and minus to zoom.">
            <div class="sx-tile"></div>
            <span class="sx-mag"></span>
            <div class="sx-zbtn"><button data-z="-1" aria-label="Zoom out">−</button><button data-z="1" aria-label="Zoom in">+</button>
              <button data-fs aria-label="Full screen">⤢</button></div>
          </div>
          <p class="sx-cap"></p>
        </div>
      </div>
    </div>
  </div>
  <figcaption class="sx-foot">${d.title}</figcaption>
</figure>`;
};

function mount(fig) {
  if (fig.dataset.bound) return; fig.dataset.bound = 1;
  const d = window[fig.dataset.sx];
  const stage = fig.querySelector('.sx-stage'), fullImg = fig.querySelector('.sx-full');
  const lens = fig.querySelector('.sx-lens'), hots = [...fig.querySelectorAll('.sx-hot')];
  const tabs = [...fig.querySelectorAll('[role=tab]')];
  const over = fig.querySelector('.sx-over'), zoom = fig.querySelector('.sx-zoom');
  const loupe = fig.querySelector('.sx-loupe'), tile = fig.querySelector('.sx-tile');
  const magEl = fig.querySelector('.sx-mag'), cap = fig.querySelector('.sx-cap');

  /* preload every HD image once, so the first hover is instant */
  const hd = d.blocks.map(b => { const im = new Image(); im.decoding = 'async'; return im; });
  let preloaded = false;
  const preload = () => { if (preloaded) return; preloaded = true; d.blocks.forEach((b, i) => hd[i].src = b.src); };
  if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => {
    if (es.some(e => e.isIntersecting)) { preload(); o.disconnect(); }
  }, { rootMargin: '600px' }).observe(fig); else preload();

  let cur = -1, pinned = false;
  let zf = 1;              // zoom factor relative to "native HD pixels"
  let u = .5, v = .5;      // focus point, 0..1 within the block
  let tu = .5, tv = .5, raf = 0;

  const B = () => d.blocks[cur];
  function geom() {        // loupe px, HD px, and rendered scale
    const L = loupe.getBoundingClientRect(), b = B();
    const s = zf;          // 1 = one HD pixel per CSS px
    return { L, b, s, W: b.hdW * s, H: b.hdH * s };
  }
  function magnification() {   // vs. how big the block renders on the sheet
    const sheetW = stage.getBoundingClientRect().width * B().w / 100;
    return (B().hdW * zf) / sheetW;
  }
  function render() {
    if (cur < 0) return;
    const { L, W, H } = geom();
    const x = clamp(L.width / 2 - u * W, Math.min(0, L.width - W), Math.max(0, (L.width - W) / 2));
    const y = clamp(L.height / 2 - v * H, Math.min(0, L.height - H), Math.max(0, (L.height - H) / 2));
    tile.style.width = W + 'px'; tile.style.height = H + 'px';
    tile.style.transform = `translate3d(${x}px,${y}px,0)`;
    magEl.textContent = magnification().toFixed(1) + '×';
    /* lens on the sheet shows the region visible in the loupe */
    const S = stage.getBoundingClientRect(), b = B();
    const bw = S.width * b.w / 100, bh = S.height * b.h / 100;
    const lw = clamp(L.width / W, 0, 1) * bw, lh = clamp(L.height / H, 0, 1) * bh;
    const lx = S.width * b.x / 100 + (-x / W) * bw, ly = S.height * b.y / 100 + (-y / H) * bh;
    lens.style.cssText = `width:${lw}px;height:${lh}px;transform:translate3d(${lx}px,${ly}px,0)`;
  }
  function glide() {
    raf = 0; const k = reduced() ? 1 : .32;
    u += (tu - u) * k; v += (tv - v) * k; render();
    if (Math.abs(tu - u) > 1e-4 || Math.abs(tv - v) > 1e-4) raf = requestAnimationFrame(glide);
  }
  const aim = (a, b) => { tu = clamp(a, 0, 1); tv = clamp(b, 0, 1); if (!raf) raf = requestAnimationFrame(glide); };

  function select(i, keepPoint) {
    preload();
    const changed = i !== cur; cur = i;
    stage.classList.toggle('has-active', i >= 0);
    hots.forEach((h, k) => h.classList.toggle('on', k === i));
    tabs.forEach(t => t.setAttribute('aria-selected', +t.dataset.t === i));
    over.hidden = i >= 0; zoom.hidden = i < 0; lens.classList.toggle('show', i >= 0);
    if (i < 0) { pinned = false; fig.classList.remove('pinned'); return; }
    if (changed) {
      tile.style.backgroundImage = `url("${B().src}")`;
      cap.innerHTML = B().cap;
      zf = 1;                                   // native HD pixels
      if (!keepPoint) { u = tu = .5; v = tv = .5; }
      if (!reduced()) tile.animate([{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }],
        { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    render();
  }
  function setZoom(dir, cx, cy) {
    if (cur < 0) return;
    const { L } = geom();
    const min = Math.max(L.width / B().hdW, L.height / B().hdH) * .98;  // fit
    const nz = clamp(zf * (dir > 0 ? 1.25 : 0.8), Math.min(min, 1), 2.5);
    zf = nz; render();
  }
  const fullscreen = () => {
    if (!window.openLightbox) return;
    const g = [{ src: d.full, label: 'Full sheet', alt: d.fullAlt, cap: d.title, plate: d.plate },
      ...d.blocks.map(b => ({ src: b.src, label: b.label, alt: b.alt, cap: b.cap, plate: d.plate }))];
    openLightbox(g, cur + 1);
  };

  /* ── sheet: hover tracks the cursor ── */
  const blockAt = (px, py) => d.blocks.findIndex(b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || pinned) return;
    const S = stage.getBoundingClientRect();
    const px = (e.clientX - S.left) / S.width * 100, py = (e.clientY - S.top) / S.height * 100;
    const i = blockAt(px, py); if (i < 0) return;
    const b = d.blocks[i], a = (px - b.x) / b.w, c = (py - b.y) / b.h;
    if (i !== cur) { select(i, true); u = a; v = c; tu = a; tv = c; render(); } else aim(a, c);
  });
  stage.addEventListener('click', e => {
    const S = stage.getBoundingClientRect();
    const px = (e.clientX - S.left) / S.width * 100, py = (e.clientY - S.top) / S.height * 100;
    const i = blockAt(px, py); if (i < 0) return;
    const b = d.blocks[i], a = (px - b.x) / b.w, c = (py - b.y) / b.h;
    if (pinned && i === cur) { fullscreen(); return; }
    select(i, true); u = tu = a; v = tv = c; render();
    pinned = e.pointerType !== 'mouse' ? true : !pinned || i !== cur ? true : false;
    fig.classList.toggle('pinned', pinned);
  });
  stage.addEventListener('wheel', e => {
    if (cur < 0 || !stage.classList.contains('has-active')) return;
    e.preventDefault(); setZoom(e.deltaY < 0 ? 1 : -1);
  }, { passive: false });
  hots.forEach((h, i) => h.addEventListener('focus', () => select(i)));
  hots.forEach(h => h.addEventListener('click', e => e.preventDefault()));

  /* ── loupe: wheel zoom, drag to pan (mouse + touch), keys ── */
  loupe.addEventListener('wheel', e => { e.preventDefault(); setZoom(e.deltaY < 0 ? 1 : -1); }, { passive: false });
  let drag = null;
  loupe.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    drag = { x: e.clientX, y: e.clientY, u, v }; loupe.setPointerCapture(e.pointerId);
    pinned = true; fig.classList.add('pinned');
  });
  loupe.addEventListener('pointermove', e => {
    if (!drag) return; const { W, H } = geom();
    u = tu = clamp(drag.u - (e.clientX - drag.x) / W, 0, 1);
    v = tv = clamp(drag.v - (e.clientY - drag.y) / H, 0, 1); render();
  });
  const end = () => { drag = null; };
  loupe.addEventListener('pointerup', end); loupe.addEventListener('pointercancel', end);
  loupe.addEventListener('keydown', e => {
    const st = .06;
    if (e.key === 'ArrowLeft') aim(u - st, v); else if (e.key === 'ArrowRight') aim(u + st, v);
    else if (e.key === 'ArrowUp') aim(u, v - st); else if (e.key === 'ArrowDown') aim(u, v + st);
    else if (e.key === '+' || e.key === '=') setZoom(1); else if (e.key === '-') setZoom(-1);
    else return; e.preventDefault();
  });
  fig.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => setZoom(+b.dataset.z)));
  fig.querySelector('[data-fs]').addEventListener('click', fullscreen);

  /* ── tabs / list / board ── */
  tabs.forEach(t => t.addEventListener('click', () => {
    pinned = +t.dataset.t >= 0; fig.classList.toggle('pinned', pinned); select(+t.dataset.t);
  }));
  fig.querySelectorAll('.sx-list [data-b]').forEach(b => b.addEventListener('click', () => {
    pinned = true; fig.classList.add('pinned'); select(+b.dataset.b);
  }));
  fig.addEventListener('keydown', e => {
    if (!e.target.closest('[role=tab]') || !/Arrow(Left|Right)/.test(e.key)) return;
    const n = d.blocks.length + 1, k = ((cur + 1) + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    tabs[k].click(); tabs[k].focus();
  });
  const bd = fig.querySelector('[data-board]');
  if (bd) bd.addEventListener('click', () => window.openLightbox && openLightbox([
    { src: d.board.src, label: '3D board', alt: d.board.alt, cap: d.board.cap, plate: d.board.plate },
    { src: d.full, label: 'Full sheet', alt: d.fullAlt, cap: d.title, plate: d.plate }], 0));

  /* leaving the figure un-pinned returns to overview */
  fig.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !pinned) select(-1); });
  addEventListener('resize', () => cur >= 0 && render());
}
window.mountExplorers = () => document.querySelectorAll('.sx').forEach(mount);
if (document.readyState !== 'loading') window.mountExplorers(); else addEventListener('DOMContentLoaded', window.mountExplorers);
})();
