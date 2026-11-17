// scene.js — a deterministic three.js r169 night desk for the film's first two shots.
// Everything is a pure function of (t, shot): no clocks, no randomness. The lamp's glow is driven by
// env.json = mean luminance per frame of the REAL clip (portrait phone footage of this lamp).
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1920, H = 1080;
const WARM = 0xffcf9a, AMBER = 0xff8a3c;
const P = new URLSearchParams(location.search);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090807);
scene.fog = new THREE.FogExp2(0x0a0806, 0.055);

const camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 30);
const composer = new EffectComposer(renderer);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.24, 0.45, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- procedural textures
function radial(stops, size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const washTex = radial([[0, 'rgba(255,206,150,1)'], [0.28, 'rgba(255,170,105,0.62)'], [0.62, 'rgba(255,140,70,0.16)'], [1, 'rgba(255,130,60,0)']]);

function grainTexture(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  if (kind === 'wood') {
    g.fillStyle = '#7a6a58'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 220; i++) {
      const y = (i * 137) % 256, a = 0.03 + 0.05 * ((i * 53) % 11) / 11;
      g.strokeStyle = `rgba(${40 + (i % 5) * 6},${28 + (i % 4) * 5},${18 + (i % 3) * 4},${a})`;
      g.lineWidth = 1 + (i % 3) * 0.6; g.beginPath(); g.moveTo(0, y);
      g.bezierCurveTo(80, y + 6, 160, y - 5, 256, y + 2); g.stroke();
    }
  } else {
    g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {          // plaster speckle, deterministic
      const x = (i * 7919) % 256, y = (i * 104729) % 256, v = 118 + ((i * 31) % 26);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1, 1);
    }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const woodTex = grainTexture('wood'); woodTex.repeat.set(3, 2);
const plasterTex = grainTexture('plaster'); plasterTex.repeat.set(6, 3);

function screenTexture() {
  const c = document.createElement('canvas'); c.width = 640; c.height = 360;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 640, 360);
  grd.addColorStop(0, '#1b2431'); grd.addColorStop(0.55, '#0e141b'); grd.addColorStop(1, '#070a0e');
  g.fillStyle = grd; g.fillRect(0, 0, 640, 360);
  g.globalAlpha = 0.5; g.fillStyle = '#4a6580'; g.fillRect(44, 54, 300, 10);
  g.globalAlpha = 0.3; g.fillStyle = '#33506b'; g.fillRect(44, 82, 420, 7); g.fillRect(44, 100, 240, 7);
  g.globalAlpha = 0.14; g.fillStyle = '#22384c'; for (let i = 0; i < 7; i++) g.fillRect(44, 140 + i * 22, 150 + (i % 3) * 90, 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}


function breadTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 200;
  const g = c.getContext('2d');
  g.fillStyle = '#d9d5ca'; g.fillRect(0, 0, 512, 200);
  g.fillStyle = '#b9b4a7'; g.fillRect(0, 0, 512, 6); g.fillRect(0, 194, 512, 6);
  for (const y of [18, 182]) { g.fillStyle = 'rgba(190,60,50,0.55)'; g.fillRect(0, y, 512, 3); }
  for (const y of [28, 172]) { g.fillStyle = 'rgba(60,90,170,0.5)'; g.fillRect(0, y, 512, 3); }
  g.fillStyle = '#8e887a';
  for (let r = 0; r < 11; r++) for (let c2 = 0; c2 < 40; c2++) g.fillRect(10 + c2 * 12.4, 40 + r * 12.2, 4, 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const shadowTex = radial([[0, 'rgba(0,0,0,0.85)'], [0.45, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0)']], 256);
function contact(x, z, rx, rz, y = 0.7725, op = 0.55) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rx, rz),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: op, depthWrite: false, color: 0x000000 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m); return m;
}

// ---------------------------------------------------------------- materials
const matWall = new THREE.MeshStandardMaterial({ color: 0x6b5f52, map: plasterTex, roughness: 0.97, metalness: 0 });
const matFloor = new THREE.MeshStandardMaterial({ color: 0x241c15, roughness: 0.55, metalness: 0.02 });
const matDesk = new THREE.MeshStandardMaterial({ color: 0x8d7a63, map: woodTex, roughness: 0.45, metalness: 0.04 });
const matBlack = new THREE.MeshStandardMaterial({ color: 0x131312, roughness: 0.5, metalness: 0.15 });
const matPlastic = new THREE.MeshStandardMaterial({ color: 0x1c1b19, roughness: 0.55 });
const matMetal = new THREE.MeshStandardMaterial({ color: 0xa9adb2, roughness: 0.3, metalness: 0.95 });
const matBread = new THREE.MeshStandardMaterial({ color: 0xb9b5a9, map: breadTexture(), roughness: 0.78 });
const matBlue = new THREE.MeshStandardMaterial({ color: 0x27457d, roughness: 0.6 });
const matMug = new THREE.MeshStandardMaterial({ color: 0xdad3c6, roughness: 0.35 });

// ---------------------------------------------------------------- room
const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.6), matWall);
wall.position.set(0, 2.3, -2.3); wall.receiveShadow = true; scene.add(wall);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), matFloor);
floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.6); floor.receiveShadow = true; scene.add(floor);
const desk = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.05, 0.82, 3, 0.012), matDesk);
desk.position.set(0.1, 0.745, -0.24); desk.castShadow = desk.receiveShadow = true; scene.add(desk);
for (const x of [-0.86, 1.06]) {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.745, 12), matBlack);
  leg.position.set(x, 0.373, -0.24); leg.castShadow = true; scene.add(leg);
}

// ---------------------------------------------------------------- monitor
const monitor = new THREE.Group(); monitor.position.set(0.34, 0, -0.62); monitor.rotation.y = -0.06; scene.add(monitor);
const body = new THREE.Mesh(new RoundedBoxGeometry(0.70, 0.42, 0.024, 3, 0.007), matBlack);
body.position.set(0, 1.08, 0); body.castShadow = true; monitor.add(body);
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.672, 0.396),
  new THREE.MeshStandardMaterial({ map: screenTexture(), roughness: 0.62, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0.30, emissiveMap: screenTexture() }));
screen.position.set(0, 1.08, 0.0132); monitor.add(screen);
const neck = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.18, 0.022, 2, 0.005), matBlack);
neck.position.set(0, 0.885, -0.012); monitor.add(neck);
const foot = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.012, 0.17, 2, 0.005), matBlack);
foot.position.set(0, 0.771, -0.012); foot.receiveShadow = true; monitor.add(foot);

// ---------------------------------------------------------------- the lamp: LED bar behind the monitor
const barGlowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(WARM).multiplyScalar(0.7), toneMapped: false });
const bar = new THREE.Group(); bar.position.set(0.34, 1.03, -0.92); scene.add(bar);
bar.add(new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.05, 0.05, 2, 0.01), matPlastic));
const glowBack = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.034), barGlowMat);
glowBack.position.set(0, 0, -0.026); glowBack.rotation.y = Math.PI; bar.add(glowBack);
const glowUnder = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.02), barGlowMat);
glowUnder.position.set(0, -0.028, 0); glowUnder.rotation.x = Math.PI / 2; bar.add(glowUnder);

const washLight = new THREE.RectAreaLight(WARM, 8, 1.05, 0.26);
washLight.position.set(0.34, 1.06, -0.89); washLight.lookAt(0.34, 1.06, -2.3); scene.add(washLight);
const deskLight = new THREE.PointLight(WARM, 0.6, 1.9, 2);
deskLight.position.set(0.30, 1.26, -0.30); deskLight.castShadow = true;
deskLight.shadow.mapSize.set(1024, 1024); deskLight.shadow.bias = -0.0015; scene.add(deskLight);
const hemi = new THREE.HemisphereLight(0x3a3026, 0x0b0908, 1.0); scene.add(hemi);
const fill = new THREE.RectAreaLight(0x6d7f96, 0.55, 1.6, 1.0);
fill.position.set(-0.4, 1.5, 1.3); fill.lookAt(0.3, 0.9, -0.5); scene.add(fill);
const screenSpill = new THREE.RectAreaLight(0x8fa9c8, 0.5, 0.66, 0.4);
screenSpill.position.set(0.34, 1.06, -0.60); screenSpill.lookAt(0.34, 0.9, 0.6); scene.add(screenSpill);
const rim = new THREE.PointLight(0x9fb6d6, 0.10, 5, 2); rim.position.set(-1.9, 1.7, 1.2); scene.add(rim);

const wash = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.45),
  new THREE.MeshBasicMaterial({ map: washTex, color: AMBER, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
wash.position.set(0.34, 1.16, -2.28); scene.add(wash);
const washLow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.55),
  new THREE.MeshBasicMaterial({ map: washTex, color: AMBER, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
washLow.position.set(0.34, 0.84, -2.28); scene.add(washLow);

// ---------------------------------------------------------------- desk objects
// keyboard
const kb = new THREE.Group(); kb.position.set(0.30, 0.775, 0.03); kb.rotation.y = -0.06; scene.add(kb);
const kbBody = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.016, 0.135, 2, 0.005), matPlastic);
kbBody.castShadow = true; kb.add(kbBody);
for (let r = 0; r < 5; r++) for (let c = 0; c < 16; c++) {
  const k = new THREE.Mesh(new THREE.BoxGeometry(0.0225, 0.005, 0.0225), matBlack);
  k.position.set(-0.194 + c * 0.0259, 0.010, -0.048 + r * 0.0245); kb.add(k);
}
// mug
const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, 0.088, 24, 1, true), matMug);
mug.position.set(-0.42, 0.82, -0.02); mug.castShadow = true; scene.add(mug);
const mugCoffee = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.3 }));
mugCoffee.rotation.x = -Math.PI / 2; mugCoffee.position.set(-0.42, 0.836, -0.02); scene.add(mugCoffee);

// breadboard build in the foreground, right of the keyboard
const bb = new THREE.Group(); bb.position.set(0.74, 0.772, 0.26); bb.rotation.y = -0.34; bb.scale.setScalar(1.25); scene.add(bb);
const board = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.014, 0.072, 2, 0.004), matBread);
board.castShadow = board.receiveShadow = true; bb.add(board);
const esp = new THREE.Group(); esp.position.set(-0.045, 0.012, 0); bb.add(esp);
const espPcb = new THREE.Mesh(new RoundedBoxGeometry(0.062, 0.005, 0.03, 2, 0.002), matBlack);
espPcb.castShadow = true; esp.add(espPcb);
const shield = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.005, 0.02, 2, 0.0015), matMetal);
shield.position.set(0.008, 0.005, 0); shield.castShadow = true; esp.add(shield);
const led = new THREE.Mesh(new THREE.SphereGeometry(0.0024, 12, 12), new THREE.MeshBasicMaterial({ color: 0x7dffb0, toneMapped: false }));
led.position.set(-0.026, 0.005, 0.009); esp.add(led);
const mosfet = new THREE.Mesh(new RoundedBoxGeometry(0.011, 0.015, 0.005, 2, 0.001), matBlack);
mosfet.position.set(0.05, 0.012, -0.014); mosfet.castShadow = true; bb.add(mosfet);
const tab = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.004, 0.0015), matMetal);
tab.position.set(0.05, 0.021, -0.014); bb.add(tab);
const bh = new THREE.Mesh(new RoundedBoxGeometry(0.015, 0.003, 0.013, 2, 0.001), matBlue);
bh.position.set(0.014, 0.011, 0.021); bh.castShadow = true; bb.add(bh);
const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.009, 20), matBlue);
pot.position.set(0.064, 0.012, 0.02); pot.rotation.x = Math.PI / 2; bb.add(pot);
const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.007, 20), matBlack);
knob.position.set(0.064, 0.012, 0.026); knob.rotation.x = Math.PI / 2; bb.add(knob);
function wire(a, b, col, sag, r = 0.0012) {
  const mid = a.clone().lerp(b, 0.5); mid.y += sag;
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 20, r, 6, false),
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }));
  m.castShadow = true; return m;
}
bb.add(wire(V(-0.06, 0.019, 0.014), V(0.014, 0.013, 0.021), 0xb03a2e, 0.008));
bb.add(wire(V(-0.06, 0.019, -0.014), V(0.05, 0.014, -0.014), 0x2b2b2b, 0.008));
bb.add(wire(V(-0.028, 0.019, 0.014), V(0.064, 0.013, 0.02), 0xd8ae2a, 0.01));
bb.add(wire(V(-0.028, 0.019, -0.014), V(0.014, 0.013, 0.021), 0x2f6fb0, 0.011));
// cable from the board up to the lamp bar
scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(
  [V(0.68, 0.79, 0.14), V(0.66, 0.86, -0.28), V(0.46, 1.0, -0.78), V(0.36, 1.03, -0.9)]), 48, 0.003, 8, false),
  new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.7 })));

// soft contact shading so nothing floats (a cheap stand-in for AO on a dark scene)
contact(0.34, -0.60, 0.55, 0.30, 0.7735, 0.65);      // monitor foot
contact(0.30, 0.03, 0.60, 0.26, 0.7735, 0.5);        // keyboard
contact(-0.42, -0.02, 0.34, 0.26, 0.7735, 0.55);     // mug
contact(0.74, 0.26, 0.42, 0.30, 0.7735, 0.6);        // breadboard
// ---------------------------------------------------------------- camera paths
const look = (p, t) => { camera.position.copy(p); camera.lookAt(t); };
function heroCamera(t) {
  const k = Math.min(Math.max(t / 3, 0), 1), e = k * k * (3 - 2 * k);
  const from = V(1.30, 1.30, 2.55), to = V(0.86, 1.06, 1.42);
  const p = from.clone().lerp(to, e); p.x += Math.sin(e * Math.PI) * 0.04;
  look(p, V(-0.10 + 0.03 * e, 0.94, -0.55));
}
function lampCamera(t) {
  const a = -0.06 + 0.12 * Math.min(Math.max(t / 7.5, 0), 1);
  const p = V(0.86 + Math.sin(a) * 1.30, 1.05 + 0.01 * Math.sin(t * 0.6), 1.42 + Math.cos(a) * 0.28);
  look(p, V(0.30, 0.92, -0.55));
}

// ---------------------------------------------------------------- glow from the real audio-reactive brightness
let env = { fps: 30, wall: new Array(416).fill(0.5) };
function brightness(t) {
  const a = env.wall || env.whole, i = Math.round((4.6 + t) * (env.fps || 30));
  return Math.min(1, Math.max(0, a[Math.min(Math.max(i, 0), a.length - 1)] ?? 0.5));
}
function setGlow(v) {
  const g = Math.pow(v, 0.8);
  barGlowMat.color.setHex(WARM).multiplyScalar(0.22 + 0.85 * g);
  washLight.intensity = 2.5 + 16 * g;
  deskLight.intensity = 0.18 + 1.1 * g;
  wash.material.opacity = 0.10 + 0.55 * g;
  washLow.material.opacity = 0.04 + 0.22 * g;
  bloom.strength = 0.20 + 0.26 * g;
  renderer.toneMappingExposure = 0.84 + 0.14 * g;
}

// ---------------------------------------------------------------- API
window.renderAt = function (t, shot) {
  if (shot === 'hero') { heroCamera(t); setGlow(Math.min(1, 0.04 + 0.9 * Math.min(1, t / 1.2))); }
  else { lampCamera(t); setGlow(brightness(t)); }
  composer.render();
  return true;
};
window.READY = (async () => {
  try { env = await (await fetch('./env.json')).json(); } catch (e) {}
  window.renderAt(0, 'hero'); document.title = 'READY'; return true;
})();

if (P.get('live')) {
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0.30, 0.92, -0.55);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enableZoom = false;
  controls.maxPolarAngle = Math.PI * 0.53; controls.minAzimuthAngle = -0.45; controls.maxAzimuthAngle = 0.45;
  const loop = () => {
    setGlow(brightness((performance.now() / 1000) % 7.5));
    controls.update(); composer.render(); requestAnimationFrame(loop);
  };
  loop();
} else if (P.has('t') || P.has('shot')) {
  window.READY.then(() => {
    window.renderAt(parseFloat(P.get('t') || '0'), P.get('shot') === 'hero' ? 'hero' : 'lamp');
    document.title = 'DONE';
  });
}
