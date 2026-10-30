/* reader.js: in-page viewer. Deep links: #slides, #slides-13, #report-cold, #report-lamp, #workbook, #workbook-Music_Reactive */
(function () {
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const ORIGIN = location.origin + location.pathname.replace(/[^/]*$/, '');
  const office = f => 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(ORIGIN + 'files/' + f);
  const DOCS = {
    slides: { title: 'The presentation · 17 slides', n: 17,
      tools: [['Download .pptx', 'files/Projects_Deck.pptx', 1], ['PDF', 'files/Projects_Deck.pdf'], ['Open in PowerPoint Online', office('Projects_Deck.pptx'), 0, 1]],
      // videos placed exactly where they sit on slide 15 (inches on a 13.333 × 7.5 slide)
      videos: { 15: [{ src: '../media/lamp-music.mp4', poster: '../media/lamp-music-poster.jpg', x: .9, y: 1.55, w: 2.95, h: 5.25 },
                     { src: '../media/lamp-styles-compare.mp4', poster: '../media/lamp-styles-poster.jpg', x: 4.4, y: 1.55, w: 8.4, h: 4.725 }] } },
    'report-cold': { title: 'Why is one room colder? · technical report', dir: 'report-cold', n: 11,
      tools: [['Download .docx', 'files/ColdRoom_Study_Report.docx', 1], ['PDF', 'files/ColdRoom_Study_Report.pdf'], ['Open in Word Online', office('ColdRoom_Study_Report.docx'), 0, 1]] },
    'report-lamp': { title: 'Adaptive LED lamp · test report', dir: 'report-lamp', n: 8,
      tools: [['Download .docx', 'files/LED_Lamp_Test_Report.docx', 1], ['PDF', 'files/LED_Lamp_Test_Report.pdf'], ['Open in Word Online', office('LED_Lamp_Test_Report.docx'), 0, 1]] },
    workbook: { title: 'Excel workbooks',
      tools: [['Download cold-room .xlsx', 'files/EnvMonitor_Analysis.xlsx', 1], ['Download lamp .xlsx', 'files/LED_Lamp_Characterization.xlsx', 1], ['Open in Excel Online', office('EnvMonitor_Analysis.xlsx'), 0, 1]],
      sheets: [
        ['Dashboard', 'Cold room', 'Native Excel charts, all driven by formulas. Room B is plotted as an empty series that fills in when its data is pasted.'],
        ['Summary', 'Cold room', 'Room A against Room B. The time constant τ is a through-origin fit (SUMPRODUCT / SUMSQ) on furnace-off minutes; Room B cells read PENDING until data arrives.'],
        ['RoomA_Night1', 'Cold room', '960 one-minute rows of real data. Dew point (Magnus formula), centred dT/dt and the heating/cooling phase are formulas, not pasted values.'],
        ['Calibration_Pending', 'Cold room', 'Side-by-side sensor calibration with PASS/FAIL conditional formatting against ±0.2 °C and ±2 % RH.'],
        ['B3_Linearity', 'LED lamp', 'AVERAGEIFS over settled samples, then SLOPE / INTERCEPT / RSQ: R² = 0.99991, worst residual 0.51 % of full scale.'],
        ['T4_ClosedLoop', 'LED lamp', 'Step-response metrics with MAXIFS / MINIFS: 0.21 lx overshoot at 11 lx, 0.17 lx at 3 lx.'],
        ['Music_Reactive', 'LED lamp', 'Six lighting styles scored against an independent beat tracker on two songs; the chosen one is highlighted.'],
      ] },
  };
  const V = $('#viewer'), body = $('#v-body');
  let cleanup = () => {};

  function tools(d) {
    $('#v-tools').innerHTML = d.tools.map(([t, h, dl, opt]) =>
      `<a href="${h}" ${dl ? 'download' : 'target="_blank" rel="noopener"'} class="${opt ? 'opt' : ''}">${t}</a>`).join('');
  }

  function slides(d, start) {
    let i = Math.min(Math.max(start || 1, 1), d.n);
    body.innerHTML = `<div class="sl"><div class="sl-stage"><button class="sl-nav sl-prev" aria-label="Previous slide">‹</button>
      <div class="sl-frame"><img alt=""></div><button class="sl-nav sl-next" aria-label="Next slide">›</button></div>
      <div class="sl-foot"><span class="sl-count"></span><div class="sl-strip">${Array.from({ length: d.n }, (_, k) =>
        `<button data-i="${k + 1}" aria-label="Slide ${k + 1}"><img src="slides/s${pad(k + 1)}.webp" alt="" loading="lazy"></button>`).join('')}</div></div></div>`;
    const frame = body.querySelector('.sl-frame'), im = frame.querySelector('img');
    for (let k = 1; k <= d.n; k++) { const p = new Image(); p.src = `slides/s${pad(k)}.webp`; }
    const go = n => {
      i = Math.min(Math.max(n, 1), d.n);
      im.src = `slides/s${pad(i)}.webp`; im.alt = `Slide ${i} of ${d.n}`;
      frame.querySelectorAll('video').forEach(v => v.remove());
      (d.videos[i] || []).forEach(o => {
        const v = document.createElement('video');
        Object.assign(v, { src: o.src, poster: o.poster, controls: true, playsInline: true, preload: 'metadata' });
        Object.assign(v.style, { left: o.x / 13.333 * 100 + '%', top: o.y / 7.5 * 100 + '%', width: o.w / 13.333 * 100 + '%', height: o.h / 7.5 * 100 + '%' });
        frame.appendChild(v);
      });
      body.querySelector('.sl-count').textContent = `${i} / ${d.n}`;
      body.querySelectorAll('.sl-strip button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      const on = body.querySelector('.sl-strip button.on'); on && on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      history.replaceState(null, '', i === 1 ? '#slides' : '#slides-' + i);
    };
    body.querySelector('.sl-prev').onclick = () => go(i - 1);
    body.querySelector('.sl-next').onclick = () => go(i + 1);
    body.querySelector('.sl-strip').onclick = e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); };
    im.onclick = e => { const r = im.getBoundingClientRect(); go(e.clientX - r.left < r.width / 3 ? i - 1 : i + 1); };
    const key = e => { if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(i + 1); } if (['ArrowLeft', 'PageUp'].includes(e.key)) go(i - 1); };
    let x0 = null;
    const ts = e => x0 = e.touches[0].clientX, te = e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1); x0 = null; };
    addEventListener('keydown', key); frame.addEventListener('touchstart', ts, { passive: true }); frame.addEventListener('touchend', te);
    cleanup = () => removeEventListener('keydown', key);
    go(i);
  }

  function report(d) {
    body.innerHTML = `<div class="rp">${Array.from({ length: d.n }, (_, k) =>
      `<img src="${d.dir}/p${pad(k + 1)}.webp" alt="Page ${k + 1}" width="1275" height="1650" loading="${k < 2 ? 'eager' : 'lazy'}" data-p="${k + 1}">`).join('')}</div><div class="rp-pg">1 / ${d.n}</div>`;
    const pg = body.querySelector('.rp-pg');
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) pg.textContent = `${en.target.dataset.p} / ${d.n}`; }), { root: body.querySelector('.rp'), rootMargin: '-45% 0px -50% 0px' });
    body.querySelectorAll('.rp img').forEach(im => io.observe(im));
    cleanup = () => io.disconnect();
  }

  function workbook(d, start) {
    let last = '';
    const tabs = d.sheets.map(([s, wbk]) => { const g = wbk !== last ? `<span class="grp">${wbk}</span>` : ''; last = wbk; return g + `<button data-s="${s}">${s.replace(/_/g, ' ')}</button>`; }).join('');
    body.innerHTML = `<div class="wb"><div class="wb-tabs">${tabs}</div><div class="wb-view"></div></div>`;
    const view = body.querySelector('.wb-view');
    const show = s => {
      const row = d.sheets.find(r => r[0] === s) || d.sheets[0];
      view.innerHTML = `<p>${row[2]}</p><img src="sheets/${row[0]}.webp" alt="${row[0]} sheet">`;
      body.querySelectorAll('.wb-tabs button').forEach(b => b.classList.toggle('on', b.dataset.s === row[0]));
      history.replaceState(null, '', '#workbook-' + row[0]);
    };
    body.querySelector('.wb-tabs').onclick = e => { const b = e.target.closest('button'); if (b) show(b.dataset.s); };
    show(start);
  }

  function route() {
    cleanup(); cleanup = () => {};
    const h = location.hash.slice(1);
    const [key, arg] = h.startsWith('slides') ? ['slides', +(h.split('-')[1] || 1)] : h.startsWith('workbook') ? ['workbook', h.split('workbook-')[1]] : [h];
    const d = DOCS[key];
    if (!d) { V.hidden = true; document.body.style.overflow = ''; return; }
    V.hidden = false; document.body.style.overflow = 'hidden';
    $('#v-title').textContent = d.title; tools(d);
    key === 'slides' ? slides(d, arg) : key === 'workbook' ? workbook(d, arg) : report(d);
  }
  $('#v-close').onclick = () => { history.pushState(null, '', location.pathname); route(); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && !V.hidden) $('#v-close').click(); });
  addEventListener('hashchange', route);
  route();
})();
