/* ═══════════════════════════════════════════════════════════
   main.js — landing page render + motion + command palette
   Lenis drives its RAF through GSAP's ticker: ONE loop only.
   ═══════════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

const PREF_KEY = 'ab_motion';
let motionOn = localStorage.getItem(PREF_KEY) !== 'off'
            && !matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── site strings ─────────────────────────────────── */
document.getElementById('availTag').textContent = `${SITE.role} · ${SITE.location}`;
document.getElementById('availStat').textContent = SITE.available;
document.getElementById('pc').textContent = String(PROJECTS.length).padStart(2, '0');
document.getElementById('yr').textContent = new Date().getFullYear();
document.getElementById('upd').textContent =
  'REV ' + new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' });

/* ── AT A GLANCE (the 7-second layer) ─────────────── */
const arrow = `<svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M0 4h12M9 1l3 3-3 3"/></svg>`;
document.getElementById('gcards').innerHTML = PROJECTS.map(p => `
  <a class="gcard rv" href="project.html?p=${p.id}">
    <div class="gc-top">
      <span class="gc-n">${p.n} · ${p.year}</span>
      ${p.metric ? `<span class="gc-metric"><b>${p.metric.value}</b><i>${p.metric.unit || p.metric.label}</i></span>` : ''}
    </div>
    <h4>${p.short}</h4>
    <div class="gc-row"><em>Problem</em>${p.problem}</div>
    <div class="gc-row"><em>Result</em>${p.result}</div>
    <span class="gc-go">Read case study ${arrow}</span>
  </a>`).join('');

/* ── SKILLS ───────────────────────────────────────── */
document.getElementById('caps').innerHTML = SKILLS.map(s => `
  <div class="cap rv"><h4>${s.g}</h4><ul>
    ${s.items.map(([n, t]) => `<li>${n}<b>${t || '—'}</b></li>`).join('')}
  </ul></div>`).join('');

/* ── CONTACT BUTTONS ──────────────────────────────── */
document.getElementById('ctaBtns').innerHTML = `
  <a class="btn pri" href="mailto:${SITE.email}"><span>Email me</span></a>
  <a class="btn" href="${SITE.github}" target="_blank" rel="noopener"><span>GitHub</span></a>
  <a class="btn" href="${SITE.linkedin}" target="_blank" rel="noopener"><span>LinkedIn</span></a>
  ${SITE.resume ? `<a class="btn" href="${SITE.resume}" download><span>Résumé</span></a>` : ''}`;

/* ── PROJECT SCENES ───────────────────────────────── */
document.getElementById('work').innerHTML = PROJECTS.map(p => `
<section class="scene" data-scene data-id="${p.id}">
  <div class="s-txt">
    <div class="s-meta">
      <span class="s-num">${p.n}</span>
      <span class="s-stat ${p.live ? 'live' : ''}">${p.status}</span>
    </div>
    <h2>${p.title.split(' ').map(w => `<span class="w"><i>${w}</i></span>`).join(' ')}</h2>
    <p class="s-body rv">${p.body}</p>
    <dl class="specs rv">
      ${p.specs.map(([k, v]) => `<div class="spec"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
    </dl>
    <div class="s-tags rv">${p.tags.map(t => `<span class="s-tag">${t}</span>`).join('')}</div>
    <a class="s-cta rv" href="project.html?p=${p.id}"><span>Read the case study ${arrow}</span></a>
  </div>
  <div class="s-vis" data-label="${p.label}">
    <span class="corner c1"></span><span class="corner c2"></span>
    <span class="corner c3"></span><span class="corner c4"></span>
    ${p.photo ? `<img src="${p.photo}" alt="${p.title}" loading="lazy">` : p.viz}
  </div>
</section>`).join('');

/* rail */
const rail = document.getElementById('rail');
rail.innerHTML = PROJECTS.map((p, i) => `<button data-i="${i}" title="${p.short}"><span>${p.n}</span><i></i></button>`).join('');
const railBtns = [...rail.querySelectorAll('button')];

/* ── SMOOTH SCROLL — single ticker ────────────────── */
let lenis = null;
function initLenis() {
  if (!motionOn || lenis) return;
  lenis = new Lenis({ autoRaf: false, duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(lenisRaf);
  gsap.ticker.lagSmoothing(0);
}
function lenisRaf(t) { lenis && lenis.raf(t * 1000); }
function killLenis() {
  if (!lenis) return;
  gsap.ticker.remove(lenisRaf); lenis.destroy(); lenis = null;
}
initLenis();

/* ── CURSOR ───────────────────────────────────────── */
const cur = document.querySelector('.cur'), ring = document.querySelector('.cur-r');
if (!matchMedia('(pointer:coarse)').matches) {
  const qx = gsap.quickTo(cur, 'x', { duration: .18, ease: 'power3' });
  const qy = gsap.quickTo(cur, 'y', { duration: .18, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: .42, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: .42, ease: 'power3' });
  addEventListener('mousemove', e => { qx(e.clientX); qy(e.clientY); rx(e.clientX); ry(e.clientY); });
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button')) ring.classList.add('hot');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button')) ring.classList.remove('hot');
  });
}

/* ── LOADER → HERO ────────────────────────────────── */
gsap.timeline()
  .to('#load .bar i', { width: '100%', duration: .85, ease: 'power2.inOut' })
  .to('#load', {
    opacity: 0, duration: .45, ease: 'power2.out',
    onComplete() {
      document.getElementById('load').style.display = 'none';
      document.body.classList.remove('lock');
      ScrollTrigger.refresh();
    }
  })
  .from('h1 .ln>span', { yPercent: 115, duration: 1.05, stagger: .085, ease: 'expo.out' }, '-=.2')
  .from('.tagrow,.lede,.stats .stat,.scroll-c',
        { y: 22, opacity: 0, duration: .75, stagger: .06, ease: 'power3.out' }, '-=.7')
  .from('nav', { y: -18, opacity: 0, duration: .65, ease: 'power3.out' }, '-=.85');

/* ── SCENE ANIMATION ──────────────────────────────── */
document.querySelectorAll('[data-scene]').forEach((sc, i) => {
  const words = sc.querySelectorAll('h2 .w>i');
  const reveals = sc.querySelectorAll('.rv');
  const vis = sc.querySelector('.s-vis');
  const paths = sc.querySelectorAll('.draw');

  paths.forEach(p => {
    const L = p.getTotalLength ? p.getTotalLength() : 300;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
  });

  gsap.timeline({ scrollTrigger: { trigger: sc, start: 'top 68%', once: true } })
    .from(words, { yPercent: 110, duration: .85, stagger: .04, ease: 'expo.out' })
    .from(vis, { opacity: 0, scale: .95, duration: .95, ease: 'power3.out' }, '-=.65')
    .to(paths, { strokeDashoffset: 0, duration: 1.4, stagger: .045, ease: 'power2.inOut' }, '-=.55')
    .to(reveals, { opacity: 1, y: 0, duration: .75, stagger: .07, ease: 'power3.out' }, '-=1.15');

  if (motionOn) {
    gsap.to(vis, { yPercent: -9, ease: 'none',
      scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
    gsap.to(sc.querySelector('.s-num'), { yPercent: -35, ease: 'none',
      scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: 1.3 } });
  }

  ScrollTrigger.create({
    trigger: sc, start: 'top 55%', end: 'bottom 55%',
    onToggle: s => railBtns.forEach((b, j) => b.classList.toggle('on', j === i && s.isActive))
  });
});

/* generic reveals */
gsap.utils.toArray('.rv').forEach(el => {
  if (el.closest('[data-scene]')) return;
  gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
});
gsap.utils.toArray('.sh').forEach(el => {
  gsap.from(el, { opacity: 0, y: 18, duration: .75, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
});
gsap.from('.cta h3,.cta p,.btns', { opacity: 0, y: 28, duration: .85, stagger: .09,
  ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 78%', once: true } });

/* ── NAV / RAIL ───────────────────────────────────── */
const go = t => lenis ? lenis.scrollTo(t, { offset: -40 }) : t.scrollIntoView({ behavior: 'smooth' });
railBtns.forEach(b => b.addEventListener('click',
  () => go(document.querySelectorAll('[data-scene]')[+b.dataset.i])));
document.querySelectorAll('nav a[href^="#"]').forEach(a =>
  a.addEventListener('click', e => { e.preventDefault(); go(document.querySelector(a.getAttribute('href'))); }));

/* ── MOTION TOGGLE ────────────────────────────────── */
const tgl = document.getElementById('motionTgl');
function paintTgl() { tgl.classList.toggle('off', !motionOn); }
paintTgl();
tgl.addEventListener('click', () => {
  motionOn = !motionOn;
  localStorage.setItem(PREF_KEY, motionOn ? 'on' : 'off');
  paintTgl();
  motionOn ? initLenis() : killLenis();
  document.documentElement.classList.toggle('no-motion', !motionOn);
});

/* ── CLOCK ────────────────────────────────────────── */
const clk = document.getElementById('clk');
const tick = () => clk.textContent = new Date().toLocaleTimeString('en-CA',
  { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Edmonton' }) + ' MT';
tick(); setInterval(tick, 10000);

/* ═══ COMMAND PALETTE ═════════════════════════════ */
const pal = document.getElementById('pal'), palIn = document.getElementById('palIn'),
      palList = document.getElementById('palList');

const CMDS = [
  ...PROJECTS.map(p => ({ t: p.short, k: 'Project', go: () => location.href = `project.html?p=${p.id}` })),
  { t: 'About', k: 'Section', go: () => { closePal(); go(document.getElementById('about')); } },
  { t: 'Toolkit / Skills', k: 'Section', go: () => { closePal(); go(document.getElementById('skills')); } },
  { t: 'Contact', k: 'Section', go: () => { closePal(); go(document.getElementById('contact')); } },
  { t: 'Email Anmol', k: 'Action', go: () => location.href = `mailto:${SITE.email}` },
  { t: 'Open GitHub', k: 'Action', go: () => open(SITE.github, '_blank') },
  { t: 'Open LinkedIn', k: 'Action', go: () => open(SITE.linkedin, '_blank') },
  { t: 'Copy email address', k: 'Action', go: () => { navigator.clipboard.writeText(SITE.email); closePal(); } },
  { t: 'Toggle animation', k: 'Action', go: () => { tgl.click(); closePal(); } }
];

let palI = 0, palHits = CMDS;
function drawPal() {
  palList.innerHTML = palHits.map((c, i) =>
    `<div class="pal-i ${i === palI ? 'on' : ''}" data-i="${i}">
       <span class="t">${c.t}</span><span class="kk">${c.k}</span></div>`).join('')
    || `<div class="pal-i"><span class="t" style="color:var(--fg-4)">No matches</span></div>`;
}
function openPal() {
  pal.hidden = false; palIn.value = ''; palHits = CMDS; palI = 0; drawPal();
  palIn.focus(); lenis && lenis.stop();
}
function closePal() { pal.hidden = true; lenis && lenis.start(); }

document.getElementById('openPal').addEventListener('click', openPal);
pal.querySelector('.pal-bg').addEventListener('click', closePal);
palIn.addEventListener('input', () => {
  const q = palIn.value.toLowerCase();
  palHits = CMDS.filter(c => (c.t + c.k).toLowerCase().includes(q));
  palI = 0; drawPal();
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
