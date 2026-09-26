/* ═══════════════════════════════════════════════════════════
   explorer.js — schematic explorer.
   Full sheet on the left; hover (or focus, or tap) a functional
   block and its HD crop zooms up in the detail pane — out of the
   exact spot on the sheet it came from. The block stays lit on the
   sheet so you never lose your place. Click → full screen.
   Data: { title, full, fullAlt, plate, blocks:[{label,src,alt,cap,
           short,x,y,w,h}] }  (x,y,w,h = % of the full sheet)
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
                  || localStorage.getItem('ab_motion') === 'off';

window.explorerHTML = function (key) {
  const d = window[key]; if (!d) return '';
  const tabs = ['Overview', ...d.blocks.map(b => b.label)];
  return `<figure class="sx" data-sx="${key}">
  <div class="sx-head"><span class="lab-tag">SCHEMATIC EXPLORER</span>
    <span class="sx-hint"><span class="sx-m">Hover a block to zoom in · click for full screen</span><span class="sx-t">Tap a block to zoom in</span></span></div>
  <div class="sx-body">
    <div class="sx-stage" style="background:${d.plate}">
      <img class="sx-full" src="${d.full}" alt="${d.fullAlt}" decoding="async">
      ${d.blocks.map((b, i) => `<button class="sx-hot" data-b="${i}" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%"
          aria-label="Zoom into ${b.label}"><em><i>${String(i + 1).padStart(2, '0')}</i>${b.label}</em></button>`).join('')}
    </div>
    <div class="sx-pane">
      <div class="sx-tabs" role="tablist" aria-label="Schematic blocks">
        ${tabs.map((t, i) => `<button role="tab" data-t="${i - 1}" aria-selected="${i === 0}">${i ? `<i>${String(i).padStart(2, '0')}</i>` : ''}${t}</button>`).join('')}
      </div>
      <div class="sx-view">
        <ol class="sx-list" data-v="-1">
          ${d.blocks.map((b, i) => `<li><button data-b="${i}"><i>${String(i + 1).padStart(2, '0')}</i>
            <b>${b.label}</b><span>${b.short}</span></button></li>`).join('')}
        </ol>
        ${d.board ? `<button class="sx-board" data-v="-1" data-board style="background:${d.board.plate}" aria-label="Open the 3D board view full screen">
          <img src="${d.board.src}" alt="${d.board.alt}" loading="lazy" decoding="async"><span>${d.board.cap} ⤢</span></button>` : ''}
        ${d.blocks.map((b, i) => `<div class="sx-zoom" data-v="${i}" hidden>
          <button class="sx-img" data-b="${i}" style="background:${d.plate}" aria-label="Open ${b.label} full screen">
            <img data-src="${b.src}" alt="${b.alt}" decoding="async"></button>
          <p class="sx-cap">${b.cap}</p></div>`).join('')}
      </div>
    </div>
  </div>
  <figcaption class="sx-foot">${d.title}</figcaption>
</figure>`;
};

function mount(fig) {
  if (fig.dataset.bound) return; fig.dataset.bound = 1;
  const d = window[fig.dataset.sx], stage = fig.querySelector('.sx-stage');
  const hots = [...fig.querySelectorAll('.sx-hot')], tabs = [...fig.querySelectorAll('[role=tab]')];
  const views = [...fig.querySelectorAll('.sx-view > [data-v]')];
  let cur = -1, timer = 0, loaded = false;

  const load = () => {
    if (loaded) return; loaded = true;
    fig.querySelectorAll('.sx-img img').forEach(im => { im.src = im.dataset.src; });
  };
  function select(i, animate = true) {
    if (i === cur) return;
    cur = i; load();
    stage.classList.toggle('has-active', i >= 0);
    hots.forEach((h, k) => h.classList.toggle('on', k === i));
    tabs.forEach(t => t.setAttribute('aria-selected', +t.dataset.t === i));
    views.forEach(v => v.hidden = +v.dataset.v !== i);
    if (i >= 0 && animate && !reduced()) {
      const b = d.blocks[i], im = fig.querySelector(`.sx-zoom[data-v="${i}"] img`);
      const ox = b.x + b.w / 2, oy = b.y + b.h / 2;
      im.animate([
        { transform: 'scale(.42)', opacity: 0, transformOrigin: `${ox}% ${oy}%`, filter: 'blur(3px)' },
        { transform: 'scale(1)', opacity: 1, transformOrigin: `${ox}% ${oy}%`, filter: 'blur(0)' }
      ], { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }
  const full = i => {
    if (!window.openLightbox) return;
    const g = [{ src: d.full, label: 'Full sheet', alt: d.fullAlt, cap: d.title, plate: d.plate },
      ...d.blocks.map(b => ({ src: b.src, label: b.label, alt: b.alt, cap: b.cap, plate: d.plate }))];
    openLightbox(g, i + 1);
  };

  stage.addEventListener('pointerenter', load, { once: true });
  hots.forEach((h, i) => {
    h.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(timer); timer = setTimeout(() => select(i), 70);
    });
    h.addEventListener('pointerleave', () => clearTimeout(timer));
    h.addEventListener('focus', () => select(i));
    h.addEventListener('click', () => { cur === i ? full(i) : select(i); });
  });
  tabs.forEach(t => t.addEventListener('click', () => select(+t.dataset.t)));
  fig.querySelectorAll('.sx-list [data-b]').forEach(b => b.addEventListener('click', () => select(+b.dataset.b)));
  fig.querySelectorAll('.sx-img').forEach(b => b.addEventListener('click', () => full(+b.dataset.b)));
  const bd = fig.querySelector('[data-board]');
  if (bd) bd.addEventListener('click', () => window.openLightbox && openLightbox([
    { src: d.board.src, label: '3D board', alt: d.board.alt, cap: d.board.cap, plate: d.board.plate },
    { src: d.full, label: 'Full sheet', alt: d.fullAlt, cap: d.title, plate: d.plate }], 0));
  fig.addEventListener('keydown', e => {
    if (!e.target.closest('[role=tab]') || !/Arrow(Left|Right)/.test(e.key)) return;
    const n = d.blocks.length + 1, k = ((cur + 1) + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    select(k - 1); tabs[k].focus();
  });
}
window.mountExplorers = () => document.querySelectorAll('.sx').forEach(mount);
if (document.readyState !== 'loading') window.mountExplorers(); else addEventListener('DOMContentLoaded', window.mountExplorers);
})();
