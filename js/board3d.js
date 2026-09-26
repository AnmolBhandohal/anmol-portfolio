/* ═══════════════════════════════════════════════════════════
   board3d.js — interactive 3D PCB viewer (ES module).
   Models are REAL: exported from Anmol's Altium PcbDoc files via
   KiCad (Altium importer → kicad-cli export glb, with the STEP
   part models embedded in his Altium libraries), then meshopt-
   compressed. Mount: <div class="b3d" data-model="models/x.glb">.
   Lazy: nothing (not even three.js) loads until a viewer is near
   the viewport. Falls back to the existing still image if WebGL
   is unavailable.
   ═══════════════════════════════════════════════════════════ */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
                  || localStorage.getItem('ab_motion') === 'off';

let libs = null;
async function loadLibs() {
  if (libs) return libs;
  const [THREE, { OrbitControls }, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
    import('three'),
    import('three/addons/controls/OrbitControls.js'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/libs/meshopt_decoder.module.js'),
    import('three/addons/environments/RoomEnvironment.js')
  ]);
  libs = { THREE, OrbitControls, GLTFLoader, MeshoptDecoder, RoomEnvironment };
  return libs;
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}

async function mount(el) {
  if (el.dataset.b3dMounted) return; el.dataset.b3dMounted = 1;
  const stage = el.querySelector('.b3d-stage'), status = el.querySelector('.b3d-status');
  if (!hasWebGL()) { el.classList.add('b3d-fail'); status.textContent = '3D unavailable — showing render'; return; }
  status.textContent = 'Loading 3D model…';
  let L;
  try { L = await loadLibs(); } catch (e) { el.classList.add('b3d-fail'); status.textContent = '3D failed to load'; console.warn(e); return; }
  const { THREE, OrbitControls, GLTFLoader, MeshoptDecoder, RoomEnvironment } = L;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', el.dataset.alt || '3D model of the circuit board');
  renderer.domElement.setAttribute('role', 'img');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 6, 4); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xdfefff, 0x1a1c20, 0.5));

  const camera = new THREE.PerspectiveCamera(32, 1, 0.001, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.screenSpacePanning = true;
  controls.autoRotate = !reduced(); controls.autoRotateSpeed = 0.9;

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  let gltf;
  try {
    gltf = await new Promise((res, rej) => loader.load(el.dataset.model, res,
      p => { if (p.total) status.textContent = `Loading 3D model… ${Math.round(p.loaded / p.total * 100)}%`; }, rej));
  } catch (e) { el.classList.add('b3d-fail'); status.textContent = '3D model failed to load'; console.warn(e); return; }

  const model = gltf.scene;
  /* kicad-cli's GLB is already Y-up, in metres. Off-board parked parts and
     stray pads are stripped at build time (tools/clean.mjs), so the model's
     bounds ARE the board. */
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  model.position.sub(ctr);

  const pivot = new THREE.Group(); pivot.add(model); scene.add(pivot);
  model.traverse(o => { if (o.isMesh) { o.castShadow = false; if (o.material) o.material.side = THREE.DoubleSide; } });

  const R = Math.max(size.x, size.z) * 0.5;
  controls.target.set(0, 0, 0);
  controls.minDistance = R * 0.6; controls.maxDistance = R * 7;
  const views = {
    iso:    new THREE.Vector3(R * 1.55, R * 1.75, R * 2.05),
    top:    new THREE.Vector3(0.0001, R * 3.5, 0.0001),
    side:   new THREE.Vector3(R * 3.3, R * 0.35, 0)
  };
  camera.position.copy(views.iso); controls.update();

  /* smooth camera moves for the view buttons */
  let tween = null;
  function goTo(name) {
    const from = camera.position.clone(), to = views[name].clone(), t0 = performance.now(), dur = reduced() ? 1 : 700;
    controls.autoRotate = false; el.classList.add('touched');
    tween = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(from, to, e).setLength(from.length() + (to.length() - from.length()) * e);
      controls.target.set(0, 0, 0);
      if (k >= 1) tween = null;
    };
    el.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === name));
    kick();
  }
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => goTo(b.dataset.view)));
  const spin = el.querySelector('[data-spin]');
  if (spin) {
    spin.setAttribute('aria-pressed', controls.autoRotate);
    spin.addEventListener('click', () => { controls.autoRotate = !controls.autoRotate; spin.setAttribute('aria-pressed', controls.autoRotate); kick(); });
  }
  controls.addEventListener('start', () => {
    tween = null; el.classList.add('touched');
    if (controls.autoRotate) { controls.autoRotate = false; spin && spin.setAttribute('aria-pressed', false); }
  });

  function resize() {
    const r = stage.getBoundingClientRect(); if (!r.width) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); kick();
  }
  new ResizeObserver(resize).observe(stage);

  /* render on demand; loop only while moving and visible */
  let visible = true, running = false;
  function frame(t) {
    running = false;
    if (!visible) return;
    if (tween) tween(t);
    const moved = controls.update();
    renderer.render(scene, camera);
    if (tween || moved || controls.autoRotate || controls._dragging) kick();
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
  controls.addEventListener('change', kick);
  renderer.domElement.addEventListener('pointerdown', () => { controls._dragging = true; kick(); });
  addEventListener('pointerup', () => { controls._dragging = false; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(el);

  /* stop the page scrolling when you zoom the model with the wheel */
  renderer.domElement.addEventListener('wheel', e => e.preventDefault(), { passive: false });

  resize();
  el.classList.add('b3d-ready');
  status.textContent = '';
}

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { io.unobserve(e.target); mount(e.target); }
}), { rootMargin: '400px' });
window.mountBoards3D = () => document.querySelectorAll('.b3d').forEach(el => io.observe(el));
window.mountBoards3D();
