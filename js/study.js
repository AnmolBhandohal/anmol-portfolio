/* study.js — renders a case-study page from ?p=<id>.
   IIFE: `p` and `id` collide with globals otherwise.
   Renders fully without GSAP; motion is an enhancement. */
(function () {
'use strict';

const id = new URLSearchParams(location.search).get('p');
const idx = PROJECTS.findIndex(x => x.id === id);
const p = PROJECTS[idx];
const root = document.getElementById('cs');
const HAS_GSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const motion = HAS_GSAP && localStorage.getItem('ab_motion') !== 'off'
            && !matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!motion) document.documentElement.classList.add('no-motion');

if (!p) {
  root.innerHTML = `<div class="cs-hero">
    <a class="cs-back" href="index.html">← All work</a>
    <h1>Not found</h1>
    <p style="color:var(--fg-2)">That link doesn't match a project. <a href="index.html" style="color:var(--c2)">Back to the portfolio →</a></p></div>`;
  return;
}

if (p.ch === 1) root.classList.add('ch1');
document.title = `${p.title} — Anmol Bhandohal`;
const md = document.querySelector('meta[name="description"]');
if (md) md.setAttribute('content', p.problem.replace(/<[^>]+>/g, '').slice(0, 155));

const prev = PROJECTS[idx - 1], next = PROJECTS[idx + 1];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* tiny highlighter — tokenises so replacements can't nest inside each other */
function hl(src) {
  return src.split('\n').map(line => {
    const c = line.indexOf('//');
    const code = c >= 0 ? line.slice(0, c) : line, com = c >= 0 ? line.slice(c) : '';
    const toks = code.split(/(\b[A-Za-z_]\w*\b|\b\d[\d.]*\b)/);
    const body = toks.map((t, i) => {
      if (/^(if|return|const|for|while|void|constexpr|size_t|uint16_t|else)$/.test(t)) return `<span class="kw">${t}</span>`;
      if (/^\d/.test(t)) return `<span class="nm">${t}</span>`;
      if (/^[A-Za-z_]\w*$/.test(t) && /^\s*\(/.test(toks[i + 1] || '')) return `<span class="fn">${esc(t)}</span>`;
      return esc(t);
    }).join('');
    return body + (com ? `<span class="cm">${esc(com)}</span>` : '');
  }).join('\n');
}

const kind = p.ch === 1 ? 'Field record' : 'Case study';
root.innerHTML = `
<div class="cs-hero">
  <a class="cs-back" href="index.html#s-${p.id}">← All work</a>
  <div class="s-meta" style="--acc:var(${p.ch === 1 ? '--c1' : '--c2'})">
    <span class="s-num">${kind} · ${p.n}</span>
    <span class="s-stat ${p.live ? 'live' : ''}">${p.status}</span>
  </div>
  <h1 class="cs-h1"><span class="ln"><span>${p.title}</span></span></h1>
  <div class="cs-meta">
    <div><span>When</span><b>${p.year}</b></div>
    <div><span>Role</span><b>${p.role}</b></div>
    ${p.metric ? `<div><span>${p.metric.label}</span><b class="acc">${p.metric.value} ${p.metric.unit}</b></div>` : ''}
    ${p.repo ? `<div><span>Source</span><b><a href="${p.repo}" class="acc">GitHub ↗</a></b></div>` : ''}
  </div>
  <div class="cs-sum">
    <div><h5>Problem</h5><p>${p.problem}</p></div>
    <div><h5>Approach</h5><p>${p.approach}</p></div>
    <div><h5>Result</h5><p>${p.result}</p></div>
  </div>
</div>

<div class="cs-body">
  ${p.gallery || p.explore ? '' : `<div class="cs-vis rv">${p.photo ? `<img src="${p.photo}" alt="${p.title}">` : p.viz}</div>`}

  ${p.study.map((s, i) => `
  <section class="cs-sec rv">
    <h2 data-n="${String(i + 1).padStart(2, '0')}">${s.h}</h2>
    <p>${s.p}</p>
    ${s.code ? `<div class="cs-code"><div class="bar">${p.id === 'field' ? 'LOGIC' : 'C++'}</div><pre>${hl(s.code)}</pre></div>` : ''}
    ${s.fig && window[s.fig] ? `<figure class="cs-fig ${s.fig === 'LAMP_PCB' ? 'is-pcb' : 'is-sch'}">${window[s.fig]}<figcaption>${s.figcap || ''}</figcaption></figure>` : ''}
    ${s.bom && window.LAMP_BOM ? `<div class="bom-wrap"><table class="bom"><thead><tr><th>Ref</th><th>Value</th><th>Part</th><th>Job</th></tr></thead><tbody>
      ${LAMP_BOM.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>` : ''}
    ${s.lab ? `<div class="cs-lab" data-lab="${s.lab}"></div>` : ''}
    ${s.explore && window[s.explore] ? `<div class="cs-exp">${explorerHTML(s.explore)}</div>` : ''}
    ${s.gallery && window[s.gallery] ? `<div class="cs-gal" data-g="${s.gallery}">${viewerHTML(window[s.gallery])}</div>` : ''}
  </section>`).join('')}

  <section class="cs-sec rv">
    <h2 data-n="${String(p.study.length + 1).padStart(2, '0')}">Tools</h2>
    <div class="cs-stack">${p.stack.map(t => `<span class="s-tag">${t}</span>`).join('')}</div>
  </section>

  <div class="cs-ask rv">
    <p>Want to talk about this in an interview?</p>
    <a class="btn pri" href="mailto:${SITE.email}?subject=${encodeURIComponent(p.short)}"><span>Email me</span></a>
  </div>
</div>

<div class="cs-nav">
  ${prev ? `<a href="project.html?p=${prev.id}">← Previous<span>${prev.short}</span></a>` : '<span></span>'}
  ${next ? `<a href="project.html?p=${next.id}" style="text-align:right">Next →<span>${next.short}</span></a>` : '<span></span>'}
</div>`;

window.mountLabs && window.mountLabs();
window.mountExplorers && window.mountExplorers();
window.mountBoards3D && window.mountBoards3D();
document.querySelectorAll('.cs-gal').forEach(el => bindViewer(el.querySelector('.vw'), window[el.dataset.g]));

/* reading progress */
const bar = document.getElementById('progBar');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });

/* keyboard: ← → between projects, Esc back */
addEventListener('keydown', e => {
  if (/input|textarea/i.test(document.activeElement.tagName)) return;
  if (e.key === 'ArrowLeft' && prev) location.href = `project.html?p=${prev.id}`;
  if (e.key === 'ArrowRight' && next) location.href = `project.html?p=${next.id}`;
  if (e.key === 'Escape') location.href = 'index.html#work';
});

if (!motion) return;
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.cs-vis .draw').forEach(el => {
  const L = el.getTotalLength ? Math.ceil(el.getTotalLength()) : 300;
  el.style.strokeDasharray = L; el.style.strokeDashoffset = L;
});
gsap.timeline()
  .from('.cs-h1 .ln>span', { yPercent: 105, duration: .9, ease: 'expo.out' })
  .from('.cs-hero .s-meta,.cs-meta,.cs-sum', { y: 18, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out' }, '-=.6');
if (document.querySelector('.cs-vis .draw')) gsap.to('.cs-vis .draw', { strokeDashoffset: 0, duration: 1.4, stagger: .04, ease: 'power2.inOut',
  scrollTrigger: { trigger: '.cs-vis', start: 'top 85%', once: true } });
gsap.utils.toArray('.cs-body .rv').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: .75,
  ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
})();
