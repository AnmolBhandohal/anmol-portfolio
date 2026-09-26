/* ═══════════════════════════════════════════════════════════
   main.js — landing page render + motion + command palette.
   Content renders FIRST and never depends on GSAP: if the CDN
   is blocked, the page is complete and static.
   Lenis drives its RAF through GSAP's ticker: ONE loop only.
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';

const HAS_GSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const PREF_KEY = 'ab_motion';
let motionOn = localStorage.getItem(PREF_KEY) !== 'off'
            && !matchMedia('(prefers-reduced-motion: reduce)').matches && HAS_GSAP;
if (!motionOn) document.documentElement.classList.add('no-motion');

/* ── site strings ─────────────────────────────────── */
document.getElementById('availTag').textContent = `Available ${SITE.available} · Edmonton, AB`;
document.getElementById('yr').textContent = new Date().getFullYear();
document.getElementById('upd').textContent = `Rev ${SITE.rev} · ${SITE.updated}`;
document.getElementById('heroMail').href = `mailto:${SITE.email}`;

const arrow = `<svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M0 4h12M9 1l3 3-3 3"/></svg>`;
const chCls = p => p.ch === 1 ? 'ch1' : 'ch2';

/* ── INDEX (the 7-second layer) ───────────────────── */
const strip = s => s.replace(/<[^>]+>/g, '');
document.getElementById('idx').innerHTML = PROJECTS.map(p => `
  <li class="ix rv ${chCls(p)}">
    <a href="project.html?p=${p.id}">
      <span class="ix-n">${p.n}</span>
      <span class="ix-t"><b>${p.title}</b><i>${strip(p.problem)}</i></span>
      <span class="ix-k">${p.ch === 1 ? 'Field' : 'Project'}</span>
      <span class="ix-y">${p.year.replace(' — in development', '')}</span>
      <span class="ix-m">${p.metric ? `<b>${p.metric.value}</b> ${p.metric.unit}<i>${p.metric.label}</i>` : '<i>Personal tool</i>'}</span>
      <span class="ix-go">${arrow}</span>
    </a>
  </li>`).join('');

/* ── SKILLS ───────────────────────────────────────── */
document.getElementById('caps').innerHTML = SKILLS.map(s => `
  <div class="cap rv"><h4>${s.g}</h4><ul>
    ${s.items.map(([n, t]) => `<li>${n}${t ? `<b>${t}</b>` : ''}</li>`).join('')}
  </ul></div>`).join('');

/* ── CONTACT ──────────────────────────────────────── */
document.getElementById('ctaBtns').innerHTML = `
  <a class="btn pri" href="mailto:${SITE.email}"><span>${SITE.email}</span></a>
  <a class="btn" href="${SITE.resume}" download><span>Résumé · PDF</span></a>
  <a class="btn" href="${SITE.linkedin}" target="_blank" rel="noopener"><span>LinkedIn</span></a>
  <a class="btn" href="${SITE.github}" target="_blank" rel="noopener"><span>GitHub</span></a>`;

/* ── SCENES ───────────────────────────────────────── */
document.getElementById('work').innerHTML = PROJECTS.map(p => `
<section class="scene ${chCls(p)}${p.wide ? ' wide' : PROJECTS.indexOf(p) % 2 ? ' flip' : ''}" data-scene data-id="${p.id}" id="s-${p.id}">
  <div class="s-txt">
    <div class="s-meta">
      <span class="s-num">${p.n}</span>
      <span class="s-stat ${p.live ? 'live' : ''}">${p.status}</span>
    </div>
    <h2>${p.title.split(' ').map(w => `<span class="w"><i>${w}</i></span>`).join(' ')}</h2>
    <p class="s-role rv">${p.role} · ${p.year}</p>
    <p class="s-body rv">${p.body}</p>
    <dl class="specs rv">
      ${p.specs.map(([k, v]) => `<div class="spec"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
    </dl>
    <div class="s-tags rv">${p.tags.map(t => `<span class="s-tag">${t}</span>`).join('')}</div>
    <a class="s-cta rv" href="project.html?p=${p.id}"><span>Read the ${p.ch === 1 ? 'field record' : 'case study'} ${arrow}</span></a>
  </div>
  ${p.explore && window[p.explore]
    ? `<div class="s-exp">${explorerHTML(p.explore)}</div>`
    : p.gallery && window[p.gallery]
    ? `<div class="s-gal">${viewerHTML(window[p.gallery], { compact: true })}</div>`
    : p.feature
    ? `<div class="s-lab" data-lab="${p.feature}"></div>`
    : `<div class="s-vis ${p.featureFig ? 's-fig' : ''}" data-label="${p.featureFig ? 'PCB3.PcbDoc · PLACEMENT, REV A' : p.label}">
        ${p.photo ? `<img src="${p.photo}" alt="${p.title}" loading="lazy">` : p.featureFig ? window[p.featureFig] || p.viz : p.viz}
      </div>`}
</section>`).join('');

const rail = document.getElementById('rail');
rail.innerHTML = PROJECTS.map((p, i) =>
  `<button data-i="${i}" class="${chCls(p)}" title="${p.short}" aria-label="Jump to ${p.short}"><span>${p.n}</span><i></i></button>`).join('');
const railBtns = [...rail.querySelectorAll('button')];
window.mountLabs && window.mountLabs();
window.mountExplorers && window.mountExplorers();
document.querySelectorAll('.scene').forEach((sc, i) => {
  const p = PROJECTS[i], v = sc.querySelector('.vw');
  if (v && p.gallery) bindViewer(v, window[p.gallery]);
});
const scenes = [...document.querySelectorAll('[data-scene]')];

/* ── NAV ──────────────────────────────────────────── */
let lenis = null;
const go = t => lenis ? lenis.scrollTo(t, { offset: -30 }) : t.scrollIntoView({ behavior: motionOn ? 'smooth' : 'auto' });
railBtns.forEach(b => b.addEventListener('click', () => go(scenes[+b.dataset.i])));
document.querySelectorAll('nav a[href^="#"]').forEach(a =>
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href') === '#work' ? '#work-h' : a.getAttribute('href'));
    if (t) { e.preventDefault(); go(t); }
  }));

/* rail highlight without GSAP */
const workEl = document.getElementById('work');
new IntersectionObserver(es => es.forEach(e => rail.classList.toggle('show', e.isIntersecting)),
  { rootMargin: '-40% 0px -40% 0px' }).observe(workEl);
const railIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const i = scenes.indexOf(e.target);
  railBtns.forEach((b, j) => b.classList.toggle('on', j === i));
}), { rootMargin: '-45% 0px -45% 0px' });
scenes.forEach(s => railIO.observe(s));

/* ── MOTION ───────────────────────────────────────── */
function initLenis() {
  if (!motionOn || lenis || typeof Lenis === 'undefined') return;
  lenis = new Lenis({ autoRaf: false, duration: 1.05, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(lenisRaf);
  gsap.ticker.lagSmoothing(0);
}
function lenisRaf(t) { lenis && lenis.raf(t * 1000); }
function killLenis() { if (!lenis) return; gsap.ticker.remove(lenisRaf); lenis.destroy(); lenis = null; }

function primeDraw(root) {
  root.querySelectorAll('.draw').forEach(p => {
    const L = p.getTotalLength ? Math.ceil(p.getTotalLength()) : 300;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
  });
}

if (HAS_GSAP && motionOn) {
  gsap.registerPlugin(ScrollTrigger);
  initLenis();

  gsap.timeline({ delay: .05 })
    .from('h1 .ln>span', { yPercent: 110, duration: 1, stagger: .08, ease: 'expo.out' })
    .from('.tagrow,.lede,.hero-cta,.stats .stat', { y: 18, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out' }, '-=.7')
    .from('.inst', { y: 24, opacity: 0, duration: .9, ease: 'power3.out' }, '-=.8')
    .from('nav', { opacity: 0, duration: .6 }, '-=.9');

  scenes.forEach(sc => {
    const words = sc.querySelectorAll('h2 .w>i');
    const reveals = sc.querySelectorAll('.rv');
    const vis = sc.querySelector('.s-vis,.s-lab,.s-gal,.s-exp');
    primeDraw(sc);
    const draws = sc.querySelectorAll('.draw');
    const tl = gsap.timeline({ scrollTrigger: { trigger: sc, start: 'top 70%', once: true } })
      .from(words, { yPercent: 110, duration: .8, stagger: .035, ease: 'expo.out' })
      .from(vis, { opacity: 0, duration: .8, ease: 'power2.out' }, '-=.6');
    if (draws.length) tl.to(draws, { strokeDashoffset: 0, duration: 1.3, stagger: .04, ease: 'power2.inOut' }, '-=.5');
    tl.to(reveals, { opacity: 1, y: 0, duration: .7, stagger: .06, ease: 'power3.out' }, draws.length ? '-=1.2' : '-=.5');
    gsap.to(sc.querySelector('.s-num'), { yPercent: -30, ease: 'none',
      scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  });

  gsap.utils.toArray('.rv').forEach(el => {
    if (el.closest('[data-scene]')) return;
    gsap.to(el, { opacity: 1, y: 0, duration: .75, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  gsap.utils.toArray('.sh').forEach(el => gsap.from(el, { opacity: 0, y: 14, duration: .7,
    ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
}

/* ── MOTION TOGGLE ────────────────────────────────── */
const tgl = document.getElementById('motionTgl');
tgl.classList.toggle('off', !motionOn);
tgl.addEventListener('click', () => {
  localStorage.setItem(PREF_KEY, motionOn ? 'off' : 'on');
  location.reload();   // cleanest way to rebuild or drop every timeline
});

/* ── CLOCK ────────────────────────────────────────── */
const kb = document.querySelector('#openPal span');
if (kb && !/Mac|iPhone|iPad/.test(navigator.platform)) kb.textContent = 'Ctrl ';
/* failsafe: never leave content hidden if a reveal never fires */
setTimeout(() => document.querySelectorAll('.rv').forEach(el => {
  if (getComputedStyle(el).opacity === '0' && el.getBoundingClientRect().top < innerHeight) { el.style.opacity = 1; el.style.transform = 'none'; }
}), 2500);

/* ═══ COMMAND PALETTE ═════════════════════════════ */
const pal = document.getElementById('pal'), palIn = document.getElementById('palIn'),
      palList = document.getElementById('palList');
const sec = id => () => { closePal(); go(document.getElementById(id)); };
const CMDS = [
  ...PROJECTS.map(p => ({ t: p.short, k: p.ch === 1 ? 'Field' : 'Project', go: () => location.href = `project.html?p=${p.id}` })),
  { t: 'About', k: 'Section', go: sec('about') },
  { t: 'Toolkit', k: 'Section', go: sec('skills') },
  { t: 'Contact', k: 'Section', go: sec('contact') },
  { t: 'Download résumé', k: 'Action', go: () => { const a = document.createElement('a'); a.href = SITE.resume; a.download = ''; a.click(); closePal(); } },
  { t: 'Email Anmol', k: 'Action', go: () => location.href = `mailto:${SITE.email}` },
  { t: 'Copy email address', k: 'Action', go: () => { navigator.clipboard && navigator.clipboard.writeText(SITE.email); closePal(); } },
  { t: 'Open LinkedIn', k: 'Action', go: () => open(SITE.linkedin, '_blank') },
  { t: 'Open GitHub', k: 'Action', go: () => open(SITE.github, '_blank') },
  { t: 'Toggle animation', k: 'Action', go: () => tgl.click() }
];
let palI = 0, palHits = CMDS;
function drawPal() {
  palList.innerHTML = palHits.map((c, i) =>
    `<div class="pal-i ${i === palI ? 'on' : ''}" data-i="${i}"><span class="t">${c.t}</span><span class="kk">${c.k}</span></div>`).join('')
    || `<div class="pal-i"><span class="t" style="color:var(--fg-4)">No matches</span></div>`;
}
function openPal() { pal.hidden = false; palIn.value = ''; palHits = CMDS; palI = 0; drawPal(); palIn.focus(); lenis && lenis.stop(); }
function closePal() { pal.hidden = true; lenis && lenis.start(); }
document.getElementById('openPal').addEventListener('click', openPal);
pal.querySelector('.pal-bg').addEventListener('click', closePal);
palIn.addEventListener('input', () => {
  const q = palIn.value.toLowerCase();
  palHits = CMDS.filter(c => (c.t + ' ' + c.k).toLowerCase().includes(q)); palI = 0; drawPal();
});
palList.addEventListener('click', e => {
  const it = e.target.closest('.pal-i'); if (it && palHits[+it.dataset.i]) palHits[+it.dataset.i].go();
});
addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); return; }
  if (e.key === '/' && pal.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openPal(); return; }
  if (pal.hidden) return;
  if (e.key === 'Escape') closePal();
  else if (e.key === 'ArrowDown') { e.preventDefault(); palI = Math.min(palI + 1, palHits.length - 1); drawPal(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); palI = Math.max(palI - 1, 0); drawPal(); }
  else if (e.key === 'Enter' && palHits[palI]) palHits[palI].go();
});
})();
