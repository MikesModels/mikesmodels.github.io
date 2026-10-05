// The Custom Design workshop, built as a CSS 3D scene like the gallery: world units are px, y points down,
// the floor is at y = 330, the camera sits at the origin looking down -z (perspective 1000px).
// Desks are boxes with illustrated faces; small props are flat "billboard" planes facing the camera.

const at = (x: number, y: number, z: number, ry = 0) => `translate3d(${x}px,${y}px,${z}px)${ry ? ` rotateY(${ry}deg)` : ''}`;
/** A flat face, centred on its own middle. */
const P = (w: number, h: number, t: string, style: string, inner = '', attrs = '') =>
  `<div class="p"${attrs} style="width:${w}px;height:${h}px;left:${-w / 2}px;top:${-h / 2}px;transform:${t};${style}">${inner}</div>`;
/** A 3D group (preserve-3d container) placed at `t`. */
const G = (t: string, inner: string, attrs = '') => `<div class="g"${attrs} style="transform:${t}">${inner}</div>`;
const shade = (a: number) => `box-shadow:inset 0 0 0 2000px rgba(7,9,14,${a});`;

type BoxFaces = { front: string; side?: string; top?: string; frontInner?: string; topInner?: string; sideInner?: string };
/** A box w (x) × h (y) × d (z) centred on its middle; only the faces the camera can see are drawn. */
function box(w: number, h: number, d: number, f: BoxFaces) {
  const side = f.side ?? f.front, top = f.top ?? f.front;
  return P(w, h, `translateZ(${d / 2}px)`, f.front, f.frontInner) +
    P(d, h, `rotateY(90deg) translateZ(${w / 2}px)`, side + shade(.22), f.sideInner) +
    P(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, side + shade(.22), f.sideInner) +
    P(w, d, `rotateX(90deg) translateZ(${h / 2}px)`, top, f.topInner);
}
const svg = (w: number, h: number, body: string) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">${body}</svg>`;

// ---------------------------------------------------------------- materials
const PLY_TOP = 'background:radial-gradient(ellipse 34% 60% at var(--glow,18%) 30%,rgba(255,241,205,.55),rgba(255,241,205,0)),repeating-linear-gradient(91deg,rgba(150,108,58,.09) 0 2px,rgba(150,108,58,0) 2px 19px),linear-gradient(90deg,#DDC59A,#E9D5AE 45%,#DFC8A0);';
const PLY_EDGE = 'background:repeating-linear-gradient(0deg,#D6BA88 0 3px,#C4A26E 3px 5px,#E2CB9F 5px 7px);';
const STEEL = 'background:linear-gradient(90deg,#39404F,#4B5263 45%,#39404F);';
const CABINET = 'background:#4B5263;';
const PRINTER = 'background:linear-gradient(#2A2F3A,#232833);';

// ---------------------------------------------------------------- props (SVG art)
const CAD_SCREEN = svg(300, 175, `
  <rect width="300" height="175" fill="#161A22"/>
  <rect width="300" height="13" fill="#2A2F3A"/><circle cx="8" cy="6.5" r="2.5" fill="#E0364F"/><circle cx="16" cy="6.5" r="2.5" fill="#E8A132"/><circle cx="24" cy="6.5" r="2.5" fill="#12A150"/>
  <rect x="40" y="4" width="26" height="5" rx="1" fill="#4B5263"/><rect x="72" y="4" width="20" height="5" rx="1" fill="#4B5263"/><rect x="98" y="4" width="30" height="5" rx="1" fill="#4B5263"/>
  <rect y="13" width="58" height="162" fill="#20252F"/>
  <g fill="#4B5263"><rect x="8" y="22" width="40" height="4" rx="1"/><rect x="14" y="31" width="34" height="4" rx="1"/><rect x="14" y="40" width="28" height="4" rx="1" fill="#1F6FEB"/><rect x="14" y="49" width="36" height="4" rx="1"/><rect x="8" y="60" width="38" height="4" rx="1"/><rect x="14" y="69" width="30" height="4" rx="1"/></g>
  <rect x="242" y="13" width="58" height="162" fill="#20252F"/>
  <g fill="#4B5263"><rect x="250" y="22" width="20" height="4" rx="1"/><rect x="250" y="34" width="42" height="9" rx="1" fill="#2A2F3A" stroke="#4B5263"/><rect x="250" y="50" width="20" height="4" rx="1"/><rect x="250" y="62" width="42" height="9" rx="1" fill="#2A2F3A" stroke="#4B5263"/><rect x="250" y="78" width="20" height="4" rx="1"/><rect x="250" y="90" width="42" height="9" rx="1" fill="#2A2F3A" stroke="#4B5263"/></g>
  <g stroke="rgba(127,169,246,.10)" stroke-width="1">${Array.from({ length: 9 }, (_, i) => `<path d="M${58 + i * 23} 13 V175"/>`).join('')}${Array.from({ length: 7 }, (_, i) => `<path d="M58 ${13 + i * 23} H242"/>`).join('')}</g>
  <g fill="rgba(1,203,254,.14)" stroke="#45D4FF" stroke-width="1.4" stroke-linejoin="round">
    <path d="M100 120 L150 95 L200 120 L150 145 Z"/><path d="M100 120 L100 104 L150 79 L150 95"/><path d="M150 79 L170 89 L170 64 L150 54 Z"/><path d="M170 89 L200 104 L200 120"/><path d="M150 54 L170 44 L190 54 L170 64"/><path d="M190 54 L190 79 L170 89"/>
  </g>
  <circle cx="125" cy="112" r="6" fill="none" stroke="#45D4FF" stroke-width="1.2"/><circle cx="175" cy="112" r="6" fill="none" stroke="#45D4FF" stroke-width="1.2"/>
  <path d="M100 152 L200 152 M100 148 V156 M200 148 V156" stroke="#E8A132" stroke-width="1"/><rect x="138" y="146" width="24" height="9" fill="#161A22"/><text x="150" y="153.5" text-anchor="middle" font-size="7" fill="#E8A132" font-family="monospace">40.0</text>
  <g stroke-width="2" stroke-linecap="round"><path d="M70 165 l14 0" stroke="#E0364F"/><path d="M70 165 l0 -14" stroke="#12A150"/><path d="M70 165 l-8 6" stroke="#1F6FEB"/></g>
  <rect x="58" y="13" width="184" height="10" fill="#1B2030"/><rect x="62" y="16" width="44" height="4" rx="1" fill="#0B5AD6"/>`);

const PRINTER_FRONT = svg(190, 210, `
  <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".35" stop-color="#FFFFFF" stop-opacity=".03"/><stop offset=".55" stop-color="#FFFFFF" stop-opacity=".1"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
  <radialGradient id="pl" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#FFF3D6" stop-opacity=".55"/><stop offset="1" stop-color="#FFF3D6" stop-opacity="0"/></radialGradient></defs>
  <rect width="190" height="210" rx="7" fill="#2A2F3A"/>
  <rect x="11" y="11" width="168" height="158" rx="4" fill="#0E1320"/>
  <rect x="11" y="11" width="168" height="158" rx="4" fill="url(#pl)"/>
  <rect x="19" y="15" width="152" height="3" rx="1.5" fill="#FFF6DC"/>
  <rect x="18" y="38" width="154" height="7" rx="2" fill="#4B5263"/>
  <rect x="76" y="28" width="38" height="34" rx="4" fill="#39404F"/><circle cx="95" cy="44" r="10" fill="#1B1F27"/><circle cx="95" cy="44" r="3" fill="#4B5263"/>
  <path d="M90 62 L100 62 L95 72 Z" fill="#E8A132"/><circle cx="95" cy="73" r="2.2" fill="#FFD27A"/>
  <g fill="#01CBFE">${Array.from({ length: 9 }, (_, i) => `<rect x="${72 - (i % 3)}" y="${138 - i * 4}" width="${46 + (i % 3) * 2}" height="3.4" rx=".6" opacity="${0.78 + (i % 2) * 0.2}"/>`).join('')}</g>
  <path d="M74 103 L116 103" stroke="#45D4FF" stroke-width="1" stroke-dasharray="2 2" opacity=".7"/>
  <rect x="24" y="142" width="142" height="9" rx="1.5" fill="#8C6B3A"/><rect x="24" y="142" width="142" height="3" rx="1" fill="#B38A4A"/>
  <rect x="11" y="11" width="168" height="158" rx="4" fill="url(#pg)"/>
  <rect x="11" y="11" width="168" height="158" rx="4" fill="none" stroke="#4B5263" stroke-width="2"/>
  <rect x="178" y="60" width="6" height="56" rx="2" fill="#4B5263"/>
  <rect x="14" y="179" width="44" height="22" rx="2" fill="#0B1222" stroke="#4B5263"/><text x="36" y="194" text-anchor="middle" font-size="10" fill="#45D4FF" font-family="monospace">62%</text>
  <rect x="66" y="188" width="70" height="4" rx="2" fill="#39404F"/><rect x="66" y="188" width="43" height="4" rx="2" fill="#12A150"/>
  <circle cx="168" cy="190" r="5" fill="#12A150"/>`);

const DRAWERS = (labels: string[]) => svg(190, 274, `
  <rect width="190" height="274" fill="#4B5263"/>
  ${labels.map((l, i) => {
    const y = 10 + i * 88;
    return `<rect x="9" y="${y}" width="172" height="80" rx="3" fill="#5B6475" stroke="#39404F" stroke-width="2"/>
    <rect x="9" y="${y}" width="172" height="5" rx="2" fill="#6B7487"/>
    <rect x="62" y="${y + 18}" width="66" height="22" rx="2" fill="#F6F7F9" stroke="#C2C7D1"/>
    <text x="95" y="${y + 33}" text-anchor="middle" font-size="10" font-weight="700" fill="#39404F" font-family="Space Grotesk, sans-serif" letter-spacing=".6">${l}</text>
    <rect x="70" y="${y + 52}" width="50" height="9" rx="4.5" fill="#C2C7D1"/><rect x="70" y="${y + 52}" width="50" height="4" rx="2" fill="#ECEEF2"/>`;
  }).join('')}`);

const KEYBOARD_TOP = svg(190, 64, `<rect width="190" height="64" rx="4" fill="#2A2F3A"/>
  ${Array.from({ length: 4 }, (_, r) => Array.from({ length: 13 }, (_, c) => `<rect x="${7 + c * 13.5}" y="${7 + r * 13}" width="11" height="10" rx="1.5" fill="#4B5263"/>`).join('')).join('')}`);

const CALIPERS = svg(160, 40, `<rect x="4" y="14" width="152" height="10" rx="2" fill="#C2C7D1" stroke="#687082"/>
  ${Array.from({ length: 30 }, (_, i) => `<path d="M${10 + i * 5} 14 v${i % 5 ? 3 : 6}" stroke="#39404F" stroke-width=".7"/>`).join('')}
  <path d="M4 14 L4 38 L14 38 L18 24 Z" fill="#9199A8" stroke="#687082"/><rect x="40" y="6" width="40" height="22" rx="3" fill="#39404F"/><rect x="45" y="10" width="30" height="10" rx="1" fill="#C9E7C2"/>
  <text x="60" y="18" text-anchor="middle" font-size="7" font-family="monospace" fill="#1B1F27">40.02</text><path d="M80 14 L80 38 L90 38 L86 24 Z" fill="#9199A8" stroke="#687082"/>`);

const LAMP = (flip: boolean) => svg(150, 240, `<g ${flip ? 'transform="translate(150 0) scale(-1 1)"' : ''}>
  <defs><radialGradient id="lg${flip ? 'r' : 'l'}" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFF1C9" stop-opacity=".55"/><stop offset="1" stop-color="#FFF1C9" stop-opacity="0"/></radialGradient></defs>
  <path d="M96 78 L150 240 L40 240 Z" fill="url(#lg${flip ? 'r' : 'l'})"/>
  <ellipse cx="34" cy="232" rx="28" ry="7" fill="#2A2F3A"/><rect x="10" y="222" width="48" height="10" rx="3" fill="#39404F"/>
  <path d="M34 224 L52 132 L104 70" stroke="#39404F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="52" cy="132" r="6" fill="#1F6FEB"/><circle cx="104" cy="70" r="5" fill="#1F6FEB"/>
  <path d="M86 58 L124 54 L132 92 L78 96 Z" fill="#1F6FEB" stroke="#0A48AB" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="105" cy="94" rx="27" ry="5" fill="#FFF6DC"/></g>`);

const SPOOL = (color: string) => svg(110, 110, `<circle cx="55" cy="55" r="53" fill="#2A2F3A"/><circle cx="55" cy="55" r="47" fill="${color}"/>
  ${Array.from({ length: 5 }, (_, i) => `<circle cx="55" cy="55" r="${44 - i * 4}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1"/>`).join('')}
  <circle cx="55" cy="55" r="22" fill="#39404F"/><circle cx="55" cy="55" r="9" fill="#1B1F27"/>
  ${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="${55 + 15 * Math.cos(a * Math.PI / 180)}" cy="${55 + 15 * Math.sin(a * Math.PI / 180)}" r="3" fill="#1B1F27"/>`).join('')}`);

const SKETCH_BOARD = svg(320, 220, `<rect width="320" height="220" fill="#F7F9FC"/>
  <g stroke="#D9E6FD" stroke-width="1">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 24} 0 V220"/>`).join('')}${Array.from({ length: 10 }, (_, i) => `<path d="M0 ${i * 24} H320"/>`).join('')}</g>
  <g fill="none" stroke="#39404F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 44 L28 120 Q28 140 48 140 L70 140"/><path d="M28 44 L50 44 L50 110 Q50 120 60 120 L70 120"/><circle cx="39" cy="62" r="5"/>
    <path d="M118 60 Q118 40 140 40 L162 40 Q184 40 184 62 L184 80"/><path d="M118 60 L118 132 L140 132 L140 64 L162 64 L162 80"/><path d="M178 80 L190 80 L184 92 Z"/>
    <path d="M232 52 L286 52 L286 70 L250 70 L250 128 L232 128 Z"/><path d="M244 98 l-22 0 M224 92 l-8 6 l8 6"/>
  </g>
  <g fill="none" stroke="#E0364F" stroke-width="1.6" stroke-linecap="round"><path d="M14 30 L84 154"/><path d="M84 30 L14 154"/></g>
  <circle cx="152" cy="88" r="58" fill="none" stroke="#12A150" stroke-width="1.6" stroke-dasharray="5 4" opacity=".8"/>
  <g font-family="Manrope, sans-serif" font-size="11" fill="#39404F" font-weight="600"><text x="34" y="170">too weak</text><text x="124" y="166">thicker + rib?</text><text x="226" y="150">fits shelf</text></g>
  <g stroke="#0B5AD6" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M100 196 Q150 176 200 192"/><path d="M194 186 L202 193 L192 198"/></g>
  <text x="208" y="200" font-family="Manrope, sans-serif" font-size="11" font-weight="700" fill="#0B5AD6">v3 → print test</text>
  <rect x="250" y="168" width="58" height="44" fill="#FDECCC" transform="rotate(4 279 190)"/><text x="258" y="186" font-family="Manrope, sans-serif" font-size="10" font-weight="700" fill="#8A560A" transform="rotate(4 279 190)">Load:</text><text x="258" y="200" font-family="Manrope, sans-serif" font-size="10" font-weight="700" fill="#8A560A" transform="rotate(4 279 190)">~3 kg</text>
  <g transform="translate(286 26)"><circle r="12" fill="#FEF7EA" stroke="#E8A132" stroke-width="2"/><path d="M-4 12 h8 M-3 16 h6" stroke="#E8A132" stroke-width="2" stroke-linecap="round"/><path d="M-4 2 l4 4 l4 -4" stroke="#E8A132" stroke-width="1.6" fill="none"/></g>`);

const LAPTOP_SCREEN = svg(170, 110, `<rect width="170" height="110" rx="4" fill="#2A2F3A"/><rect x="6" y="6" width="158" height="96" rx="2" fill="#EEF4FF"/>
  <rect x="6" y="6" width="158" height="10" fill="#D9E6FD"/>
  ${[['#FDECCC', 14, 24], ['#C4F1FF', 60, 22], ['#D9E6FD', 108, 26], ['#E9F8EF', 34, 62], ['#FDECEF', 88, 60]].map(([c, x, y]) => `<rect x="${x}" y="${y}" width="40" height="30" rx="2" fill="${c}" stroke="rgba(57,64,79,.25)"/><rect x="${+x + 5}" y="${+y + 7}" width="26" height="3" rx="1" fill="rgba(57,64,79,.45)"/><rect x="${+x + 5}" y="${+y + 14}" width="18" height="3" rx="1" fill="rgba(57,64,79,.3)"/>`).join('')}
  <path d="M54 39 L60 37 M100 37 L108 39 M74 52 L80 60" stroke="#687082" stroke-width="1" stroke-dasharray="2 2"/>`);

const NOTEBOOK = svg(150, 104, `<rect width="150" height="104" rx="3" fill="#FFFFFF" stroke="#C2C7D1"/><path d="M75 2 V102" stroke="#C2C7D1"/>
  <g stroke="#D9E6FD">${Array.from({ length: 8 }, (_, i) => `<path d="M6 ${16 + i * 11} H70 M80 ${16 + i * 11} H144"/>`).join('')}</g>
  <g fill="none" stroke="#39404F" stroke-width="1.3" stroke-linecap="round"><path d="M14 30 h40 v26 h-40 z"/><path d="M14 56 l10 10 h40 l-10 -10"/><path d="M54 30 l10 10 v26"/></g>
  <g font-family="Manrope, sans-serif" font-size="7" fill="#0B5AD6" font-weight="700"><text x="84" y="26">must fit 60 mm</text><text x="84" y="48">screw holes x2</text><text x="84" y="70">outdoor → ASA</text></g>
  <path d="M84 84 l6 6 l12 -12" stroke="#12A150" stroke-width="2" fill="none" stroke-linecap="round"/>`);

const BLUEPRINT_SHEET = svg(130, 96, `<rect width="130" height="96" fill="#0C3A85"/><g stroke="rgba(255,255,255,.18)">${Array.from({ length: 6 }, (_, i) => `<path d="M${i * 24} 0 V96"/>`).join('')}${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${i * 24} H130"/>`).join('')}</g>
  <g fill="none" stroke="#FFFFFF" stroke-width="1.4"><circle cx="44" cy="48" r="26"/><circle cx="44" cy="48" r="8"/><path d="M84 22 h34 v52 h-34 z M84 40 h34"/></g><text x="64" y="90" font-size="7" fill="#45D4FF" font-family="monospace">REV B</text>`);

const CABINET_DOORS = svg(700, 240, `<rect width="700" height="240" fill="#4B5263"/>
  ${[0, 1, 2, 3].map(i => `<rect x="${10 + i * 172}" y="10" width="164" height="220" rx="3" fill="#5B6475" stroke="#39404F" stroke-width="2"/><rect x="${i % 2 ? 22 + i * 172 : 156 + i * 172}" y="96" width="8" height="48" rx="4" fill="#C2C7D1"/>`).join('')}`);
const BOX_LABEL = (c: string) => svg(96, 70, `<rect x="8" y="10" width="80" height="24" rx="2" fill="${c}"/><rect x="8" y="42" width="56" height="6" rx="2" fill="#C2C7D1"/><rect x="8" y="54" width="40" height="6" rx="2" fill="#C2C7D1"/>`);
const FLOOR_TAPE = (w: number, d: number, targets: [number, number][]) => svg(w, d, targets.map(([x, y]) => {
  const sx = w / 2, sy = d - 60, mx = (sx + x) / 2;
  return `<path d="M${sx} ${sy} C ${sx} ${sy - 260}, ${mx} ${y + 380}, ${x} ${y + 150}" fill="none" stroke="#01CBFE" stroke-width="16" stroke-dasharray="70 40" opacity=".55"/>
    <path d="M${x - 40} ${y + 190} L${x} ${y + 120} L${x + 40} ${y + 190}" fill="none" stroke="#01CBFE" stroke-width="16" stroke-linejoin="round" opacity=".7"/>`;
}).join(''));
const MUG = svg(40, 48, `<rect x="2" y="4" width="30" height="42" rx="4" fill="#FFFFFF" stroke="#C2C7D1"/><rect x="2" y="16" width="30" height="8" fill="#1F6FEB"/><path d="M32 14 q10 0 10 10 q0 10 -10 10" fill="none" stroke="#C2C7D1" stroke-width="4"/>`);
const PENCIL_CUP = svg(50, 90, `<path d="M14 6 L16 50 M24 2 L24 50 M34 8 L31 50" stroke-width="4" stroke-linecap="round" fill="none" stroke="#E8A132"/><path d="M24 2 l-2 6 h4 z" fill="#39404F"/><rect x="6" y="46" width="38" height="42" rx="4" fill="#39404F"/><rect x="6" y="46" width="38" height="8" fill="#4B5263"/>`);

const PEGBOARD = svg(980, 380, `<rect width="980" height="380" rx="4" fill="#D8C29A"/><rect width="980" height="380" rx="4" fill="none" stroke="#B49A6C" stroke-width="10"/>
  <g fill="#9C845A">${Array.from({ length: 16 }, (_, r) => Array.from({ length: 41 }, (_, c) => `<circle cx="${18 + c * 23.6}" cy="${16 + r * 23.4}" r="3"/>`).join('')).join('')}</g>
  <g fill="#39404F" stroke="#1B1F27" stroke-width="2" stroke-linejoin="round">
    <path d="M70 60 l20 0 l6 14 l0 200 a12 12 0 0 1 -24 0 l0 -200 z"/>
    <path d="M150 50 l40 0 l-6 40 l-4 190 l-20 0 l-4 -190 z" fill="#E0364F"/>
    <path d="M250 60 l24 0 l0 230 l-24 0 z" fill="#C2C7D1"/><path d="M250 60 m4 20 h16 M254 110 h16 M254 140 h16 M254 170 h16 M254 200 h16 M254 230 h16" stroke="#687082"/>
    <path d="M330 70 q-20 40 -6 90 l14 120 l14 0 l6 -120 q14 -50 -6 -90 z" fill="#1F6FEB"/>
    <path d="M430 60 l40 0 l0 60 l-12 0 l0 170 l-16 0 l0 -170 l-12 0 z" fill="#E8A132"/>
    <path d="M540 70 a30 30 0 1 1 0.1 0 m0 14 a16 16 0 1 0 0.1 0" fill="#9199A8"/><path d="M528 120 l24 0 l-4 160 l-16 0 z" fill="#9199A8"/>
    <path d="M640 64 l10 0 l40 200 l-10 4 z M700 64 l-10 0 l-40 200 l10 4 z" fill="#12A150"/>
    <path d="M780 60 l90 0 l0 30 l-90 0 z M800 90 l0 190 l14 0 l0 -190 z" fill="#4B5263"/>
  </g>
  <g stroke="#9C845A" stroke-width="4" stroke-linecap="round">${[80, 170, 262, 338, 450, 540, 670, 825].map(x => `<path d="M${x} 46 v10"/>`).join('')}</g>`);

const WHITEBOARD = svg(820, 380, `<rect width="820" height="380" rx="6" fill="#ECEEF2"/><rect x="12" y="12" width="796" height="346" rx="3" fill="#FFFFFF"/>
  <rect x="300" y="358" width="220" height="12" rx="3" fill="#C2C7D1"/>
  <g fill="none" stroke="#0B5AD6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M60 80 h120 v70 h-120 z"/><path d="M180 115 h70"/><path d="M240 105 l12 10 l-12 10"/><path d="M262 80 h120 v70 h-120 z"/><path d="M382 115 h70"/><path d="M442 105 l12 10 l-12 10"/><path d="M464 80 h120 v70 h-120 z"/>
  </g>
  <g font-family="Space Grotesk, sans-serif" font-weight="700" font-size="22" fill="#0B5AD6"><text x="78" y="122">IDEA</text><text x="276" y="122">DESIGN</text><text x="484" y="122">PRINT</text></g>
  <g fill="none" stroke="#39404F" stroke-width="2.5" stroke-linecap="round"><path d="M80 230 q40 -50 90 0 t90 0"/><path d="M60 300 h220"/><circle cx="420" cy="260" r="40"/><path d="M420 220 v80 M380 260 h80"/></g>
  <g font-family="Manrope, sans-serif" font-weight="700" font-size="16" fill="#E0364F"><text x="480" y="230">tolerance 0.2 mm</text><text x="480" y="262">PETG for heat</text><text x="480" y="294">infill 15% if load</text></g>
  ${[['#FDECCC', 640, 40, -3], ['#C4F1FF', 700, 120, 4], ['#E9F8EF', 630, 200, -2], ['#FDECEF', 710, 270, 3]].map(([c, x, y, r]) => `<g transform="rotate(${r} ${+x + 40} ${+y + 36})"><rect x="${x}" y="${y}" width="80" height="72" fill="${c}"/><rect x="${+x + 10}" y="${+y + 18}" width="56" height="5" rx="2" fill="rgba(57,64,79,.4)"/><rect x="${+x + 10}" y="${+y + 32}" width="40" height="5" rx="2" fill="rgba(57,64,79,.3)"/></g>`).join('')}`);

const BACK_DRAWINGS = svg(1900, 800, `
  <g fill="none" stroke="#FFFFFF" opacity=".26">
    <circle cx="420" cy="420" r="150" stroke-width="24" stroke-dasharray="20 19.27"/><circle cx="420" cy="420" r="128" stroke-width="2"/><circle cx="420" cy="420" r="46" stroke-width="2"/>
    <path d="M230 420 H610 M420 230 V610" stroke-width="1.5" stroke-dasharray="18 5 3 5"/><path d="M258 590 H582 M258 582 V598 M582 582 V598" stroke-width="1.5"/>
    <path d="M1300 290 H1580 V350 H1370 V540 H1300 Z" stroke-width="2.5" stroke-linejoin="round"/><circle cx="1335" cy="500" r="14" stroke-width="2"/><circle cx="1335" cy="340" r="14" stroke-width="2"/><circle cx="1540" cy="320" r="14" stroke-width="2"/>
    <path d="M1300 260 H1580 M1300 252 V268 M1580 252 V268" stroke-width="1.5"/>
  </g>
  <g fill="#FFFFFF" opacity=".3" font-family="Space Grotesk, sans-serif" font-weight="600" letter-spacing="2"><text x="420" y="618" font-size="16" text-anchor="middle">Ø 300</text><text x="1440" y="248" font-size="16" text-anchor="middle">280</text><text x="1300" y="590" font-size="14">BRACKET · PETG · 40% INFILL</text></g>
  <g transform="translate(620 300)"><rect width="180" height="112" fill="#F7F9FC"/><rect x="8" y="8" width="164" height="70" fill="none" stroke="#39404F" stroke-width="1.5"/><path d="M30 60 l30 -30 l40 20 l40 -26" stroke="#1F6FEB" stroke-width="2" fill="none"/><rect x="8" y="86" width="100" height="6" fill="#C2C7D1"/><rect x="8" y="98" width="70" height="6" fill="#C2C7D1"/><circle cx="90" cy="-2" r="6" fill="#E0364F"/></g>
  <g transform="translate(1690 110)"><rect width="120" height="150" fill="#FFFFFF"/><text x="60" y="34" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="16" fill="#0C3A85">OCT</text><g fill="#C2C7D1">${Array.from({ length: 20 }, (_, i) => `<rect x="${12 + (i % 5) * 20}" y="${48 + Math.floor(i / 5) * 22}" width="14" height="14"/>`).join('')}</g><rect x="72" y="70" width="14" height="14" fill="#01CBFE"/><circle cx="60" cy="-2" r="6" fill="#E8A132"/></g>`);

// ---------------------------------------------------------------- desks
/** Workshop desk: plywood top on a drawer pedestal + steel legs. `side` mirrors the layout. */
function deskFrame(side: 1 | -1, labels: string[]) {
  const pedX = -195 * side, legX = 275 * side;
  return G(at(0, -287, 0), box(600, 26, 300, { front: PLY_EDGE, top: PLY_TOP, side: PLY_EDGE })) +
    G(at(pedX, -137, 0), box(190, 274, 280, { front: CABINET, side: CABINET + shade(.1), frontInner: DRAWERS(labels) })) +
    G(at(legX, -137, 125), box(20, 274, 20, { front: STEEL })) +
    G(at(legX, -137, -125), box(20, 274, 20, { front: STEEL })) +
    G(at(legX, -36, 0), box(20, 20, 230, { front: STEEL })) +
    G(at(85 * side, -205, -140), box(370, 136, 10, { front: 'background:#39404F;' }));
}
/** A flat prop lying on the desk top (y = -300). */
const onTop = (x: number, z: number, w: number, d: number, rz: number, inner: string) =>
  P(w, d, `${at(x, -300.5, z)} rotateX(90deg) rotateZ(${rz}deg)`, '', inner);
/** An upright prop standing on the desk top, facing the front. */
const standing = (x: number, z: number, w: number, h: number, inner: string, ry = 0) =>
  P(w, h, `${at(x, -300 - h / 2, z)}${ry ? ` rotateY(${ry}deg)` : ''}`, '', inner);

function makeDesk() {
  return deskFrame(1, ['M3 BOLTS', 'NOZZLES', 'HEX KEYS']) +
    // monitor: base, neck, screen
    G(at(-40, -304, -80), box(100, 8, 70, { front: 'background:#2A2F3A;' })) +
    G(at(-40, -360, -100), box(16, 104, 12, { front: 'background:#39404F;' })) +
    G(at(-40, -472, -94), box(304, 180, 12, { front: 'background:#1B1F27;', top: 'background:#2A2F3A;', frontInner: `<div style="position:absolute;inset:6px 6px 10px">${CAD_SCREEN}</div>` })) +
    // keyboard + mouse
    G(at(-40, -305, 50), box(190, 10, 64, { front: 'background:#232833;', topInner: KEYBOARD_TOP })) +
    G(at(95, -305, 56), box(28, 10, 42, { front: 'background:#2A2F3A;', top: 'background:radial-gradient(ellipse at 50% 30%,#4B5263,#2A2F3A);' })) +
    // enclosed 3D printer with a spool on top
    G(at(178, -406, -40), box(190, 210, 190, { front: PRINTER, top: 'background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,0) 40%),#1B1F27;', side: PRINTER, frontInner: PRINTER_FRONT })) +
    P(104, 104, at(178, -563, -60), '', SPOOL('#01CBFE')) + // printer top is at y -511
    // calipers, blueprint sheet, printed part, lamp
    onTop(70, 112, 150, 38, -12, CALIPERS) +
    onTop(-205, 70, 130, 96, 8, BLUEPRINT_SHEET) +
    G(at(-180, -318, -40), box(54, 36, 40, { front: 'background:repeating-linear-gradient(0deg,#01CBFE 0 3px,#00ACE0 3px 4px);', top: 'background:#45D4FF;' })) +
    standing(-250, -96, 150, 240, LAMP(false));
}

function solveDesk() {
  return deskFrame(-1, ['SKETCHES', 'SAMPLES', 'CALIPERS']) +
    // drafting board leaning back on a stand
    G(at(-30, -306, -60), box(300, 12, 50, { front: 'background:#39404F;' })) +
    P(330, 230, `${at(-30, -415, -80)} rotateX(22deg)`, 'background:#39404F;padding:5px;box-sizing:border-box;', `<div style="width:100%;height:100%">${SKETCH_BOARD}</div>`) +
    // laptop
    G(at(165, -304, 40), box(170, 8, 118, { front: 'background:#9199A8;', top: 'background:linear-gradient(#C2C7D1,#9199A8);' })) +
    P(170, 110, `${at(165, -358, -18)} rotateX(-12deg)`, '', LAPTOP_SCREEN) +
    // notebook, snapped part + calipers, mug, pencil cup, lamp
    onTop(-170, 100, 150, 104, -8, NOTEBOOK) +
    G(at(40, -311, 110, 20), box(46, 22, 26, { front: 'background:repeating-linear-gradient(0deg,#E8A132 0 3px,#D98B16 3px 4px);', top: 'background:#F4C274;' })) +
    G(at(88, -311, 118, -14), box(36, 22, 26, { front: 'background:repeating-linear-gradient(0deg,#E8A132 0 3px,#D98B16 3px 4px);', top: 'background:#F4C274;' })) +
    onTop(60, 60, 150, 38, 168, CALIPERS) +
    standing(255, 96, 40, 48, MUG) +
    standing(-262, -70, 50, 90, PENCIL_CUP) +
    standing(250, -96, 150, 240, LAMP(true));
}

// ---------------------------------------------------------------- room
const ROOM_W = 1900, ROOM_D = 1500, FRONT = 450, FLOOR = 330, CEIL = -470, H = FLOOR - CEIL;
const DEPTH = ROOM_D + FRONT, MID_Z = (FRONT - ROOM_D) / 2; // the room runs from z = FRONT (behind the camera) to the back wall
export const DESKS = {
  make: { x: -470, z: -560, ry: 25 },
  solve: { x: 470, z: -560, ry: -25 },
} as const;

function room() {
  const wallBase = 'background-color:#0C3A85;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:24px 24px,24px 24px,120px 120px,120px 120px;';
  const sideWall = (x: number, ry: number, art: string) =>
    P(DEPTH, H, `${at(x, (FLOOR + CEIL) / 2, MID_Z)} rotateY(${ry}deg)`, wallBase + shade(.18),
      `<div style="position:absolute;left:0;right:0;bottom:0;height:34px;background:linear-gradient(#0A2E6E,#082656);border-top:2px solid rgba(255,255,255,.2)"></div>${art}`);
  const spools = ['#01CBFE', '#1F6FEB', '#E8A132', '#FFFFFF', '#2A2F3A', '#E0364F', '#12A150', '#8B5CF6'];
  return [
    // floor: epoxy with a printed grid and light pools under the desks
    P(ROOM_W, DEPTH, `${at(0, FLOOR, MID_Z)} rotateX(90deg)`,
      'background:radial-gradient(ellipse 380px 300px at 22% 62%,rgba(255,236,200,.16),rgba(255,236,200,0)),radial-gradient(ellipse 380px 300px at 78% 62%,rgba(255,236,200,.16),rgba(255,236,200,0)),radial-gradient(ellipse 300px 260px at 50% 40%,rgba(1,203,254,.10),rgba(1,203,254,0)),linear-gradient(rgba(255,255,255,.07) 2px,transparent 2px) 0 0/100px 100px,linear-gradient(90deg,rgba(255,255,255,.07) 2px,transparent 2px) 0 0/100px 100px,linear-gradient(#0A2E6E,#0B3270);',
      FLOOR_TAPE(ROOM_W, DEPTH, [[ROOM_W / 2 + DESKS.make.x, DESKS.make.z + ROOM_D], [ROOM_W / 2 + DESKS.solve.x, DESKS.solve.z + ROOM_D]])),
    // ceiling with LED panels
    P(ROOM_W, DEPTH, `${at(0, CEIL, MID_Z)} rotateX(-90deg)`,
      'background:#0A1F47;',
      [480, 950, 1420].map(x => `<div style="position:absolute;left:${x - 50}px;top:120px;width:100px;height:1500px;border-radius:6px;background:linear-gradient(90deg,#DDE9FD,#FFFFFF 50%,#DDE9FD);box-shadow:0 0 40px 12px rgba(221,233,253,.35)"></div>`).join('')),
    // back wall: blueprint grid, drawings, filament shelf
    P(ROOM_W, H, at(0, (FLOOR + CEIL) / 2, -ROOM_D), wallBase,
      `${BACK_DRAWINGS}<div style="position:absolute;left:0;right:0;bottom:0;height:34px;background:linear-gradient(#0A2E6E,#082656);border-top:2px solid rgba(255,255,255,.2)"></div>`),
    // two wall shelves, clear of Mike: filament spools (left), boxed filament (right)
    [-1, 1].map(sx => G(at(sx * 560, -250, -ROOM_D + 46), box(560, 16, 92, { front: 'background:#C2C7D1;', top: 'background:#ECEEF2;' }))).join(''),
    spools.slice(0, 5).map((c, i) => P(92, 92, at(-790 + i * 115, -304, -ROOM_D + 60), '', SPOOL(c))).join(''),
    [['#FFFFFF', 96, 70], ['#ECEEF2', 96, 70], ['#FFFFFF', 96, 70], ['#D9E6FD', 120, 50]].map(([c, w, h], i) =>
      G(at(330 + i * 112, -258 - +h / 2, -ROOM_D + 60), box(+w, +h, 70, { front: `background:${c};`, frontInner: BOX_LABEL(spools[i + 3]) }))).join(''),
    // side walls: pegboard of tools (left), whiteboard + parts shelf (right)
    sideWall(-ROOM_W / 2, 90, `<div style="position:absolute;left:${300 + FRONT}px;top:150px;width:980px;height:380px">${PEGBOARD}</div>`),
    sideWall(ROOM_W / 2, -90, `<div style="position:absolute;left:260px;top:140px;width:820px;height:380px">${WHITEBOARD}</div>`),
    // workbench strip along the left wall
    G(at(-ROOM_W / 2 + 60, 210, -900), box(120, 240, 700, { front: 'background:#4B5263;', top: PLY_TOP, sideInner: CABINET_DOORS })),
  ].join('');
}

/** The full scene markup, except Mike and the desk signs (static in the page, moved in by custom-design.ts). */
export function buildRoom() {
  // Everything is decorative (hidden from screen readers) except the sign slots, which receive the real links.
  const deco = (inner: string) => `<div class="g" aria-hidden="true">${inner}</div>`;
  const d = (k: keyof typeof DESKS, inner: string) => G(at(DESKS[k].x, FLOOR, DESKS[k].z, DESKS[k].ry), deco(inner) + `<div class="g" data-sign-slot="${k}" style="transform:${at(85 * (k === 'make' ? 1 : -1), -168, 154)}"></div>`, ` data-desk="${k}"`);
  return deco(room()) + d('make', makeDesk()) + d('solve', solveDesk());
}
