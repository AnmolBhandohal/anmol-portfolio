/* wrapped in IIFE: `p` and `id` collide with globals otherwise */
(function(){
'use strict';
/* ═══════════════════════════════════════════════════════════
   study.js — renders a case-study page from ?p=<id>
   ═══════════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

const id = new URLSearchParams(location.search).get('p');
const idx = PROJECTS.findIndex(x => x.id === id);
const p = PROJECTS[idx];
const root = document.getElementById('cs');

if (!p) {
  root.innerHTML = `<div class="cs-hero">
    <a class="cs-back" href="index.html">← Back to all work</a>
    <h1>Project not found</h1>
    <p style="color:var(--fg-2)">That link doesn't match a project.
    <a href="index.html" style="color:var(--cy)">Head back to the portfolio →</a></p></div>`;
} else {
  document.title = `${p.title} — Anmol Bhandohal`;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', p.problem.replace(/<[^>]+>/g, '').slice(0, 155));

  const prev = PROJECTS[idx - 1], next = PROJECTS[idx + 1];

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const hl = s => esc(s)
    .replace(/(\/\/[^\n]*)/g, '<span style="color:var(--fg-4)">$1</span>')
    .replace(/\b(if|return|const|uint16_t|for|while|min|max)\b/g, '<span style="color:var(--vi)">$1</span>')
    .replace(/\b(ledcSetup|ledcAttachPin|ledcWrite|pow|millis|WiFi|reconnect|status)\b/g,
             '<span style="color:var(--cy)">$1</span>');

  root.innerHTML = `
  <div class="cs-hero">
    <a class="cs-back" href="index.html#work">← Back to all work</a>
    <div class="s-meta" style="margin-bottom:18px">
      <span class="s-stat ${p.live ? 'live' : ''}">${p.status}</span>
    </div>
    <h1 class="rv">${p.title}</h1>
    <div class="cs-meta rv">
      <div><span>Year</span><b>${p.year}</b></div>
      <div><span>Role</span><b>${p.role}</b></div>
      ${p.metric ? `<div><span>${p.metric.label}</span><b style="color:var(--cy)">${p.metric.value} ${p.metric.unit}</b></div>` : ''}
      ${p.repo ? `<div><span>Source</span><b><a href="${p.repo}" style="color:var(--cy)">GitHub ↗</a></b></div>` : ''}
    </div>

    <div class="cs-sum rv">
      <div><h5>Problem</h5><p>${p.problem}</p></div>
      <div><h5>Approach</h5><p>${p.approach}</p></div>
      <div><h5>Result</h5><p>${p.result}</p></div>
    </div>
  </div>

  <div class="cs-body">
    <div class="cs-vis rv">${p.photo ? `<img src="${p.photo}" alt="${p.title}">` : p.viz}</div>

    ${p.study.map((s, i) => `
      <section class="cs-sec rv">
        <h2 data-n="${String(i + 1).padStart(2, '0')}">${s.h}</h2>
        <p>${s.p}</p>
        ${s.code ? `<div class="cs-code">
          <div class="bar"><i></i><i></i><i></i></div>
          <pre>${hl(s.code)}</pre></div>` : ''}
      </section>`).join('')}

    <section class="cs-sec rv">
      <h2 data-n="${String(p.study.length + 1).padStart(2, '0')}">Stack</h2>
      <div class="s-tags">${p.stack.map(t => `<span class="s-tag">${t}</span>`).join('')}</div>
    </section>

    <div style="border:1px solid var(--line);border-radius:4px;padding:28px;
                background:var(--surf);text-align:center;margin-top:20px">
      <p style="color:var(--fg-2);margin-bottom:18px">Want to talk about this project?</p>
      <a class="btn pri" href="mailto:${SITE.email}"><span>Email me</span></a>
    </div>
  </div>

  <div class="cs-nav">
    ${prev ? `<a href="project.html?p=${prev.id}">← Previous<span>${prev.short}</span></a>` : '<span></span>'}
    ${next ? `<a href="project.html?p=${next.id}" style="text-align:right">Next →<span>${next.short}</span></a>` : '<span></span>'}
  </div>`;

  /* draw-on SVG */
  document.querySelectorAll('.draw').forEach(el => {
    const L = el.getTotalLength ? el.getTotalLength() : 300;
    el.style.strokeDasharray = L; el.style.strokeDashoffset = L;
  });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
               || localStorage.getItem('ab_motion') === 'off';

  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ autoRaf: false, duration: 1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsap.timeline()
    .from('.cs-hero h1', { y: 30, opacity: 0, duration: .9, ease: 'expo.out' })
    .from('.cs-meta,.cs-sum', { y: 22, opacity: 0, duration: .75, stagger: .1, ease: 'power3.out' }, '-=.55')
    .to('.cs-hero .rv', { opacity: 1, y: 0, duration: .01 }, 0);

  gsap.to('.cs-vis .draw', {
    strokeDashoffset: 0, duration: 1.6, stagger: .05, ease: 'power2.inOut',
    scrollTrigger: { trigger: '.cs-vis', start: 'top 80%', once: true }
  });

  gsap.utils.toArray('.cs-body .rv').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  /* reading progress */
  const bar = document.getElementById('progBar');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });

  /* arrow-key project nav */
  addEventListener('keydown', e => {
    if (/input|textarea/i.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft' && prev) location.href = `project.html?p=${prev.id}`;
    if (e.key === 'ArrowRight' && next) location.href = `project.html?p=${next.id}`;
    if (e.key === 'Escape') location.href = 'index.html#work';
  });
}

/* cursor */
const cur = document.querySelector('.cur'), ring = document.querySelector('.cur-r');
if (!matchMedia('(pointer:coarse)').matches) {
  const qx = gsap.quickTo(cur, 'x', { duration: .18, ease: 'power3' });
  const qy = gsap.quickTo(cur, 'y', { duration: .18, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: .42, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: .42, ease: 'power3' });
  addEventListener('mousemove', e => { qx(e.clientX); qy(e.clientY); rx(e.clientX); ry(e.clientY); });
  document.addEventListener('mouseover', e => { if (e.target.closest('a,button')) ring.classList.add('hot'); });
  document.addEventListener('mouseout', e => { if (e.target.closest('a,button')) ring.classList.remove('hot'); });
}

/* clock */
const clk = document.getElementById('clk');
const tick = () => clk.textContent = new Date().toLocaleTimeString('en-CA',
  { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Edmonton' }) + ' MT';
tick(); setInterval(tick, 10000);

})();
