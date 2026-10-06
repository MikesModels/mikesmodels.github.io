// The Custom Design workshop, built as a CSS 3D scene like the gallery: world units are px, y points down,
// the floor is at y = 330, the camera sits at the origin looking down -z (perspective 1000px).
// Desks are boxes with illustrated faces; small props are flat "billboard" planes facing the camera.

import MARBLE from '../assets/img/marble-white.webp';
import CARPET from '../assets/img/carpet-pile.webp';

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
const MUG = svg(40, 48, `<rect x="2" y="4" width="30" height="42" rx="4" fill="#FFFFFF" stroke="#C2C7D1"/><rect x="2" y="16" width="30" height="8" fill="#1F6FEB"/><path d="M32 14 q10 0 10 10 q0 10 -10 10" fill="none" stroke="#C2C7D1" stroke-width="4"/>`);
const PENCIL_CUP = svg(50, 90, `<path d="M14 6 L16 50 M24 2 L24 50 M34 8 L31 50" stroke-width="4" stroke-linecap="round" fill="none" stroke="#E8A132"/><path d="M24 2 l-2 6 h4 z" fill="#39404F"/><rect x="6" y="46" width="38" height="42" rx="4" fill="#39404F"/><rect x="6" y="46" width="38" height="8" fill="#4B5263"/>`);

const PEGBOARD = svg(980, 380, `<defs>
    <linearGradient id="pgSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A93A3"/><stop offset=".45" stop-color="#E7EBF0"/><stop offset=".6" stop-color="#C2C7D1"/><stop offset="1" stop-color="#7C8596"/></linearGradient>
    <linearGradient id="pgSteelV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A93A3"/><stop offset=".45" stop-color="#E7EBF0"/><stop offset="1" stop-color="#7C8596"/></linearGradient>
    <linearGradient id="pgWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9C6B3A"/><stop offset=".5" stop-color="#D3A167"/><stop offset="1" stop-color="#8F5F31"/></linearGradient>
    <linearGradient id="pgBoard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCC7A0"/><stop offset="1" stop-color="#CDB68C"/></linearGradient>
  </defs>
  <rect width="980" height="380" fill="url(#pgBoard)"/>
  <g fill="#8F7A55" opacity=".75">${Array.from({ length: 15 }, (_, r) => Array.from({ length: 41 }, (_, c) => `<circle cx="${18 + c * 23.6}" cy="${18 + r * 24}" r="3"/>`).join('')).join('')}</g>
  <rect width="980" height="380" fill="none" stroke="#A88C5E" stroke-width="12"/>
  <g stroke="#5B6475" stroke-width="5" stroke-linecap="round" fill="none">${[60, 150, 175, 200, 300, 335, 370, 455, 540, 620, 718, 800, 880, 935].map(x => `<path d="M${x} 30 v14 q0 6 6 6"/>`).join('')}</g>
  <!-- claw hammer -->
  <g transform="translate(60 52)"><rect x="-7" y="22" width="14" height="190" rx="6" fill="url(#pgWood)" stroke="#5E3F1F" stroke-width="2"/><path d="M-8 150 h16 M-8 162 h16" stroke="#5E3F1F" stroke-width="2" opacity=".5"/>
    <path d="M-34 4 H22 Q30 4 30 12 V26 Q30 30 26 30 H-6 Q-12 30 -12 24 Z" fill="url(#pgSteelV)" stroke="#39404F" stroke-width="2"/><path d="M22 6 Q48 -4 54 22 Q42 12 30 16" fill="url(#pgSteel)" stroke="#39404F" stroke-width="2"/></g>
  <!-- screwdriver set -->
  ${[['#E0364F', 150, 160], ['#E8A132', 175, 175], ['#1F6FEB', 200, 150]].map(([c, x, l]) => `<g transform="translate(${x} 56)"><rect x="-9" y="0" width="18" height="70" rx="7" fill="${c}" stroke="#1B1F27" stroke-width="2"/><path d="M-4 8 v54 M0 8 v54 M4 8 v54" stroke="rgba(255,255,255,.35)" stroke-width="2"/><rect x="-6" y="68" width="12" height="8" fill="#39404F"/><rect x="-3" y="76" width="6" height="${l}" fill="url(#pgSteel)" stroke="#5B6475" stroke-width="1"/><path d="M-3 ${76 + +l} L3 ${76 + +l} L1 ${86 + +l} L-1 ${86 + +l} Z" fill="#7C8596"/></g>`).join('')}
  <!-- combination wrenches -->
  ${[[300, 170, 13], [335, 200, 15], [370, 230, 17]].map(([x, l, r]) => `<g transform="translate(${x} 50)"><path d="M-6 ${r} L6 ${r} L5 ${l - r} L-5 ${l - r} Z" fill="url(#pgSteel)" stroke="#39404F" stroke-width="1.6"/><circle cy="${r - 2}" r="${r}" fill="url(#pgSteel)" stroke="#39404F" stroke-width="1.6"/><circle cy="${r - 2}" r="${r * 0.48}" fill="#CDB68C" stroke="#39404F" stroke-width="1.4"/><path d="M${-r} ${l - 2} a${r} ${r} 0 1 0 ${2 * r} 0 l${-r * 0.45} ${-r * 0.2} v${r * 0.9} h${-r * 1.1} v${-r * 0.9} Z" fill="url(#pgSteel)" stroke="#39404F" stroke-width="1.6"/></g>`).join('')}
  <!-- pliers (blue grips) and flush cutters (green grips) -->
  ${[[455, '#1F6FEB', 0], [540, '#12A150', 1]].map(([x, c, cut]) => `<g transform="translate(${x} 52)"><path d="M-10 4 Q-14 30 -6 52 L6 52 Q14 30 10 4 Z" fill="url(#pgSteel)" stroke="#39404F" stroke-width="2"/>${cut ? '<path d="M-2 6 L0 40 L2 6" stroke="#39404F" stroke-width="1.5" fill="none"/>' : '<path d="M-6 14 h12 M-7 22 h14 M-7 30 h14" stroke="#5B6475" stroke-width="1.4"/>'}<circle cy="58" r="7" fill="#9199A8" stroke="#39404F" stroke-width="2"/><path d="M-6 62 Q-22 120 -26 196 Q-16 202 -10 196 Q-8 130 2 64 Z" fill="${c}" stroke="#1B1F27" stroke-width="2"/><path d="M6 62 Q22 120 26 196 Q16 202 10 196 Q8 130 -2 64 Z" fill="${c}" stroke="#1B1F27" stroke-width="2"/><path d="M-20 140 Q-18 170 -18 190 M20 140 Q18 170 18 190" stroke="rgba(255,255,255,.35)" stroke-width="3" fill="none"/></g>`).join('')}
  <!-- digital calipers -->
  <g transform="translate(620 50)"><rect x="-7" y="0" width="14" height="250" rx="2" fill="url(#pgSteel)" stroke="#39404F" stroke-width="1.6"/>${Array.from({ length: 40 }, (_, i) => `<path d="M-7 ${20 + i * 5.5} h${i % 5 ? 4 : 7}" stroke="#39404F" stroke-width=".8"/>`).join('')}
    <path d="M-7 0 H-40 V12 L-14 22 V30 H-7 Z" fill="url(#pgSteelV)" stroke="#39404F" stroke-width="1.6"/><rect x="-20" y="70" width="40" height="64" rx="5" fill="#2A2F3A" stroke="#1B1F27" stroke-width="2"/><rect x="-14" y="78" width="28" height="18" rx="2" fill="#C9E7C2"/><text x="0" y="91" text-anchor="middle" font-size="9" font-family="monospace" fill="#1B1F27">25.40</text><circle cx="-7" cy="112" r="5" fill="#E0364F"/><circle cx="7" cy="112" r="5" fill="#9199A8"/>
    <path d="M-7 134 H-34 V146 L-12 154 V162 H-7 Z" fill="url(#pgSteelV)" stroke="#39404F" stroke-width="1.6"/></g>
  <!-- tape measure -->
  <g transform="translate(718 96)"><rect x="-38" y="-38" width="76" height="76" rx="18" fill="#F4C274" stroke="#8A560A" stroke-width="2.5"/><circle r="22" fill="#E8A132" stroke="#8A560A" stroke-width="2"/><circle r="7" fill="#39404F"/><rect x="34" y="16" width="34" height="10" fill="#FDECCC" stroke="#8A560A" stroke-width="1.5"/><path d="M42 16 v4 M48 16 v6 M54 16 v4 M60 16 v6" stroke="#8A560A" stroke-width="1"/><rect x="-38" y="28" width="76" height="10" rx="3" fill="#39404F"/></g>
  <!-- hex key set -->
  <g transform="translate(800 56)">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-28 + i * 11} 0 V${120 + i * 14} q0 6 6 6 H${-8 + i * 11}" stroke="url(#pgSteel)" stroke-width="${3 + i * 0.6}" fill="none" stroke-linecap="round"/>`).join('')}<rect x="-34" y="18" width="70" height="26" rx="4" fill="#E0364F" stroke="#1B1F27" stroke-width="2"/></g>
  <!-- print-removal spatula and utility knife -->
  <g transform="translate(880 50)"><rect x="-9" y="0" width="18" height="96" rx="6" fill="#1F6FEB" stroke="#1B1F27" stroke-width="2"/><path d="M-12 96 H12 L18 190 Q0 200 -18 190 Z" fill="url(#pgSteel)" stroke="#39404F" stroke-width="2"/></g>
  <g transform="translate(935 54)"><path d="M-10 0 H10 L12 120 H-12 Z" fill="#E8A132" stroke="#1B1F27" stroke-width="2"/><rect x="-12" y="30" width="24" height="14" fill="#39404F"/><path d="M-6 120 L6 120 L10 150 L-8 142 Z" fill="url(#pgSteel)" stroke="#39404F" stroke-width="1.6"/></g>`);

const WHITEBOARD = svg(820, 380, `<rect width="820" height="380" rx="6" fill="#ECEEF2"/><rect x="12" y="12" width="796" height="346" rx="3" fill="#FFFFFF"/>
  <rect x="300" y="358" width="220" height="12" rx="3" fill="#C2C7D1"/>
  <g fill="none" stroke="#0B5AD6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M60 80 h120 v70 h-120 z"/><path d="M180 115 h70"/><path d="M240 105 l12 10 l-12 10"/><path d="M262 80 h120 v70 h-120 z"/><path d="M382 115 h70"/><path d="M442 105 l12 10 l-12 10"/><path d="M464 80 h120 v70 h-120 z"/>
  </g>
  <g font-family="Space Grotesk, sans-serif" font-weight="700" font-size="22" fill="#0B5AD6"><text x="78" y="122">IDEA</text><text x="276" y="122">DESIGN</text><text x="484" y="122">PRINT</text></g>
  <g fill="none" stroke="#39404F" stroke-width="2.5" stroke-linecap="round"><path d="M80 230 q40 -50 90 0 t90 0"/><path d="M60 300 h220"/><circle cx="420" cy="260" r="40"/><path d="M420 220 v80 M380 260 h80"/></g>
  <g font-family="Manrope, sans-serif" font-weight="700" font-size="16" fill="#E0364F"><text x="480" y="230">tolerance 0.2 mm</text><text x="480" y="262">PETG for heat</text><text x="480" y="294">infill 15% if load</text></g>
  ${[['#FDECCC', 640, 40, -3], ['#C4F1FF', 700, 120, 4], ['#E9F8EF', 630, 200, -2], ['#FDECEF', 710, 270, 3]].map(([c, x, y, r]) => `<g transform="rotate(${r} ${+x + 40} ${+y + 36})"><rect x="${x}" y="${y}" width="80" height="72" fill="${c}"/><rect x="${+x + 10}" y="${+y + 18}" width="56" height="5" rx="2" fill="rgba(57,64,79,.4)"/><rect x="${+x + 10}" y="${+y + 32}" width="40" height="5" rx="2" fill="rgba(57,64,79,.3)"/></g>`).join('')}`);

// ---------------------------------------------------------------- desks
/** Workshop desk: plywood top on a drawer pedestal + steel legs. `side` mirrors the layout. */
function deskFrame(side: 1 | -1, labels: string[]) {
  const pedX = -195 * side, legX = 275 * side;
  // soft contact shadow on the floor under the desk
  return P(720, 420, `${at(0, -1, 0)} rotateX(90deg)`, 'background:radial-gradient(closest-side,rgba(7,9,14,.5),rgba(7,9,14,.18) 70%,rgba(7,9,14,0));') +
    G(at(0, -287, 0), box(600, 26, 300, { front: PLY_EDGE, top: PLY_TOP, side: PLY_EDGE })) +
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

// ---------------------------------------------------------------- studio dressing (matches the gallery's finishes)
const bpGrid = (w: number, h: number) => `<g stroke="rgba(255,255,255,.10)">${Array.from({ length: Math.floor(w / 20) }, (_, i) => `<path d="M${i * 20} 0 V${h}"/>`).join('')}${Array.from({ length: Math.floor(h / 20) }, (_, i) => `<path d="M0 ${i * 20} H${w}"/>`).join('')}</g><g stroke="rgba(255,255,255,.2)">${Array.from({ length: Math.floor(w / 100) + 1 }, (_, i) => `<path d="M${i * 100} 0 V${h}"/>`).join('')}${Array.from({ length: Math.floor(h / 100) + 1 }, (_, i) => `<path d="M0 ${i * 100} H${w}"/>`).join('')}</g>`;
const titleBlock = (l1: string, l2: string) => `<g transform="translate(262 246)"><rect width="128" height="46" fill="#0C3A85" stroke="#FFFFFF" stroke-width="1.5"/><path d="M0 22 H128" stroke="#FFFFFF" stroke-width="1"/><text x="8" y="15" font-family="Space Grotesk, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="1">${l1}</text><text x="8" y="37" font-family="Space Grotesk, sans-serif" font-size="9" font-weight="600" fill="#45D4FF" letter-spacing="1">${l2}</text></g>`;
const GEAR_PRINT = svg(400, 300, `<rect width="400" height="300" fill="#0C3A85"/>${bpGrid(400, 300)}
  <g fill="none" stroke="#FFFFFF">
    <circle cx="150" cy="140" r="100" stroke-width="16" stroke-dasharray="13.1 13.1" opacity=".9"/><circle cx="150" cy="140" r="86" stroke-width="1.6"/><circle cx="150" cy="140" r="30" stroke-width="1.6"/><rect x="143" y="104" width="14" height="8" stroke-width="1.4"/>
    <path d="M30 140 H270 M150 20 V260" stroke-width="1" stroke-dasharray="12 4 2 4" opacity=".8"/>
    <path d="M50 270 H250 M50 264 V276 M250 264 V276" stroke-width="1.2"/>
  </g>
  <text x="150" y="266" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="600" fill="#FFFFFF" letter-spacing="1">Ø 60</text>
  ${titleBlock('SPUR GEAR · 24T', 'PLA · SCALE 2:1')}`);
const BRACKET_PRINT = svg(400, 300, `<rect width="400" height="300" fill="#0C3A85"/>${bpGrid(400, 300)}
  <g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round">
    <path d="M70 60 H300 V105 H125 V240 H70 Z"/><circle cx="97" cy="210" r="11"/><circle cx="97" cy="95" r="11"/><circle cx="270" cy="82" r="11"/>
    <path d="M125 105 L170 105 L125 150" stroke-width="1.6"/>
  </g>
  <g fill="none" stroke="#FFFFFF" stroke-width="1.2"><path d="M70 40 H300 M70 34 V46 M300 34 V46"/><path d="M320 60 V105 M314 60 H326 M314 105 H326"/><path d="M50 60 V240 M44 240 H56"/></g>
  <g font-family="Space Grotesk, sans-serif" font-size="11" font-weight="600" fill="#FFFFFF" letter-spacing="1"><text x="185" y="32" text-anchor="middle">120</text><text x="330" y="86">25</text><text x="18" y="154">100</text></g>
  ${titleBlock('SHELF BRACKET', 'PETG · 40% INFILL')}`);
const FILAMENT_RACK = svg(240, 430, `<rect width="240" height="430" fill="#39404F"/><rect x="8" y="8" width="224" height="414" fill="#2A2F3A"/>
  ${[0, 1, 2].map(r => `<rect x="8" y="${136 + r * 136}" width="224" height="10" fill="#9199A8"/>` +
    ['#01CBFE', '#1F6FEB', '#E8A132', '#FFFFFF', '#E0364F', '#12A150', '#8B5CF6', '#F4C274', '#ECEEF2'].slice(r * 3, r * 3 + 3)
      .map((c, i) => `<g transform="translate(${46 + i * 74} ${86 + r * 136})"><circle r="34" fill="#1B1F27"/><circle r="30" fill="${c}"/><circle r="26" fill="none" stroke="rgba(255,255,255,.14)"/><circle r="13" fill="#39404F"/><circle r="5" fill="#1B1F27"/></g>`).join('')).join('')}
  <rect x="8" y="8" width="224" height="414" fill="none" stroke="#4B5263" stroke-width="4"/>`);
const PLANT = svg(170, 330, `<path d="M85 210 C60 150 40 120 14 112 C34 150 52 190 80 216 Z" fill="#4F9A63" stroke="#2E5E3E" stroke-width="2"/>
  <path d="M85 210 C110 150 130 120 156 112 C136 150 118 190 90 216 Z" fill="#3F8455" stroke="#2E5E3E" stroke-width="2"/>
  <path d="M85 212 C70 140 66 80 84 20 C102 80 100 140 88 212 Z" fill="#5CA86F" stroke="#2E5E3E" stroke-width="2"/>
  <path d="M84 214 C58 176 34 166 8 172 C34 192 58 206 82 218 Z" fill="#6FAE80" stroke="#2E5E3E" stroke-width="2"/>
  <path d="M86 214 C112 176 136 166 162 172 C136 192 112 206 88 218 Z" fill="#4F9A63" stroke="#2E5E3E" stroke-width="2"/>
  <path d="M84 216 C76 160 50 70 40 52 C62 90 80 160 88 214 Z" fill="#7CB88C" stroke="#2E5E3E" stroke-width="2"/>
  <path d="M86 216 C96 160 120 82 132 62 C114 100 96 160 90 214 Z" fill="#5E9E70" stroke="#2E5E3E" stroke-width="2"/>
  <path d="M38 214 H132 L122 326 H48 Z" fill="#ECEEF2" stroke="#39404F" stroke-width="3" stroke-linejoin="round"/>
  ${Array.from({ length: 14 }, (_, i) => `<path d="M${39 + i * 0.7} ${222 + i * 7.4} H${131 - i * 0.7}" stroke="#C2C7D1" stroke-width="1"/>`).join('')}
  <path d="M34 206 H136 V220 H34 Z" fill="#01CBFE" stroke="#39404F" stroke-width="3" stroke-linejoin="round"/>`);
// Finished prints for the wall shelves either side of Mike (each drawn with layer lines, like real FDM prints).
const LAYERS = (x: number, y: number, w: number, h: number, c = 'rgba(0,0,0,.13)') => Array.from({ length: Math.floor(h / 3) }, (_, i) => `<path d="M${x} ${y + i * 3} h${w}" stroke="${c}" stroke-width=".8"/>`).join('');
const PRINT = {
  benchy: svg(110, 70, `<path d="M4 44 L104 44 L92 64 L16 64 Z" fill="#E8A132" stroke="#8A560A" stroke-width="2.5"/><path d="M14 44 L26 18 L72 18 L72 44 Z" fill="#F4C274" stroke="#8A560A" stroke-width="2.5"/><rect x="34" y="24" width="12" height="11" rx="2" fill="#8A560A"/><rect x="52" y="24" width="12" height="11" rx="2" fill="#8A560A"/><path d="M68 18 V2 H84 V44" fill="#F4C274" stroke="#8A560A" stroke-width="2.5"/>${LAYERS(8, 20, 92, 44)}`),
  vase: svg(64, 110, `<path d="M8 108 Q-2 60 18 28 Q24 16 20 4 H44 Q40 16 46 28 Q66 60 56 108 Z" fill="#01CBFE" stroke="#006B90" stroke-width="2.5"/>${Array.from({ length: 34 }, (_, i) => `<path d="M${10 + Math.sin(i / 3) * 3} ${8 + i * 3} q22 ${i % 2 ? 2 : -2} 44 0" stroke="rgba(0,0,0,.14)" stroke-width=".8" fill="none"/>`).join('')}`),
  gears: svg(120, 90, [[42, 48, 32, '#1F6FEB', 0], [92, 60, 20, '#45D4FF', 15]].map(([cx, cy, r, c, rot]) => `<g transform="translate(${cx} ${cy})">${Array.from({ length: 12 }, (_, i) => `<rect x="-4.5" y="${-(+r) - 8}" width="9" height="11" rx="1" fill="${c}" stroke="#0A48AB" stroke-width="1.2" transform="rotate(${i * 30 + +rot})"/>`).join('')}<circle r="${r}" fill="${c}" stroke="#0A48AB" stroke-width="2.5"/><circle r="${+r * 0.32}" fill="#ECEEF2" stroke="#0A48AB" stroke-width="2"/></g>`).join('')),
  planter: svg(80, 100, `<path d="M40 44 C32 18 14 8 4 12 C16 26 28 38 38 46 Z M40 44 C48 18 66 6 76 10 C64 26 52 38 42 46 Z M40 44 C36 22 38 4 44 -4 C50 12 48 30 42 46 Z" fill="#4F9A63" stroke="#2E5E3E" stroke-width="1.8"/><path d="M8 44 H72 L64 98 H16 Z" fill="#FFFFFF" stroke="#39404F" stroke-width="2.5"/>${LAYERS(10, 47, 60, 50)}<path d="M8 44 H72" stroke="#01CBFE" stroke-width="6"/>`),
  dragon: svg(130, 70, `<path d="M8 62 Q2 34 30 30 Q56 26 66 42 Q76 56 98 48 Q114 42 118 26" stroke="#C026D3" stroke-width="16" fill="none" stroke-linecap="round"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${12 + i * 10} ${56 - Math.sin(i / 1.7) * 16} l5 -11 l5 11" fill="#E879F9" stroke="#86198F" stroke-width="1"/>`).join('')}<path d="M112 32 L128 18 L124 36 Z" fill="#C026D3" stroke="#86198F" stroke-width="1.5"/><circle cx="121" cy="27" r="2.4" fill="#1B1F27"/>`),
  stand: svg(80, 90, `<path d="M4 88 H76 L66 74 H26 L48 4 H34 L8 74 Z" fill="#2A2F3A" stroke="#1B1F27" stroke-width="2.5"/>${LAYERS(6, 6, 68, 80, 'rgba(255,255,255,.07)')}<rect x="38" y="6" width="30" height="54" rx="5" fill="#1B1F27" stroke="#39404F" stroke-width="2" transform="rotate(18 53 33)"/><rect x="42" y="12" width="22" height="40" rx="2" fill="#0B5AD6" transform="rotate(18 53 33)"/>`),
};
const PENDANT = svg(120, 70, `<path d="M58 0 H62 V18 H58 Z" fill="#1B1F27"/><path d="M20 58 Q22 22 60 18 Q98 22 100 58 Z" fill="#1B1F27" stroke="#39404F" stroke-width="2"/>
  <path d="M28 50 Q34 28 60 25" stroke="rgba(255,255,255,.18)" stroke-width="3" fill="none"/><ellipse cx="60" cy="58" rx="40" ry="7" fill="#FFF6DC"/>`);

// Gallery wall finishes: crown moulding, wall-wash lights, chair rail, navy wainscot with brass trim, baseboard.
const WALL_BG = 'background:repeating-linear-gradient(45deg,rgba(57,64,79,.04) 0 1px,rgba(57,64,79,0) 1px 22px),repeating-linear-gradient(-45deg,rgba(57,64,79,.04) 0 1px,rgba(57,64,79,0) 1px 22px),radial-gradient(circle,rgba(57,64,79,.06) 0 2px,rgba(57,64,79,0) 3px) 0 0/31.1px 31.1px,#C4CBD6;';
const PANEL = '<div style="flex:1;background:linear-gradient(rgba(255,255,255,.05),rgba(0,0,0,.12)),#0F3470;box-shadow:inset 2px 2px 0 rgba(255,255,255,.16),inset -2px -2px 0 rgba(0,0,0,.4),0 0 0 7px #0C2A5A,0 0 0 8px rgba(232,161,50,.6);"></div>';
function wallDressing(w: number, washes: number[], panels: number, art: string) {
  return `<div style="position:absolute;left:0;right:0;top:46px;height:90px;background:linear-gradient(rgba(14,18,26,.26),rgba(14,18,26,0));"></div>
    ${washes.map(x => `<div style="position:absolute;left:${x - 160}px;top:46px;width:320px;height:540px;background:radial-gradient(ellipse 20% 16% at 50% 0%,rgba(255,252,240,.95),rgba(255,252,240,0)),radial-gradient(ellipse 50% 100% at 50% 0%,rgba(255,243,220,.85) 0%,rgba(255,238,205,.5) 36%,rgba(255,236,200,.18) 60%,rgba(255,236,200,0) 76%);"></div>`).join('')}
    ${art}
    <div style="position:absolute;left:0;right:0;top:0;height:46px;background:repeating-linear-gradient(90deg,#F4F6F9 0 10px,#9AA1AD 10px 12px,#D5DAE2 12px 18px) 0 30px/100% 10px no-repeat,linear-gradient(180deg,#9AA1AD 0 5px,#F7F8FA 5px 13px,#C2C7D1 13px 17px,#FFFFFF 17px 24px,#DCDFE6 24px 30px,#DCDFE6 40px);border-bottom:2px solid #687082;box-shadow:0 4px 8px rgba(0,0,0,.24);"></div>
    <div style="position:absolute;left:0;right:0;top:556px;height:16px;background:linear-gradient(#FFFFFF 0 3px,#DCDFE6 3px 9px,#9AA1AD 9px 11px,#ECEEF2 11px 14px,#687082 14px);box-shadow:0 5px 6px rgba(0,0,0,.3);z-index:1;"></div>
    <div style="position:absolute;left:0;right:0;top:572px;bottom:40px;background:linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,0) 30px),#0E2F66;display:flex;gap:28px;padding:28px ${Math.round(w * 0.03)}px 26px;box-sizing:border-box;">${PANEL.repeat(panels)}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:40px;background:linear-gradient(rgba(232,161,50,.6) 0 1px,#39404F 1px 3px,#1B2536 3px 36px,#0E1320 36px);"></div>`;
}
/** A framed print with a brass picture light, placed on a wall at (x, y). */
const framed = (x: number, y: number, w: number, h: number, art: string) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;padding:12px;box-sizing:border-box;background:linear-gradient(135deg,#39404F,#1B1F27);box-shadow:0 14px 22px rgba(14,18,26,.35),inset 0 0 0 2px #4B5263;">
    <div style="width:100%;height:100%;padding:14px;box-sizing:border-box;background:#F7F8FA;box-shadow:inset 0 2px 5px rgba(0,0,0,.2);">${art}</div></div>
   <div style="position:absolute;left:${x + w / 2 - 80}px;top:${y - 30}px;width:160px;height:14px;border-radius:7px;background:linear-gradient(#F0D49A,#B08A4A);box-shadow:0 10px 28px 8px rgba(255,236,200,.5);"></div>`;
const PILASTER = (side: 'left' | 'right') => `<div style="position:absolute;${side}:0;top:46px;bottom:40px;width:40px;background:repeating-linear-gradient(90deg,rgba(40,46,58,.16) 0 2px,rgba(40,46,58,0) 2px 8px),linear-gradient(90deg,rgba(0,0,0,.1),rgba(255,255,255,.14) 50%,rgba(0,0,0,.14)),url(${MARBLE}) 0 0/260px 260px;box-shadow:${side === 'left' ? '' : '-'}7px 0 9px rgba(14,18,26,.26);z-index:2;"></div>`;

// ---------------------------------------------------------------- room
const ROOM_W = 1900, ROOM_D = 1500, FRONT = 450, FLOOR = 330, CEIL = -470, H = FLOOR - CEIL;
const DEPTH = ROOM_D + FRONT, MID_Z = (FRONT - ROOM_D) / 2; // the room runs from z = FRONT (behind the camera) to the back wall
export const DESKS = {
  make: { x: -560, z: -400, ry: 25 },
  solve: { x: 560, z: -400, ry: -25 },
} as const;

function room() {
  const sideWall = (x: number, ry: number, washes: number[], art: string) =>
    P(DEPTH, H, `${at(x, (FLOOR + CEIL) / 2, MID_Z)} rotateY(${ry}deg)`, WALL_BG + shade(.14), wallDressing(DEPTH, washes, 5, art));
  // Ceiling element: top edge = front (z = FRONT), bottom edge = back wall. Floor element: top edge = back wall.
  const ceilY = (z: number) => FRONT - z, floorY = (z: number) => z + ROOM_D, ex = (x: number) => x + ROOM_W / 2;
  const downlight = (x: number, y: number) => `<div style="position:absolute;left:${x - 13}px;top:${y - 13}px;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#FFFDF4 0 45%,#FFE7B8 60%,#9AA1AD 64% 78%,#39404F 80%);box-shadow:0 0 26px 10px rgba(255,236,200,.38);"></div>`;
  const coffers = Array.from({ length: 6 }, (_, c) => Array.from({ length: 6 }, (_, r) =>
    `<div style="position:absolute;left:${30 + c * 310}px;top:${40 + r * 318}px;width:290px;height:296px;background:linear-gradient(90deg,#1B1F27,#262B35);box-shadow:inset 0 0 0 8px #343A47,inset 0 0 0 9px #151920,inset 0 0 0 17px #2B303B,inset 0 0 0 18px #151920,inset 0 0 34px rgba(0,0,0,.55);"></div>`).join('')).join('');
  const pendant = (x: number, z: number) =>
    P(3, 160, at(x, -390, z), 'background:#1B1F27;') +
    P(120, 70, at(x, -280, z), '', PENDANT) +
    P(300, 290, at(x, -100, z), 'background:linear-gradient(rgba(255,240,205,.13),rgba(255,240,205,0));clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);');
  return [
    // floor: polished concrete with soft light pools, and a navy rug (the gallery's carpet) under the work area
    P(ROOM_W, DEPTH, `${at(0, FLOOR, MID_Z)} rotateX(90deg)`,
      'background:radial-gradient(ellipse 380px 300px at 25% 50%,rgba(255,236,200,.22),rgba(255,236,200,0)),radial-gradient(ellipse 380px 300px at 75% 50%,rgba(255,236,200,.22),rgba(255,236,200,0)),radial-gradient(ellipse 700px 500px at 30% 70%,rgba(255,255,255,.05),rgba(255,255,255,0)),radial-gradient(ellipse 600px 420px at 75% 30%,rgba(0,0,0,.08),rgba(0,0,0,0)),linear-gradient(90deg,rgba(255,255,255,.06) 2px,transparent 2px) 0 0/475px 100%,linear-gradient(rgba(255,255,255,.06) 2px,transparent 2px) 0 0/100% 390px,linear-gradient(#59616F,#6B7383);box-shadow:inset 0 70px 60px -20px rgba(7,9,14,.45),inset 80px 0 70px -30px rgba(7,9,14,.4),inset -80px 0 70px -30px rgba(7,9,14,.4);',
      `<div style="position:absolute;left:${ex(-720)}px;width:1440px;top:${floorY(-1060)}px;height:1300px;box-sizing:border-box;border:30px solid #0E2F66;background:url(${CARPET}) 0 0/152px 152px,radial-gradient(circle,rgba(1,203,254,.3) 0 2.5px,rgba(1,203,254,0) 3.5px) 0 0/40px 40px,repeating-linear-gradient(45deg,rgba(255,255,255,.07) 0 1.5px,rgba(255,255,255,0) 1.5px 28.28px),repeating-linear-gradient(-45deg,rgba(255,255,255,.07) 0 1.5px,rgba(255,255,255,0) 1.5px 28.28px),#0A48AB;box-shadow:inset 0 0 0 3px rgba(232,161,50,.75),inset 0 0 0 10px #0C3A85,inset 0 0 0 12px rgba(1,203,254,.7),0 0 10px 4px rgba(0,0,0,.35);"></div>`),
    // ceiling: coffers, a laylight over Mike, recessed downlights
    P(ROOM_W, DEPTH, `${at(0, CEIL, MID_Z)} rotateX(-90deg)`, 'background:#262B35;',
      coffers +
      `<div style="position:absolute;left:${ex(-180)}px;top:${ceilY(-760)}px;width:360px;height:520px;box-sizing:border-box;border:10px solid #1B1F27;background:repeating-linear-gradient(90deg,rgba(150,128,90,.4) 0 2px,rgba(150,128,90,0) 2px 56.7px),repeating-linear-gradient(0deg,rgba(150,128,90,.4) 0 2px,rgba(150,128,90,0) 2px 56.7px),radial-gradient(ellipse at 50% 50%,#FFFBF0,#FFEACB);box-shadow:0 0 0 3px #4B5263,0 0 80px 26px rgba(255,236,200,.26);"></div>` +
      [[-470, -260], [470, -260], [-470, -900], [470, -900], [0, -300], [-760, -1250], [760, -1250]].map(([x, z]) => downlight(ex(x), ceilY(z))).join('') +
      '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.4),rgba(0,0,0,0) 6%,rgba(0,0,0,0) 94%,rgba(0,0,0,.4));"></div>'),
    // back wall: two framed blueprints (clear of Mike), marble pilasters
    P(ROOM_W, H, at(0, (FLOOR + CEIL) / 2, -ROOM_D), WALL_BG,
      wallDressing(ROOM_W, [ex(-690), ex(-340), ex(340), ex(690)], 4,
        framed(ex(-690) - 175, 140, 350, 270, GEAR_PRINT) + framed(ex(690) - 175, 140, 350, 270, BRACKET_PRINT) + PILASTER('left') + PILASTER('right'))),
    // side walls: framed pegboard of tools (left), whiteboard (right)
    sideWall(-ROOM_W / 2, 90, [FRONT + 520, FRONT + 1060],
      `<div style="position:absolute;left:${300 + FRONT}px;top:110px;width:980px;height:380px;box-shadow:0 12px 20px rgba(14,18,26,.3)">${PEGBOARD}</div>`),
    sideWall(ROOM_W / 2, -90, [440, 900],
      `<div style="position:absolute;left:260px;top:110px;width:820px;height:380px;box-shadow:0 12px 20px rgba(14,18,26,.3)">${WHITEBOARD}</div>`),
    // storage cabinet along the left wall, filament rack and plants in the corners
    G(at(-ROOM_W / 2 + 60, 210, -900), box(120, 240, 700, { front: 'background:#4B5263;', top: PLY_TOP, sideInner: CABINET_DOORS })),
    G(at(-790, FLOOR - 215, -1430), box(240, 430, 90, { front: 'background:#39404F;', top: 'background:#2A2F3A;', frontInner: FILAMENT_RACK })),
    // floating shelves of finished prints either side of Mike
    [[-340, -270, [['benchy', 154, 98, -90], ['vase', 73, 126, 78]]], [-340, -80, [['gears', 157, 118, -64], ['planter', 90, 112, 92]]],
     [340, -270, [['dragon', 174, 92, -34], ['stand', 90, 101, 110]]], [340, -80, [['planter', 90, 112, -100], ['benchy', 140, 90, 54]]]]
      .map(([x, y, items]) => G(at(+x, +y, -ROOM_D + 38), box(360, 14, 72, { front: PLY_EDGE, top: PLY_TOP })) +
        (items as [keyof typeof PRINT, number, number, number][]).map(([k, w, h, dx]) => P(w, h, at(+x + dx, +y - 7 - h / 2, -ROOM_D + 44), 'filter:drop-shadow(0 6px 4px rgba(14,18,26,.25));', PRINT[k])).join('')).join(''),
    P(330, 170, `${at(-790, FLOOR - 1, -1400)} rotateX(90deg)`, 'background:radial-gradient(closest-side,rgba(7,9,14,.45),rgba(7,9,14,0));'),
    P(260, 820, `${at(-ROOM_W / 2 + 70, FLOOR - 1, -900)} rotateX(90deg)`, 'background:radial-gradient(closest-side,rgba(7,9,14,.4),rgba(7,9,14,0));'),
    P(150, 291, at(-835, FLOOR - 146, -260), '', PLANT),
    P(150, 291, at(835, FLOOR - 146, -260), '', PLANT),
    // pendant lamps over the desks
    pendant(DESKS.make.x, DESKS.make.z), pendant(DESKS.solve.x, DESKS.solve.z),
  ].join('');
}

/** The full scene markup, except Mike and the desk signs (static in the page, moved in by custom-design.ts). */
export function buildRoom() {
  // Everything is decorative (hidden from screen readers) except the sign slots, which receive the real links.
  const deco = (inner: string) => `<div class="g" aria-hidden="true">${inner}</div>`;
  const d = (k: keyof typeof DESKS, inner: string) => G(at(DESKS[k].x, FLOOR, DESKS[k].z, DESKS[k].ry), deco(inner) + `<div class="g" data-sign-slot="${k}" style="transform:${at(85 * (k === 'make' ? 1 : -1), -168, 154)}"></div>`, ` data-desk="${k}"`);
  return deco(room()) + d('make', makeDesk()) + d('solve', solveDesk());
}
