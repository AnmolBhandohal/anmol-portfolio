/* ═══════════════════════════════════════════════════════════
   labs.js — one small working instrument per project.
   Each mounts into <div data-lab="NAME"> on a case-study page
   (and the field one also on the homepage). No dependencies.
   Every number used here comes from content.js / experience.json;
   the lamp and filter are labelled as SIMULATIONS of a design.
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const DPR = () => Math.min(devicePixelRatio || 1, 2);
function canvasFit(cv) {
  const r = cv.getBoundingClientRect(), d = DPR();
  cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
  const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
  return { x, W: r.width, H: r.height };
}

/* ── 1. HALF-SPLIT FAULT FINDER ───────────────────────────────
   A fire-alarm loop of 16 pluggable segments with a hidden
   ground fault. Visitor plays against binary search.          */
function faultLab(root) {
  const N = 16;
  let fault, lo, hi, checks, done, mode, measuredNow;
  root.innerHTML = `
    <div class="lab-head"><span class="lab-tag">LAB · FAULT FINDER</span>
      <span class="lab-sub">16-segment loop · one hidden ground fault</span></div>
    <div class="ff-loop" role="group" aria-label="Circuit segments"></div>
    <div class="ff-status" aria-live="polite"></div>
    <div class="lab-ctrl">
      <button class="lab-btn pri" data-a="split">Split &amp; measure</button>
      <button class="lab-btn" data-a="auto">Auto-solve</button>
      <button class="lab-btn" data-a="reset">New fault</button>
      <span class="ff-count"><b>0</b> checks · bisection needs ≤ 4</span>
    </div>
    <p class="lab-note">Each <em>Split &amp; measure</em> unplugs the terminal block in the middle of the
      suspect range and ohms out both halves. log<sub>2</sub>(16) = 4, so halving always finds it in four
      checks — probing every device in order can take sixteen. Or click a segment to probe it on its own.</p>`;
  const loop = $('.ff-loop', root), st = $('.ff-status', root), cnt = $('.ff-count b', root);
  for (let i = 0; i < N; i++) {
    const s = h('button', 'ff-seg', `<i></i><span>${String(i + 1).padStart(2, '0')}</span>`);
    s.dataset.i = i; s.setAttribute('aria-label', `Probe segment ${i + 1}`);
    loop.appendChild(s);
  }
  const segs = [...loop.children];
  function reset() {
    fault = Math.floor(Math.random() * N); lo = 0; hi = N - 1; checks = 0; done = false;
    segs.forEach(s => s.className = 'ff-seg');
    paint(); say('Loop reads a ground fault somewhere. Suspect range: all 16 segments.');
  }
  function say(t) { st.innerHTML = t; }
  function paint() {
    segs.forEach((s, i) => {
      s.classList.toggle('out', !done && (i < lo || i > hi));
      s.classList.toggle('in', !done && i >= lo && i <= hi);
    });
    cnt.textContent = checks;
  }
  function found(i, how) {
    done = true; segs[i].classList.add('hit'); paint();
    say(`<b>Fault isolated: segment ${String(i + 1).padStart(2, '0')}</b> — ${checks} check${checks === 1 ? '' : 's'} ${how}. Repair that run, plug the blocks back in, loop clears.`);
  }
  function split() {
    if (done) return;
    if (lo === hi) return found(lo, 'by halving');
    const mid = Math.floor((lo + hi) / 2);
    checks++;
    segs[mid].classList.add('cut');
    const left = fault <= mid;
    say(`Unplugged after segment ${String(mid + 1).padStart(2, '0')}. Left half ${left ? '<b class="bad">reads to ground</b>' : 'reads open ✓'}, right half ${left ? 'reads open ✓' : '<b class="bad">reads to ground</b>'}.`);
    if (left) hi = mid; else lo = mid + 1;
    paint();
    if (lo === hi) setTimeout(() => found(lo, 'by halving'), 500);
  }
  loop.addEventListener('click', e => {
    const b = e.target.closest('.ff-seg'); if (!b || done) return;
    const i = +b.dataset.i; checks++;
    if (i === fault) return found(i, 'probing one at a time');
    b.classList.add('ok'); paint(); say(`Segment ${String(i + 1).padStart(2, '0')} ohms out clean. Keep looking — or let bisection do it.`);
  });
  let timer = null;
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'split') split();
    if (a.dataset.a === 'reset') { clearInterval(timer); reset(); }
    if (a.dataset.a === 'auto') { clearInterval(timer); if (done) reset(); timer = setInterval(() => { if (done) return clearInterval(timer); split(); }, 750); }
  });
  reset();
}

/* ── 2. ELEVATOR RECALL — live relay logic ───────────────── */
function recallLab(root) {
  root.innerHTML = `
    <div class="lab-head"><span class="lab-tag">LAB · PHASE I RECALL</span>
      <span class="lab-sub">Pull a station. Watch the relay logic decide.</span></div>
    <div class="rc-grid">
      <div class="rc-bldg">
        ${[3, 2, 1].map(f => `<div class="rc-floor" data-f="${f}">
          <span class="rc-fl">L${f}${f === 1 ? ' · MAIN' : f === 2 ? ' · ALT' : ''}</span>
          <button class="rc-pull" data-f="${f}" aria-label="Pull station, level ${f}">PULL</button>
          <span class="rc-smoke" data-f="${f}"></span></div>`).join('')}
        <div class="rc-shaft"><div class="rc-car"><i></i><i></i></div></div>
      </div>
      <div class="rc-panel">
        <div class="rc-row"><span>Alarm</span><b id="rcA">NORMAL</b></div>
        <div class="rc-row"><span>Origin</span><b id="rcO">—</b></div>
        <div class="rc-row"><span>Relay</span><b id="rcR">—</b></div>
        <div class="rc-row"><span>Car</span><b id="rcC">L3 · in service</b></div>
        <pre class="rc-logic" id="rcL">if (alarm.any) { … }</pre>
        <button class="lab-btn" id="rcReset">Reset panel</button>
      </div>
    </div>
    <p class="lab-note">The same rule I configured on a Mircom FX-3500: any alarm recalls the car to the main
      floor and holds it with the doors open for firefighters — unless the alarm started <em>on</em> the main
      floor, then it goes to the alternate. You don't deliver people to the fire.</p>`;
  const car = $('.rc-car', root), floors = { 1: 2, 2: 1, 3: 0 };
  let carF = 3, anim = null;
  const set = (id, v, cls) => { const e = $('#' + id, root); e.textContent = v; e.className = cls || ''; };
  function moveTo(f, cb) {
    cancelAnimationFrame(anim);
    const from = parseFloat(car.style.getPropertyValue('--y') || floors[carF]);
    const to = floors[f], t0 = performance.now(), dur = 700 * Math.abs(to - from) + 1;
    root.classList.remove('doors');
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      car.style.setProperty('--y', from + (to - from) * e);
      if (k < 1) anim = requestAnimationFrame(step); else { carF = f; cb && cb(); }
    })(t0);
  }
  function alarm(f) {
    const target = f === 1 ? 2 : 1;
    root.querySelectorAll('.rc-smoke').forEach(s => s.classList.toggle('on', +s.dataset.f === f));
    root.querySelectorAll('.rc-pull').forEach(b => b.classList.toggle('on', +b.dataset.f === f));
    set('rcA', 'ALARM', 'bad'); set('rcO', `L${f} pull station`);
    set('rcR', target === 1 ? 'RECALL MAIN' : 'RECALL ALT', 'y');
    set('rcC', `recalling → L${target}`);
    $('#rcL', root).innerHTML = `alarm.at(MAIN) = <b>${f === 1}</b>\nfloor = ${f === 1 ? '<b>ALTERNATE</b> (L2)' : '<b>MAIN</b> (L1)'}\nrelay.recall(floor)\nrelay.hold(DOORS_OPEN)`;
    moveTo(target, () => { root.classList.add('doors'); set('rcC', `L${target} · doors open · held`, 'y'); });
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('.rc-pull'); if (b) alarm(+b.dataset.f);
    if (e.target.id === 'rcReset') {
      root.querySelectorAll('.on').forEach(x => x.classList.remove('on'));
      set('rcA', 'NORMAL'); set('rcO', '—'); set('rcR', '—'); set('rcC', 'returning to service');
      $('#rcL', root).textContent = 'if (alarm.any) { … }';
      moveTo(3, () => set('rcC', 'L3 · in service'));
    }
  });
  car.style.setProperty('--y', floors[3]);
}

/* ── 3. ACTIVE LOW-PASS — live Bode plot ─────────────────── */
function filterLab(root) {
  root.innerHTML = `
    <div class="lab-head"><span class="lab-tag">LAB · ACTIVE LOW-PASS</span>
      <span class="lab-sub">Keep 1 kHz, reject 15 kHz — pick the cutoff and the order</span></div>
    <div class="lab-screen bode"><canvas></canvas></div>
    <div class="lab-ctrl">
      <label class="lab-sl">f<sub>c</sub> <input type="range" id="fc" min="1.2" max="8" step="0.1" value="2.5"><b id="fcv">2.5 kHz</b></label>
      <div class="seg" role="radiogroup" aria-label="Filter order">
        ${[1, 2, 4].map(n => `<button role="radio" data-n="${n}" aria-checked="${n === 2}">${n === 1 ? '1st' : n === 2 ? '2nd' : '4th'}</button>`).join('')}
      </div>
    </div>
    <div class="lab-meas">
      <div><span>@ 1 kHz (signal)</span><b id="g1">—</b></div>
      <div><span>@ 15 kHz (noise)</span><b id="g15">—</b></div>
      <div><span>Separation</span><b id="gs">—</b></div>
    </div>
    <p class="lab-note">Ideal Butterworth response, the textbook model I sized the design from in LTspice.
      The two frequencies are only log<sub>10</sub>15 ≈ 1.2 decades apart, so a first-order filter
      (−20 dB/decade) barely separates them — that's why order matters more than cutoff here.</p>`;
  const cv = $('canvas', root);
  let fc = 2.5e3, n = 2, g;
  const mag = f => 1 / Math.sqrt(1 + Math.pow(f / fc, 2 * n));
  const dB = f => 20 * Math.log10(mag(f));
  function draw() {
    g = canvasFit(cv); const { x, W, H } = g;
    const pad = { l: 44, r: 12, t: 12, b: 26 }, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const fx = f => pad.l + (Math.log10(f) - 2) / 3 * pw;          // 100 Hz … 100 kHz
    const gy = d => pad.t + (-d / 60) * ph;                            // 0 … −60 dB
    x.clearRect(0, 0, W, H);
    x.font = '10px "JetBrains Mono", monospace'; x.fillStyle = '#434C59'; x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1;
    for (let dec = 2; dec <= 5; dec++) for (let m = 1; m < 10; m++) {
      const f = m * Math.pow(10, dec); if (f > 1e5) break;
      const X = Math.round(fx(f)) + .5; x.globalAlpha = m === 1 ? 1 : .45;
      x.beginPath(); x.moveTo(X, pad.t); x.lineTo(X, pad.t + ph); x.stroke();
      if (m === 1) { x.globalAlpha = 1; x.fillText(f >= 1000 ? f / 1000 + 'k' : f, X - 8, H - 8); }
    }
    x.globalAlpha = 1;
    for (let d = 0; d >= -60; d -= 20) {
      const Y = Math.round(gy(d)) + .5; x.beginPath(); x.moveTo(pad.l, Y); x.lineTo(pad.l + pw, Y); x.stroke();
      x.fillText(d + ' dB', 4, Y + 3);
    }
    // bands
    [[1e3, '#FFD23F', 'SIGNAL 1 kHz'], [15e3, '#FF5D5D', 'NOISE 15 kHz']].forEach(([f, c, t]) => {
      const X = fx(f); x.strokeStyle = c; x.globalAlpha = .55; x.setLineDash([3, 4]);
      x.beginPath(); x.moveTo(X, pad.t); x.lineTo(X, pad.t + ph); x.stroke(); x.setLineDash([]);
      x.globalAlpha = 1; x.fillStyle = c; x.fillText(t, X + 5, pad.t + 12);
      const Y = gy(Math.max(-60, dB(f))); x.beginPath(); x.arc(X, Y, 4, 0, 7); x.fill();
    });
    // response
    x.strokeStyle = '#00E5FF'; x.lineWidth = 2; x.shadowColor = '#00E5FF'; x.shadowBlur = 8; x.beginPath();
    for (let i = 0; i <= pw; i++) {
      const f = Math.pow(10, 2 + 3 * i / pw), Y = gy(Math.max(-60, dB(f)));
      i ? x.lineTo(pad.l + i, Y) : x.moveTo(pad.l + i, Y);
    }
    x.stroke(); x.shadowBlur = 0;
    const X3 = fx(fc); x.fillStyle = '#00E5FF'; x.fillText('−3 dB', X3 + 4, gy(-3) + 14);
    const a = dB(1e3), b = dB(15e3);
    $('#g1', root).textContent = a.toFixed(1) + ' dB';
    $('#g1', root).className = a > -1 ? 'ok' : 'bad';
    $('#g15', root).textContent = b.toFixed(1) + ' dB';
    $('#gs', root).textContent = (a - b).toFixed(1) + ' dB';
    $('#fcv', root).textContent = (fc / 1000).toFixed(1) + ' kHz';
  }
  $('#fc', root).addEventListener('input', e => { fc = e.target.value * 1000; draw(); });
  root.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => {
    n = +b.dataset.n; root.querySelectorAll('[data-n]').forEach(o => o.setAttribute('aria-checked', o === b)); draw();
  }));
  new ResizeObserver(draw).observe(cv);
}

/* ── 4. 720-POINT RING BUFFER ────────────────────────────── */
function ringLab(root) {
  const N = 720;
  root.innerHTML = `
    <div class="lab-head"><span class="lab-tag">LAB · RING BUFFER</span>
      <span class="lab-sub">720 slots · 30 s per sample · 6 h window</span></div>
    <div class="rb-wrap"><canvas class="rb" aria-hidden="true"></canvas>
      <div class="rb-mid"><b id="rbT">0 h 00 m</b><span>elapsed</span><b id="rbC">0 / 720</b><span>stored</span></div></div>
    <div class="lab-ctrl">
      <button class="lab-btn pri" data-a="run">Run</button>
      <div class="seg">${[1, 20, 120].map(s => `<button data-s="${s}" aria-checked="${s === 20}">${s}×</button>`).join('')}</div>
      <button class="lab-btn" data-a="room">/setroom</button>
      <span class="rb-room">room: <b id="rbR">bedroom</b></span>
    </div>
    <p class="lab-note">Synthetic temperature data, to show the <em>structure</em>, not a result. The write head
      goes round the ring; once all 720 slots are full it overwrites the oldest sample, so memory use is
      constant no matter how long it runs. <code>/setroom</code> tags and clears the buffer so each room's
      capture starts clean. The real multi-room trial hasn't been run yet.</p>`;
  const cv = $('.rb', root), rooms = ['bedroom', 'basement', 'kitchen', 'office'];
  let buf = new Float32Array(N), count = 0, head = 0, t = 0, speed = 20, running = false, room = 0, last = 0;
  const temp = k => 21 + 1.6 * Math.sin(k / 240 * Math.PI) + (room === 1 ? -3 : room === 2 ? 1.2 : 0) + (Math.random() - .5) * .35;
  function draw() {
    const { x, W, H } = canvasFit(cv), cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 8, r0 = R * .62;
    x.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + i / N * Math.PI * 2, age = (head - 1 - i + N) % N;
      const has = i < count || count === N;
      const v = has ? (buf[i] - 17) / 7 : 0;
      const r1 = r0 + 4 + Math.max(0, Math.min(1, v)) * (R - r0 - 4);
      x.strokeStyle = !has ? 'rgba(255,255,255,.06)' : `rgba(0,229,255,${Math.max(.18, 1 - age / N)})`;
      x.lineWidth = 1.1; x.beginPath();
      x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      x.lineTo(cx + Math.cos(a) * (has ? r1 : r0 + 4), cy + Math.sin(a) * (has ? r1 : r0 + 4)); x.stroke();
    }
    const a = -Math.PI / 2 + head / N * Math.PI * 2;
    x.strokeStyle = '#FFD23F'; x.lineWidth = 2; x.beginPath();
    x.moveTo(cx + Math.cos(a) * (r0 - 8), cy + Math.sin(a) * (r0 - 8)); x.lineTo(cx + Math.cos(a) * (R + 4), cy + Math.sin(a) * (R + 4)); x.stroke();
    const mins = Math.floor(t * 30 / 60);
    $('#rbT', root).textContent = `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} m`;
    $('#rbC', root).textContent = `${count} / ${N}`;
  }
  function tick(now) {
    if (!running) return;
    const dt = Math.min(100, now - (last || now)); last = now;
    const n = Math.max(1, Math.round(speed * dt / 60));
    for (let k = 0; k < n; k++) { buf[head] = temp(t); head = (head + 1) % N; if (count < N) count++; t++; }
    draw(); requestAnimationFrame(tick);
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'run') { running = !running; b.textContent = running ? 'Pause' : 'Run'; last = 0; if (running) requestAnimationFrame(tick); }
    if (b.dataset.a === 'room') { room = (room + 1) % rooms.length; $('#rbR', root).textContent = rooms[room]; buf = new Float32Array(N); count = 0; head = 0; t = 0; draw(); }
    if (b.dataset.s) { speed = +b.dataset.s; root.querySelectorAll('[data-s]').forEach(o => o.setAttribute('aria-checked', o === b)); }
  });
  new ResizeObserver(draw).observe(cv);
}

/* ── 5. CLOSED LOOP — the feedback trap ──────────────────── */
function loopLab(root) {
  root.innerHTML = `
    <div class="lab-head"><span class="lab-tag">LAB · THE FEEDBACK TRAP</span>
      <span class="lab-sub">Simulation of the lamp's control loop — design, not measurement</span></div>
    <div class="lab-screen loop"><canvas></canvas></div>
    <div class="lab-ctrl">
      <label class="lab-sl">Gain K<sub>p</sub> <input type="range" id="kp" min="0.1" max="1.6" step="0.05" value="0.4"><b id="kpv">0.50</b></label>
      <label class="lab-sl">Loop rate <input type="range" id="hz" min="5" max="200" step="5" value="15"><b id="hzv">15 Hz</b></label>
      <button class="lab-btn" id="step">Replay step</button>
    </div>
    <p class="lab-note">A toy model: the sensor sees ambient light plus the lamp's own output, through a slow
      sensor response. Because the lamp lights its own sensor, the gain is effectively loop gain — push it
      past about 1 and every correction overshoots, so the lamp pulses around the setpoint. The loop rate
      only sets how fast it settles. The real step-response test will replace this with measured data.</p>`;
  const cv = $('canvas', root);
  let kp = .4, hz = 15;
  /* Each sample: read sensor (first-order lag, τ = 90 ms), nudge the PWM
     by Kp × error, applied one sample later. The lamp adds to what the
     sensor sees, so Kp is effectively loop gain: past ~1 it overshoots
     every correction and hunts. */
  function sim() {
    const T = 6, dt = 1 / 2000, sp = 400, out = []; let lamp = 200, meas = 150, acc = 0, pend = lamp;
    const tau = .09, c = .9;
    for (let i = 0, t = 0; t < T; i++, t += dt) {
      const ambient = t < 1.5 ? 150 : 330, actual = ambient + c * lamp;
      meas += (actual - meas) * dt / tau; acc += dt;
      if (acc >= 1 / hz) { acc -= 1 / hz; lamp = pend; pend = Math.max(0, Math.min(500, lamp + kp * (sp - meas))); }
      if (i % 20 === 0) out.push([t, actual, ambient]);
    }
    return { out, sp };
  }
  function draw() {
    const { x, W, H } = canvasFit(cv), { out, sp } = sim();
    const pad = { l: 44, r: 10, t: 12, b: 22 }, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const X = t => pad.l + t / 6 * pw, Y = v => pad.t + (1 - v / 800) * ph;
    x.clearRect(0, 0, W, H); x.font = '10px "JetBrains Mono", monospace';
    x.strokeStyle = 'rgba(255,255,255,.07)'; x.fillStyle = '#434C59';
    for (let v = 0; v <= 800; v += 200) { x.beginPath(); x.moveTo(pad.l, Y(v) + .5); x.lineTo(W - pad.r, Y(v) + .5); x.stroke(); x.fillText(v, 8, Y(v) + 3); }
    for (let t = 0; t <= 6; t++) { x.fillText(t + ' s', X(t) - 6, H - 6); }
    x.setLineDash([4, 4]); x.strokeStyle = '#FFD23F'; x.beginPath(); x.moveTo(pad.l, Y(sp)); x.lineTo(W - pad.r, Y(sp)); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#FFD23F'; x.fillText('SETPOINT', W - pad.r - 64, Y(sp) - 6);
    x.strokeStyle = '#6B7686'; x.lineWidth = 1; x.beginPath(); out.forEach(([t, , a], i) => i ? x.lineTo(X(t), Y(a)) : x.moveTo(X(t), Y(a))); x.stroke();
    x.fillStyle = '#6B7686'; x.fillText('AMBIENT', X(1.6), Y(330) + 14);
    x.strokeStyle = '#00E5FF'; x.lineWidth = 2; x.shadowColor = '#00E5FF'; x.shadowBlur = 6; x.beginPath();
    out.forEach(([t, v], i) => i ? x.lineTo(X(t), Y(Math.min(800, v))) : x.moveTo(X(t), Y(v))); x.stroke(); x.shadowBlur = 0;
    const tail = out.slice(-80).map(o => o[1]), swing = Math.max(...tail) - Math.min(...tail);
    x.fillStyle = swing > 40 ? '#FF5D5D' : '#3ddc84';
    x.fillText(swing > 40 ? 'HUNTING — lamp chases its own light' : 'SETTLED', pad.l + 6, pad.t + 12);
    $('#kpv', root).textContent = kp.toFixed(2); $('#hzv', root).textContent = hz + ' Hz';
  }
  $('#kp', root).addEventListener('input', e => { kp = +e.target.value; draw(); });
  $('#hz', root).addEventListener('input', e => { hz = +e.target.value; draw(); });
  $('#step', root).addEventListener('click', draw);
  new ResizeObserver(draw).observe(cv);
}

const LABS = { fault: faultLab, recall: recallLab, filter: filterLab, ring: ringLab, loop: loopLab };
function mountAll() {
  document.querySelectorAll('[data-lab]').forEach(el => {
    if (el.dataset.mounted) return; el.dataset.mounted = 1;
    const f = LABS[el.dataset.lab]; if (f) { el.classList.add('lab'); f(el); }
  });
}
window.mountLabs = mountAll;
if (document.readyState !== 'loading') mountAll(); else addEventListener('DOMContentLoaded', mountAll);
})();
