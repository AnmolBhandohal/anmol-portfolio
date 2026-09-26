/* ═══════════════════════════════════════════════════════════
   viewer.js — tabbed figure viewer + full-screen lightbox.
   Usage: viewerHTML(gallery) → markup; one delegated listener
   handles every viewer on the page. Keyboard: ←/→ in the
   lightbox, Esc to close.
   gallery = [{ src, label, alt, cap }]
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';
/* 3D board viewer markup. The still render stays underneath as the fallback. */
window.board3dHTML = function (model, poster, alt, plate) {
  return `<div class="b3d" data-model="${model}" data-alt="${alt}" style="--plate:${plate || '#0A0D11'}">
    <div class="b3d-stage"><img class="b3d-poster" src="${poster}" alt="${alt}" decoding="async"></div>
    <div class="b3d-ui">
      <div class="b3d-views" role="group" aria-label="Camera">
        <button data-view="iso" aria-pressed="true">Iso</button><button data-view="top">Top</button>
        <button data-view="bottom">Bottom</button><button data-view="side">Side</button>
      </div>
      <button class="b3d-spin" data-spin aria-pressed="true" title="Auto-rotate">⟳</button>
    </div>
    <span class="b3d-hint"><span class="b3d-hm">Drag to orbit · scroll to zoom · right-drag to pan</span><span class="b3d-ht">Drag to orbit · pinch to zoom</span></span>
    <span class="b3d-status" aria-live="polite"></span>
  </div>`;
};

let uid = 0;
window.viewerHTML = function (g, opts = {}) {
  const id = 'vw' + (++uid);
  return `<figure class="vw${opts.compact ? ' vw-compact' : ''}" data-vw="${id}">
    <div class="vw-tabs" role="tablist" aria-label="Figure views">
      ${g.map((v, i) => `<button role="tab" aria-selected="${i === 0}" aria-controls="${id}-${i}" data-i="${i}">
        <i>${String(i + 1).padStart(2, '0')}</i>${v.label}</button>`).join('')}
      <button class="vw-full" data-full aria-label="Open full screen">Full screen ⤢</button>
    </div>
    <div class="vw-stage${g[0].model ? ' is-3d' : ''}" style="background:${g[0].plate || '#0A0D11'}">
      ${g.map((v, i) => v.model
        ? `<div id="${id}-${i}" role="tabpanel" class="vw-3d" ${i ? 'hidden' : ''}>${board3dHTML(v.model, v.src, v.alt, v.plate)}</div>`
        : `<img id="${id}-${i}" role="tabpanel" src="${v.src}" alt="${v.alt}"
        loading="${i ? 'lazy' : 'eager'}" decoding="async" ${i ? 'hidden' : ''} data-full>`).join('')}
    </div>
    <figcaption class="vw-cap">${g[0].cap}</figcaption>
  </figure>`;
};

const G = new WeakMap();
window.bindViewer = function (el, g) { G.set(el, g); };

function show(fig, i) {
  const g = G.get(fig); if (!g) return;
  fig.querySelectorAll('[role=tab]').forEach((t, k) => t.setAttribute('aria-selected', k === i));
  fig.querySelectorAll('.vw-stage > [role=tabpanel]').forEach((im, k) => im.hidden = k !== i);
  fig.querySelector('.vw-stage').classList.toggle('is-3d', !!g[i].model);
  fig.querySelector('.vw-stage').style.background = g[i].plate || '#0A0D11';
  fig.querySelector('.vw-cap').innerHTML = g[i].cap;
  fig.dataset.cur = i;
}

/* lightbox */
const lb = document.createElement('div');
lb.className = 'lb'; lb.hidden = true;
lb.innerHTML = `<div class="lb-bar"><span class="lb-t"></span><span class="lb-n"></span>
  <button class="lb-x" aria-label="Close">Close ✕</button></div>
  <div class="lb-stage"><button class="lb-p" aria-label="Previous">←</button><img alt=""><button class="lb-nx" aria-label="Next">→</button></div>
  <p class="lb-cap"></p>`;
document.body.appendChild(lb);
let lg = null, li = 0, lastFocus = null;
function lbShow(i) {
  li = (i + lg.length) % lg.length;
  const v = lg[li], im = lb.querySelector('img');
  im.src = v.src; im.alt = v.alt; im.style.background = v.plate || 'transparent';
  lb.querySelector('.lb-t').textContent = v.label;
  lb.querySelector('.lb-n').textContent = `${li + 1} / ${lg.length}`;
  lb.querySelector('.lb-cap').innerHTML = v.cap;
}
function lbOpen(g, i) {
  lg = g; lastFocus = document.activeElement; lb.hidden = false;
  document.documentElement.classList.add('lb-open'); lbShow(i);
  lb.querySelector('.lb-x').focus();
}
window.openLightbox = (g, i) => lbOpen(g, i || 0);
function lbClose() { lb.hidden = true; document.documentElement.classList.remove('lb-open'); lastFocus && lastFocus.focus(); }
lb.addEventListener('click', e => {
  if (e.target.closest('.lb-x') || e.target === lb || e.target.classList.contains('lb-stage')) lbClose();
  if (e.target.closest('.lb-p')) lbShow(li - 1);
  if (e.target.closest('.lb-nx')) lbShow(li + 1);
});
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') { e.stopImmediatePropagation(); lbClose(); }
  if (e.key === 'ArrowLeft') { e.stopImmediatePropagation(); lbShow(li - 1); }
  if (e.key === 'ArrowRight') { e.stopImmediatePropagation(); lbShow(li + 1); }
}, true);

document.addEventListener('click', e => {
  const fig = e.target.closest('.vw'); if (!fig) return;
  const tab = e.target.closest('[role=tab]');
  if (tab) return show(fig, +tab.dataset.i);
  if (e.target.closest('.b3d')) return;
  if (e.target.closest('[data-full]')) { const g = G.get(fig); if (g) lbOpen(g, +(fig.dataset.cur || 0)); }
});
document.addEventListener('keydown', e => {
  const tab = e.target.closest && e.target.closest('.vw [role=tab]'); if (!tab) return;
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const fig = tab.closest('.vw'), n = G.get(fig).length;
  const i = (+tab.dataset.i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
  show(fig, i); fig.querySelectorAll('[role=tab]')[i].focus();
});
})();
