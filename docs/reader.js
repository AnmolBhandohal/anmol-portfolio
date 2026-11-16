/* reader.js: in-page viewer. Deep links: #slides, #slides-13, #labs, #labs-3, #report-cold, #report-lamp, #workbook, #workbook-Music_Reactive */
(function () {
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const ORIGIN = location.origin + location.pathname.replace(/[^/]*$/, '');
  const office = f => 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(ORIGIN + 'files/' + f);
  const DOCS = {
    slides: { title: 'The presentation · 12 slides', n: 12, v: 4, watch: { label: 'Watch the 44 s version', href: '../watch/' },
      tools: [['▶ Watch the 44 s version', '../watch/'], ['Download .pptx', 'files/Projects_Deck.pptx', 1], ['PDF', 'files/Projects_Deck.pdf'], ['Open in PowerPoint Online', office('Projects_Deck.pptx'), 0, 1]],
      // transparent hot-spots over the play thumbnails that are drawn on the slides; click opens the clip in place
      hot: { 1: { x: 9.9, y: .62, w: 2.45, h: 4.35, src: '../media/lamp-music.mp4' },
             6: { x: .75, y: 2.1, w: 4.31, h: 4.0, src: '../media/lamp-music.mp4' } },
      videos: {} },
    labs: { title: 'Lab highlights · 4 course labs, 7 slides', n: 7, dir: 'labs', v: 2, videos: {},
      tools: [['Download .pptx', 'files/Lab_Highlights.pptx', 1], ['PDF', 'files/Lab_Highlights.pdf'], ['Data .xlsx', 'files/Lab_Highlights_Data.xlsx', 1], ['Open in PowerPoint Online', office('Lab_Highlights.pptx'), 0, 1]] },
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

  function slides(d, start, hk) {
    const dir = d.dir || 'slides';
    let i = Math.min(Math.max(start || 1, 1), d.n);
    body.innerHTML = `<div class="sl"><div class="sl-stage"><button class="sl-nav sl-prev" aria-label="Previous slide">‹</button>
      <div class="sl-frame"><img alt=""></div><button class="sl-nav sl-next" aria-label="Next slide">›</button></div>
      <div class="sl-foot"><span class="sl-count"></span><div class="sl-strip">${Array.from({ length: d.n }, (_, k) =>
        `<button data-i="${k + 1}" aria-label="Slide ${k + 1}"><img src="${dir}/s${pad(k + 1)}.webp?v=${d.v || 1}" alt="" loading="lazy"></button>`).join('')}</div></div></div>`;
    const frame = body.querySelector('.sl-frame'), im = frame.querySelector('img');
    for (let k = 1; k <= d.n; k++) { const p = new Image(); p.src = `${dir}/s${pad(k)}.webp?v=${d.v || 1}`; }
    const go = n => {
      i = Math.min(Math.max(n, 1), d.n);
      im.src = `${dir}/s${pad(i)}.webp?v=${d.v || 1}`; im.alt = `Slide ${i} of ${d.n}`;
      frame.querySelectorAll('video').forEach(v => v.remove());
      (d.videos[i] || []).forEach(o => {
        const v = document.createElement('video');
        Object.assign(v, { src: o.src, poster: o.poster, controls: true, playsInline: true, preload: 'metadata' });
        Object.assign(v.style, { left: o.x / 13.333 * 100 + '%', top: o.y / 7.5 * 100 + '%', width: o.w / 13.333 * 100 + '%', height: o.h / 7.5 * 100 + '%' });
        frame.appendChild(v);
      });
      body.querySelector('.sl-count').textContent = `${i} / ${d.n}`;
      spots.forEach(([k, b]) => b.style.display = k === i ? 'block' : 'none');
      body.querySelectorAll('.sl-strip button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      const on = body.querySelector('.sl-strip button.on'); on && on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      history.replaceState(null, '', i === 1 ? "#" + hk : "#" + hk + "-" + i);
    };
    body.querySelector('.sl-prev').onclick = () => go(i - 1);
    body.querySelector('.sl-next').onclick = () => go(i + 1);
    if (d.watch) {
      const w = document.createElement('a');
      w.className = 'sl-watch'; w.href = d.watch.href; w.target = '_blank'; w.rel = 'noopener';
      w.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>' + d.watch.label;
      body.querySelector('.sl-count').after(w);
    }
    // an invisible hit area over each play thumbnail drawn on the slide, so the picture itself plays
    const spots = [];
    for (const k in (d.hot || {})) {
      const o = d.hot[k], b = document.createElement('button');
      b.className = 'sl-hot'; b.setAttribute('aria-label', 'Play the lamp clip');
      Object.assign(b.style, { left: o.x / 13.333 * 100 + '%', top: o.y / 7.5 * 100 + '%', width: o.w / 13.333 * 100 + '%', height: o.h / 7.5 * 100 + '%' });
      b.onclick = e => { e.stopPropagation(); openFilm(o.src); };
      frame.appendChild(b); spots.push([+k, b]);
    }
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

  function openFilm(src) {
    const box = document.createElement('div');
    box.className = 'film';
    box.innerHTML = `<div class="film-in"><video src="${src}" controls autoplay playsinline></video>
      <button class="film-x" aria-label="Close">Close ✕</button></div>`;
    const close = () => { box.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    box.addEventListener('click', e => { if (e.target === box || e.target.closest('.film-x')) close(); });
    document.addEventListener('keydown', esc);
    document.body.appendChild(box);
    const v = box.querySelector('video'); const p = v.play(); p && p.catch && p.catch(() => {});
  }

  function route() {
    cleanup(); cleanup = () => {};
    const h = location.hash.slice(1);
    const [key, arg] = h.startsWith('slides') ? ['slides', +(h.split('-')[1] || 1)] : h.startsWith('labs') ? ['labs', +(h.split('-')[1] || 1)] : h.startsWith('workbook') ? ['workbook', h.split('workbook-')[1]] : [h];
    const d = DOCS[key];
    if (!d) { V.hidden = true; document.body.style.overflow = ''; return; }
    V.hidden = false; document.body.style.overflow = 'hidden';
    $('#v-title').textContent = d.title; tools(d);
    (key === 'slides' || key === 'labs') ? slides(d, arg, key) : key === 'workbook' ? workbook(d, arg) : report(d);
  }
  $('#v-close').onclick = () => { history.pushState(null, '', location.pathname); route(); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && !V.hidden) $('#v-close').click(); });
  addEventListener('hashchange', route);
  route();
})();
