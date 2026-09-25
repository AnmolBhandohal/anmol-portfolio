/* ═══════════════════════════════════════════════════════════
   instrument.js — FIG. 0: a working two-channel scope.
   Simulates the LED lamp's gate drive at its 5 kHz design
   target. Triggered display: the trace is STILL unless the
   duty cycle changes — like a real scope, not a screensaver.
     CH1 (yellow) V_GS  0 → 3.3 V   2 V/div
     CH2 (cyan)   V_DS  12 → 0 V    5 V/div  (low-side switch:
                  drain is LOW while the MOSFET conducts)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const cv = document.getElementById('scopeCv');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const slider = document.getElementById('duty');
  const $ = id => document.getElementById(id);
  const mD = $('mD'), mW = $('mW'), mV = $('mV'), mP = $('mP'), glow = $('lampGlow');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
               || localStorage.getItem('ab_motion') === 'off';

  const DIVX = 10, DIVY = 8;
  const TDIV = 50e-6;           // 50 µs/div → 500 µs on screen = 2.5 periods
  const T = 1 / 5000;           // 200 µs
  const CH1 = { g: 1.0, hi: 3.3 / 2, col: '#FFD23F', inv: false }; // divisions
  const CH2 = { g: -3.3, hi: 12 / 5, col: '#00E5FF', inv: true };

  let W = 0, H = 0, duty = 0.5, target = 0.5, touched = false, raf = 0, shown = -1;

  function size() {
    const r = cv.getBoundingClientRect();
    const d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    shown = -1; draw();
  }

  function grid(dx, dy) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.075)';
    ctx.beginPath();
    for (let i = 1; i < DIVX; i++) { const x = Math.round(i * dx) + .5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let j = 1; j < DIVY; j++) { const y = Math.round(j * dy) + .5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    // centre axes with minor ticks, 5 per division
    ctx.strokeStyle = 'rgba(255,255,255,.2)';
    ctx.beginPath();
    const cx = Math.round(W / 2) + .5, cy = Math.round(H / 2) + .5;
    for (let i = 0; i <= DIVX * 5; i++) { const x = Math.round(i * dx / 5) + .5; ctx.moveTo(x, cy - 3); ctx.lineTo(x, cy + 3); }
    for (let j = 0; j <= DIVY * 5; j++) { const y = Math.round(j * dy / 5) + .5; ctx.moveTo(cx - 3, y); ctx.lineTo(cx + 3, y); }
    ctx.stroke();
  }

  function trace(ch, dx, dy, trigX) {
    const pps = dx / TDIV;                       // pixels per second
    const yLo = H / 2 - ch.g * dy, yHi = H / 2 - (ch.g + ch.hi) * dy;
    const level = on => (on !== ch.inv) ? yHi : yLo;
    const t0 = -trigX / pps, t1 = (W - trigX) / pps;
    const edges = [];
    for (let k = Math.floor(t0 / T) - 1; k * T <= t1 + T; k++) {
      edges.push([k * T, true], [k * T + duty * T, false]);
    }
    const ph = ((t0 % T) + T) % T;
    let on = ph < duty * T;
    ctx.beginPath();
    ctx.moveTo(0, level(on));
    for (const [t, rising] of edges) {
      if (t <= t0 || t >= t1) continue;
      const x = trigX + t * pps;
      ctx.lineTo(x, level(on)); on = rising; ctx.lineTo(x, level(on));
    }
    ctx.lineTo(W, level(on));
    ctx.strokeStyle = ch.col; ctx.lineWidth = 1.7;
    ctx.shadowColor = ch.col; ctx.shadowBlur = 7;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // ground marker
    ctx.fillStyle = ch.col;
    ctx.beginPath(); ctx.moveTo(0, yLo - 6); ctx.lineTo(9, yLo); ctx.lineTo(0, yLo + 6); ctx.fill();
  }

  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const dx = W / DIVX, dy = H / DIVY, trigX = dx;
    grid(dx, dy);
    trace(CH1, dx, dy, trigX);
    trace(CH2, dx, dy, trigX);

    // trigger position + level markers
    ctx.fillStyle = '#FFD23F';
    ctx.beginPath(); ctx.moveTo(trigX - 6, 0); ctx.lineTo(trigX + 6, 0); ctx.lineTo(trigX, 8); ctx.fill();
    const yT = H / 2 - (CH1.g + CH1.hi / 2) * dy;
    ctx.beginPath(); ctx.moveTo(W, yT - 6); ctx.lineTo(W - 9, yT); ctx.lineTo(W, yT + 6); ctx.fill();

    // +width cursors on the first pulse
    const xf = trigX + duty * T * dx / TDIV;
    const yTop = H / 2 - (CH1.g + CH1.hi) * dy - 16;
    ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(233,238,246,.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(trigX + .5, yTop - 4); ctx.lineTo(trigX + .5, H);
    ctx.moveTo(xf + .5, yTop - 4); ctx.lineTo(xf + .5, H); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(233,238,246,.8)';
    ctx.beginPath(); ctx.moveTo(trigX, yTop); ctx.lineTo(xf, yTop); ctx.stroke();
    ctx.fillStyle = 'rgba(233,238,246,.9)'; ctx.font = '500 10px "JetBrains Mono", monospace';
    const lbl = 'Δt ' + (duty * 200).toFixed(1) + ' µs';
    const tw = ctx.measureText(lbl).width;
    ctx.fillText(lbl, Math.min(Math.max(trigX + (xf - trigX) / 2 - tw / 2, trigX + 4), W - tw - 6), yTop - 6);

    // channel tags on screen
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFD23F'; ctx.fillText('1', 14, H / 2 - CH1.g * dy + 4);
    ctx.fillStyle = '#00E5FF'; ctx.fillText('2', 14, H / 2 - CH2.g * dy + 4);
  }

  function readouts() {
    const d = duty;
    mD.textContent = (d * 100).toFixed(1) + ' %';
    mW.textContent = (d * 200).toFixed(1) + ' µs';
    mV.textContent = (12 * d).toFixed(2) + ' V';
    const p = Math.pow(d, 1 / 2.2);
    mP.textContent = Math.round(p * 100) + ' %';
    glow.style.opacity = (0.15 + p * 0.85).toFixed(3);
    glow.style.boxShadow = `0 0 ${Math.round(6 + p * 22)}px ${Math.round(p * 6)}px rgba(255,210,63,${(p * .55).toFixed(2)})`;
    if (document.activeElement !== slider) slider.value = (d * 100).toFixed(1);
  }

  function loop(now) {
    raf = 0;
    if (!touched && !reduced) target = 0.5 + 0.3 * Math.sin(now / 2400);
    duty += (target - duty) * (reduced ? 1 : 0.18);
    if (Math.abs(duty - shown) > 1e-4) { draw(); readouts(); shown = duty; }
    if (!reduced && (!touched || Math.abs(target - duty) > 1e-4)) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function set(v) { target = Math.min(0.95, Math.max(0.05, v)); touched = true; kick(); }
  cv.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' && e.buttons === 0) return;
    const r = cv.getBoundingClientRect(); set((e.clientX - r.left) / r.width);
  });
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect(); set((e.clientX - r.left) / r.width);
  });
  slider.addEventListener('input', () => set(slider.value / 100));

  // pause the idle sweep when the scope is off-screen
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  })).observe(cv);

  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 120); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(size);
  size(); readouts(); kick();
})();
