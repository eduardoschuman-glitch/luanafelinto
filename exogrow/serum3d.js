/* Sérum EXOGROW em 3D: o mesmo objeto do começo ao fim (gira, pousa, abre e fecha). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  const fb = document.getElementById('fallback'); if (fb) fb.src = fb.dataset.src;
  document.documentElement.classList.add('no-gl');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;

/* câmera ortográfica em pixels: 1 unidade = 1 px da tela */
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -20000, 20000);
camera.position.z = 5000;

/* luz de estúdio: principal suave do alto à esquerda, preenchimento fraco e um contorno por trás */
const key = new THREE.DirectionalLight(0xffffff, 2.5); key.position.set(-0.45, 1.25, 0.75); scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.22); fill.position.set(1, -0.25, 0.7); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.5); rim.position.set(0.3, 0.7, -1); scene.add(rim);
scene.add(new THREE.HemisphereLight(0xffffff, 0x0e0e0e, 0.16));

/* ---------- medidas (comprimento total = 1) ---------- */
const W = 0.118;            // espessura do frasco
const A = W / 2;            // meia espessura
const NEXP = 3.0;           // seção: quadrado bem arredondado (superelipse), como o frasco real
const BODY = 0.646;         // fim do corpo (início da tampa)
const CAP0 = 0.6468, CAP1 = 1.0;   // só um vão fino entre corpo e tampa
const SLIDE = 0.52;         // quanto a tampa anda para abrir

const plastic = new THREE.MeshPhysicalMaterial({ color: 0xf1f1f0, roughness: 0.27, clearcoat: 0.85, clearcoatRoughness: 0.07, envMapIntensity: 0.75 });
const plasticMate = new THREE.MeshPhysicalMaterial({ color: 0xeeeeeb, roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.8 });
const black = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 });

const rig = new THREE.Group();        // posição/rotação na tela
const prod = new THREE.Group();       // giro no próprio eixo (rolagem)
const inner = new THREE.Group();      // centraliza (e foca na escovinha)
rig.add(prod); prod.add(inner); scene.add(rig);

/* ---------- seção arredondada (superelipse) com parâmetro por comprimento de arco ---------- */
/* p = 0..1 em volta da seção, começando no canto frente-baixo e subindo: frente, topo, verso, baixo */
const SEC = (() => {
  const N = 2000, raw = [];
  for (let i = 0; i <= N; i++) {
    const t = -Math.PI / 4 + (i / N) * Math.PI * 2, sn = Math.sin(t), cs = Math.cos(t);
    raw.push([A * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / NEXP), A * Math.sign(cs) * Math.pow(Math.abs(cs), 2 / NEXP)]);
  }
  const acc = [0];
  for (let i = 1; i <= N; i++) acc.push(acc[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const P = acc[N], M = 160, pts = [];
  let j = 0;
  for (let k = 0; k <= M; k++) {
    const target = (k / M) * P;
    while (j < N - 1 && acc[j + 1] < target) j++;
    const f = (target - acc[j]) / (acc[j + 1] - acc[j] || 1);
    pts.push([raw[j][0] + (raw[j + 1][0] - raw[j][0]) * f, raw[j][1] + (raw[j + 1][1] - raw[j][1]) * f]);
  }
  return { P, pts, M };
})();

/* peça alongada com a seção acima, pontas arredondadas (rA no início, rB no fim) e UV (u = x/len, v = p) */
function peca(len, rA, rB) {
  const xs = [], NE = 14;
  for (let i = 0; i <= NE; i++) xs.push(rA * (1 - Math.cos((i / NE) * Math.PI / 2)));
  for (let i = 1; i < 40; i++) xs.push(rA + (len - rA - rB) * i / 40);
  for (let i = NE; i >= 0; i--) xs.push(len - rB * (1 - Math.cos((i / NE) * Math.PI / 2)));
  const scale = (x) => {
    if (x < rA) { const d = rA - x; return (A - rA + Math.sqrt(Math.max(rA * rA - d * d, 0))) / A; }
    if (x > len - rB) { const d = x - (len - rB); return (A - rB + Math.sqrt(Math.max(rB * rB - d * d, 0))) / A; }
    return 1;
  };
  const pos = [], uv = [], idx = [], M = SEC.M, cols = M + 1;
  xs.forEach(x => { const sc = scale(x); SEC.pts.forEach((q, k) => { pos.push(x, q[0] * sc, q[1] * sc); uv.push(x / len, k / M); }); });
  for (let r = 0; r < xs.length - 1; r++) for (let k = 0; k < M; k++) {
    const a = r * cols + k, b = a + 1, c = a + cols, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const fan = (row, x, flip) => {
    const c0 = pos.length / 3; pos.push(x, 0, 0); uv.push(x / len, 0.5);
    for (let k = 0; k < M; k++) { const a = row * cols + k, b = a + 1; if (flip) idx.push(c0, b, a); else idx.push(c0, a, b); }
  };
  fan(0, 0, true); fan(xs.length - 1, len, false);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal;   // costura de p (k = 0 e k = M são o mesmo ponto)
  for (let r = 0; r < xs.length; r++) {
    const a = r * cols, b = a + M;
    const v = new THREE.Vector3(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z); n.setXYZ(b, v.x, v.y, v.z);
  }
  return g;
}

/* ---------- rótulo envolvendo o frasco: as quatro faces num só desenho ---------- */
const H = 0.1177;   // altura da foto do rótulo em relação ao comprimento
const faces = [
  { img: 'logo', p: 0.125, x0: 0.0746, x1: 0.5872, cy: 0.4625 },
  { img: 'contatos', p: 0.375, x0: 0.0965, x1: 0.5563, cy: 0.384 },
  { img: 'verso', p: 0.625, x0: 0.0917, x1: 0.5105, cy: 0.42 },
  { img: 'serum', p: 0.875, x0: 0.0888, x1: 0.5246, cy: 0.504 },
];
const KPX = 4096 / BODY;
const lab = document.createElement('canvas');
lab.width = 4096; lab.height = Math.round(SEC.P * KPX);
const lg = lab.getContext('2d');
const labTex = new THREE.CanvasTexture(lab);
labTex.colorSpace = THREE.SRGBColorSpace; labTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
function desenhaRotulo(imgs) {
  lg.fillStyle = '#ffffff'; lg.fillRect(0, 0, lab.width, lab.height);
  faces.forEach((f, i) => {
    const im = imgs[i]; if (!im) return;
    const w = (f.x1 - f.x0) * KPX, h = w * im.height / im.width;
    const cx = ((f.x0 + f.x1) / 2) * KPX;
    const pc = f.p * SEC.P + (0.5 - f.cy) * H;
    const cyc = lab.height - pc * KPX;
    const t = document.createElement('canvas'); t.width = im.width; t.height = im.height;
    const tg = t.getContext('2d'); tg.drawImage(im, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = '#0c0c0c'; tg.fillRect(0, 0, im.width, im.height);
    lg.drawImage(t, cx - w / 2, cyc - h / 2, w, h);
  });
  labTex.needsUpdate = true;
}
const imgs = [];
desenhaRotulo(imgs);
faces.forEach((f, i) => { const im = new Image(); im.onload = () => { imgs[i] = im; desenhaRotulo(imgs); }; im.src = `assets/produto/3d/${f.img}.webp`; });
const plasticLabel = plastic.clone(); plasticLabel.map = labTex;

/* corpo: fundo bem arredondado; na junta com a tampa, só um chanfro mínimo (fica o vão fino) */
const body = new THREE.Mesh(peca(BODY, 0.03, 0.0022), plasticLabel);
inner.add(body);

/* rosca */
const pts = [];
const NL = 0.056, TH = 9;
for (let i = 0; i <= 180; i++) {
  const t = i / 180; const saw = Math.abs(((t * TH) % 1) - 0.5) * 2;
  pts.push(new THREE.Vector2(0.031 + 0.0038 * (1 - saw), t * NL));
}
const neckGeo = new THREE.LatheGeometry(pts, 48); neckGeo.rotateZ(-Math.PI / 2);
const neck = new THREE.Mesh(neckGeo, plasticMate); neck.position.x = BODY - 0.004; inner.add(neck);

/* tampa + haste + escovinha: um grupo que desliza e inclina a partir da boca da tampa */
const capPivot = new THREE.Group(); capPivot.position.x = CAP0; inner.add(capPivot);
const cap = new THREE.Mesh(peca(CAP1 - CAP0, 0.0022, 0.03), plastic);
capPivot.add(cap);
/* sombra da junta: com a tampa fechada, o vão aparece como uma linha cinza fina, não um buraco preto */
const junta = new THREE.Mesh(peca(0.004, 0.0004, 0.0004), new THREE.MeshStandardMaterial({ color: 0xa4a4a1, roughness: 0.55 }));
junta.scale.set(1, 0.965, 0.965); junta.position.x = -0.0018; capPivot.add(junta);

/* boca da tampa (vista quando ela sai) */
const mouthTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  const r = g.createRadialGradient(128, 128, 10, 128, 128, 110); r.addColorStop(0, '#6f6f6c'); r.addColorStop(0.7, '#a9a9a5'); r.addColorStop(1, '#dcdcd8');
  g.fillStyle = r; g.beginPath(); g.roundRect(26, 26, 204, 204, 80); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const mouth = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.9, W * 0.9), new THREE.MeshStandardMaterial({ map: mouthTex, roughness: 0.6, transparent: true }));
mouth.rotation.y = -Math.PI / 2; mouth.position.x = -0.0015; capPivot.add(mouth);

const WAND0 = -0.24, BR0 = -0.35;   // relativo à boca da tampa
const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, -WAND0, 24).rotateZ(Math.PI / 2), plastic);
wand.position.x = WAND0 / 2; capPivot.add(wand);

/* escovinha de silicone moldado: núcleo fino + aletas finas em espiral, afinando na ponta (como a do produto) */
const brush = new THREE.Group(); capPivot.add(brush);
const silicone = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.28, envMapIntensity: 0.28 });
const BLEN = WAND0 - BR0, RC = 0.0052;
const core = new THREE.Mesh(new THREE.CylinderGeometry(RC, RC * 0.85, BLEN, 24).rotateZ(Math.PI / 2), silicone);
core.position.x = (WAND0 + BR0) / 2; brush.add(core);
const ponta = new THREE.Mesh(new THREE.SphereGeometry(RC * 0.85, 20, 12), silicone);
ponta.position.x = BR0; brush.add(ponta);
/* colar onde a haste branca entra no silicone */
const colar = new THREE.Mesh(new THREE.CylinderGeometry(0.0098, 0.0075, 0.012, 28).rotateZ(Math.PI / 2), silicone);
colar.position.x = WAND0 - 0.004; brush.add(colar);

/* uma aleta: lâmina fina com a borda arredondada, na base mais larga */
const aletaGeo = (() => {
  const s = new THREE.Shape(), L = 0.0152, wb = 0.006, wt = 0.0028;
  s.moveTo(-wb, 0); s.lineTo(wb, 0);
  s.quadraticCurveTo(wb * 0.9, L * 0.6, wt, L * 0.92);
  s.quadraticCurveTo(0, L * 1.06, -wt, L * 0.92);
  s.quadraticCurveTo(-wb * 0.9, L * 0.6, -wb, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.0016, bevelEnabled: true, bevelThickness: 0.0007, bevelSize: 0.0006, bevelSegments: 3, curveSegments: 10 });
  g.translate(0, 0, -0.0008);
  g.rotateY(Math.PI / 2);            // espessura ao longo do eixo da escovinha
  return g;
})();
const POS = 58, POR = 4;            // 58 fileiras ao longo do eixo, 3 aletas por fileira
const aletas = new THREE.InstancedMesh(aletaGeo, silicone, POS * POR);
const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
let rnd = 7; const r = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
let n = 0;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
for (let i = 0; i < POS; i++) {
  const t = i / (POS - 1);                         // 0 = ponta, 1 = base
  const x = BR0 + 0.004 + t * (BLEN - 0.012);
  const tam = 0.45 + 0.55 * sstep(0, 0.32, t) - 0.12 * sstep(0.88, 1, t);
  for (let k = 0; k < POR; k++) {
    const ang = i * 0.42 + k * (Math.PI * 2 / POR) + (r() - 0.5) * 0.12;   // espiral
    e.set(ang, 0, 0, 'XYZ'); q.setFromEuler(e);
    const inc = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.5 + (r() - 0.5) * 0.3);   // aleta inclinada, como no molde
    q.multiply(inc);
    v.set(x, 0, 0);
    sc.set(1, tam * (0.86 + r() * 0.2), 1);
    m4.compose(v, q, sc);
    m4.multiply(new THREE.Matrix4().makeTranslation(0, RC * 0.6 / sc.y, 0));
    aletas.setMatrixAt(n++, m4);
  }
}
aletas.instanceMatrix.needsUpdate = true;
brush.add(aletas);

/* ---------- estado animado pelo scroll ---------- */
const st = { x: 0, y: 0, rot: -90, s: 1, roll: -32, open: 0, tilt: 0, f: 0 };
const VW = () => innerWidth, VH = () => innerHeight, M = () => innerWidth < 768;
const L = () => (M() ? innerWidth * 0.92 : Math.min(innerWidth * 0.62, 1150));
const D = THREE.MathUtils.degToRad;
const tmp = new THREE.Vector3();

function aplicar() {
  rig.position.set(st.x, -st.y, 0);
  rig.rotation.z = -D(st.rot);
  rig.scale.setScalar(st.s * L());
  prod.rotation.x = D(st.roll);
  capPivot.position.x = CAP0 + st.open * SLIDE;
  capPivot.rotation.z = D(st.tilt);
  junta.visible = st.open < 0.01;
  // foco na escovinha: centro dela vira o centro do produto
  capPivot.updateMatrix(); core.updateMatrix();
  tmp.set((WAND0 + BR0) / 2, 0, 0).applyMatrix4(capPivot.matrix);
  inner.position.set(-(0.5 * (1 - st.f) + tmp.x * st.f), -tmp.y * st.f, 0);
}
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

gsap.ticker.add(() => { aplicar(); renderer.render(scene, camera); });

/* ---------- linha do tempo (unidades = alturas de tela) ---------- */
const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#jornada', start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true } });
const io = 'power1.inOut';

/* 0 → 1: de pé atrás do título, inclina na diagonal */
tl.fromTo(st,
  { x: 0, y: () => VH() * (M() ? .36 : .42), rot: -90, s: () => VH() * 1.25 / L(), roll: -32 },
  { x: () => M() ? 0 : -VW() * .05, y: () => VH() * (M() ? .16 : .1), rot: -56, s: () => M() ? 1.2 : 1, roll: -52, duration: .8, ease: io }, .15);

/* 1 → 2: deita na horizontal, com as medidas */
tl.to(st, { x: 0, y: () => -VH() * .02, rot: 0, s: 1, roll: -28, duration: .75, ease: io }, 1.2);

/* 2 → 3: gira de verdade no próprio eixo (todas as faces) e para no rótulo do sérum */
tl.to(st, { y: () => VH() * (M() ? .2 : .14), x: () => M() ? 0 : VW() * .12, rot: 6, s: () => M() ? 1 : .86, duration: .7, ease: io }, 2.3);
tl.to(st, { roll: -450, duration: .8, ease: 'power2.inOut' }, 2.25);

/* 3 → 4: close no frasco, o logo enorme cruzando a tela */
tl.to(st, { x: () => M() ? VW() * .12 : -VW() * .27, y: () => M() ? -VH() * .27 : VH() * .06, rot: () => M() ? -24 : -64, s: () => M() ? 3.2 : 2.4, roll: -392, duration: .7, ease: io }, 3.3);
tl.to(st, { rot: () => M() ? -22 : -56, x: () => M() ? VW() * .04 : -VW() * .3, roll: -385, duration: .6 }, 4.0);

/* 4 → 5: pousa numa diagonal leve, com o logo de frente, e para */
tl.to(st, { x: () => M() ? -VW() * .17 : -VW() * .13, y: () => M() ? -VH() * .1 : VH() * .02, rot: -10, s: () => M() ? .6 : .74, roll: -360, duration: .7, ease: 'power2.out' }, 4.55);

/* 5: abre no mesmo eixo, a escovinha sai de dentro do frasco */
tl.to(st, { open: 1, duration: .75, ease: io }, 5.3);
tl.to(st, { tilt: 9, duration: .4, ease: 'power1.out' }, 5.95);
tl.to(st, { x: () => M() ? -VW() * .19 : -VW() * .19, duration: .75, ease: io }, 5.3);
tl.fromTo('.chip', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: .1, duration: .25, immediateRender: true }, 5.75);

/* 6: a câmera chega na escovinha (como usar) */
tl.to(st, { f: 1, s: () => M() ? 3.4 : 3.6, x: () => M() ? 0 : VW() * .2, y: () => M() ? -VH() * .24 : 0, rot: () => M() ? -18 : -24, roll: -372, duration: .6, ease: io }, 6.45);
tl.to(st, { rot: () => M() ? -8 : -14, roll: -350, duration: .6 }, 7.05);

/* 7: fecha e pousa. Desktop: deitado no espaço vazio abaixo do texto. Celular: de pé no centro. */
tl.to(st, { f: 0, open: 0, tilt: 0, x: 0, y: () => M() ? VH() * .17 : VH() * .3, rot: () => M() ? -90 : -4, s: () => M() ? VH() * 1.04 / L() : .75, roll: -392, duration: .7, ease: io }, 7.5);
tl.set({}, {}, 8.2);

/* o palco sobe junto quando chegam os resultados */
gsap.to('#stage', { yPercent: -100, ease: 'none', scrollTrigger: { trigger: '#resultados', start: 'top bottom', end: 'top top', scrub: true } });
ScrollTrigger.refresh();
window.__serum = { st, tl, rig };
