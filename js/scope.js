/* scope.js — living oscilloscope / signal field background */
(() => {
  const c = document.getElementById('scope');
  if (!c) return;
  const x = c.getContext('2d', { alpha: true });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, t = 0, sy = 0, vel = 0;
  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };

  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * d; c.height = H * d;
    c.style.width = W + 'px'; c.style.height = H + 'px';
    x.setTransform(d, 0, 0, d, 0, 0);
  }

  addEventListener('mousemove', e => { mouse.tx = e.clientX / innerWidth; mouse.ty = e.clientY / innerHeight; });
  addEventListener('scroll', () => {
    const n = scrollY;
    vel += Math.min(Math.abs(n - sy) * .02, 3);
    sy = n;
  }, { passive: true });

  /* grid */
  function grid() {
    const g = 64;
    x.strokeStyle = 'rgba(255,255,255,.028)';
    x.lineWidth = 1;
    const ox = (mouse.x - .5) * 18, oy = (mouse.y - .5) * 18 - (sy * .04 % g);
    x.beginPath();
    for (let i = -1; i * g < W + g; i++) { const px = i * g + ox; x.moveTo(px, 0); x.lineTo(px, H); }
    for (let j = -1; j * g < H + g; j++) { const py = j * g + oy; x.moveTo(0, py); x.lineTo(W, py); }
    x.stroke();
  }

  /* waveform traces */
  function wave(yBase, amp, freq, speed, colour, w, phase) {
    x.strokeStyle = colour; x.lineWidth = w;
    x.beginPath();
    const step = 5;
    for (let px = 0; px <= W + step; px += step) {
      const u = px / W;
      const y = yBase
        + Math.sin(u * freq + t * speed + phase) * amp
        + Math.sin(u * freq * 2.3 + t * speed * 1.4) * amp * .34
        + (mouse.y - .5) * 26
        + vel * Math.sin(u * 9 + t * .1) * 3;
      px ? x.lineTo(px, y) : x.moveTo(px, y);
    }
    x.stroke();
  }

  function frame() {
    x.clearRect(0, 0, W, H);
    mouse.x += (mouse.tx - mouse.x) * .05;
    mouse.y += (mouse.ty - mouse.y) * .05;
    vel *= .93;

    grid();

    const a = 1 + vel * .2;
    wave(H * .5,  H * .1,  6.5, .012, 'rgba(0,229,255,.2)',  1.6, 0);
    wave(H * .5,  H * .07, 9.0, .017, 'rgba(0,229,255,.1)',  1.1, 2.1);
    wave(H * .52, H * .05, 4.4, -.009,'rgba(124,92,255,.13)',1.3, 4.2);

    // scan line
    const sl = (t * 1.1) % (H + 200) - 100;
    const g2 = x.createLinearGradient(0, sl - 70, 0, sl + 70);
    g2.addColorStop(0, 'rgba(0,229,255,0)');
    g2.addColorStop(.5, `rgba(0,229,255,${.04 + vel * .01})`);
    g2.addColorStop(1, 'rgba(0,229,255,0)');
    x.fillStyle = g2; x.fillRect(0, sl - 70, W, 140);

    t += reduced ? 0 : 1;
    requestAnimationFrame(frame);
  }

  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
  size(); frame();
})();
