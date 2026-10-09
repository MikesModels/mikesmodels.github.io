import '../styles/site.css';
import '../styles/gallery.css';
import { CASES, PRODUCTS, coloursOf, swatchFill, photoUrl, type Product } from '../data/products';
import { bayHtml, wallHtml, caseHtml } from './gallery-markup';
import { trackEtsyClick } from '../lib/submit';
import { initBackNav } from '../lib/nav';
import { pageReady } from '../lib/transition';

// Hallway geometry (px of depth). Cases stand in pairs, one bay (760px) apart; with 12 items this is
// the design's CAMS = [0, 400, 1160, 1920, 2680, 3440, 4200, 4580] and an end wall at 5080.
const CASE_ANGLE = 35;
// Cases are filled from PRODUCTS in order; the rest are "Coming soon...".
const N = CASES, PAIRS = Math.ceil(N / 2);
const LAST_PAIR_Z = 700 + 760 * (PAIRS - 1);
const END_Z = LAST_PAIR_Z + 580;
const CAMS = [0, ...Array.from({ length: PAIRS }, (_, k) => 400 + 760 * k), LAST_PAIR_Z + 80];
const pad = (n: number) => (n < 10 ? '0' : '') + n;
const item = (i: number): Product | null => PRODUCTS[i] ?? null;
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

type State = { step: number; hideCam: number; sel: number | null; lastSel: number | null; scale: number; narrow: boolean };
const state: State = { step: 0, hideCam: 0, sel: null, lastSel: null, scale: 1, narrow: false };

const main = $('main'), stage = $('[data-stage]'), world = $('[data-world]'), end = $('[data-end]');
const endShade = $('[data-end-shade]'), focus = $('[data-focus]'), panel = $('[data-panel]');
const fwdBtn = $('[data-fwd]'), backBtn = $('[data-walk-back]');

// ---- Build the hall ----
const bays: { parts: HTMLElement[]; shades: HTMLElement[]; zc: number }[] = [];
for (let i = PAIRS; i >= -1; i--) {
  const zc = -(700 + 760 * i);
  const tpl = document.createElement('template');
  tpl.innerHTML = bayHtml(zc) + wallHtml(`translate3d(-650px,-70px,${zc}px) rotateY(90deg)`) + wallHtml(`translate3d(650px,-70px,${zc}px) rotateY(-90deg)`);
  bays.push({ parts: [...tpl.content.querySelectorAll<HTMLElement>('[data-part]')], shades: [...tpl.content.querySelectorAll<HTMLElement>('[data-shade]')], zc });
  world.insertBefore(tpl.content, end);
}
end.style.transform = `translate3d(0px,-70px,${-END_Z}px)`;
$('[data-p="total"]').textContent = pad(N);

const cases: HTMLElement[] = [];
{
  const tpl = document.createElement('template');
  tpl.innerHTML = Array.from({ length: N }, (_, i) => caseHtml(item(i), i, pad(i + 1), i % 2 === 0, photoUrl(item(i)?.image))).reverse().join('');
  tpl.content.querySelectorAll<HTMLElement>('[data-case]').forEach(el => (cases[+el.dataset.case!] = el));
  world.append(tpl.content);
}

const caseList = $('[data-case-list]');
Array.from({ length: N }, (_, i) => item(i)).forEach((p, i) => {
  const li = document.createElement('li'), b = document.createElement('button');
  b.type = 'button';
  b.textContent = `Case ${pad(i + 1)}: ${p ? `${p.name}, ${p.price}` : 'Coming soon'}`;
  b.addEventListener('click', () => open(i));
  li.append(b);
  caseList.append(li);
});

// ---- Camera ----
function cams(narrow: boolean) {
  if (!narrow) return CAMS.map(z => ({ x: 0, z }));
  return [{ x: 0, z: 0 }, ...Array.from({ length: N }, (_, i) => ({ x: i % 2 === 0 ? -460 : 460, z: 280 + 760 * Math.floor(i / 2) })), { x: 0, z: CAMS[CAMS.length - 1] }];
}
function caseGeo(i: number, narrow: boolean) {
  const ang = narrow ? 12 : CASE_ANGLE, left = i % 2 === 0;
  return { left, x: left ? -460 : 460, z: -(700 + 760 * Math.floor(i / 2)), a: left ? ang : -ang };
}
function view(st: State) {
  const narrow = st.narrow;
  if (st.sel != null) {
    const g = caseGeo(st.sel, narrow), D = narrow ? 720 : 480, sx = narrow ? 0 : -250, sy = narrow ? -170 : 0;
    const vx = sx * D / 1000, vy = -54 + sy * D / 1000, vz = 1000 - D, r = g.a * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r);
    const cx = g.x - (vx * c + vz * sn), cy = -34 - vy, cz = g.z - (-vx * sn + vz * c);
    return { tf: `rotateY(${-g.a}deg) translate3d(${(-cx).toFixed(1)}px,${(-cy).toFixed(1)}px,${(-cz).toFixed(1)}px)`, eq: 1000 - (cz + 1000 * c) };
  }
  const C = cams(narrow), p = C[Math.min(st.step, C.length - 1)];
  return { tf: `rotateY(0deg) translate3d(${-p.x}px,0px,${p.z}px)`, eq: p.z };
}

const shade = (d: number) => (Math.max(0, Math.min(1, (d - 700) / 4400)) * 0.5).toFixed(3);

function render() {
  const { narrow, hideCam: hc, step } = state, v = view(state), cam = v.eq, isOpen = state.sel != null;
  stage.style.transform = `scale(${state.scale})`;
  world.style.transform = v.tf;
  for (const b of bays) {
    const disp = b.zc - 380 + hc > 950 ? 'none' : 'block', sh = shade(-b.zc - cam);
    b.parts.forEach(p => (p.style.display = disp));
    b.shades.forEach(s => (s.style.opacity = sh));
  }
  cases.forEach((el, i) => {
    const g = caseGeo(i, narrow);
    el.style.transform = `translate3d(${g.x}px,330px,${g.z}px) rotateY(${g.a}deg)`;
    el.style.display = g.z + hc > 700 ? 'none' : 'block';
  });
  endShade.style.opacity = shade(END_Z - cam);

  const last = cams(narrow).length - 1;
  backBtn.setAttribute('aria-disabled', String(step === 0));
  fwdBtn.setAttribute('aria-disabled', String(step === last));
  main.classList.toggle('is-narrow', narrow);
  main.classList.toggle('is-open', isOpen);
  const fx = 800 + (narrow ? 0 : -250), fy = 396 + (narrow ? -170 : 0), rx = narrow ? 300 : 420, ry = narrow ? 380 : 540;
  focus.style.background = `radial-gradient(ellipse ${rx}px ${ry}px at ${fx}px ${fy}px,rgba(7,9,14,0) 50%,rgba(7,9,14,.4) 100%)`; // close-up darkening (halved from .8)
  panel.setAttribute('aria-hidden', String(!isOpen));
  panel.inert = !isOpen;
}

// ---- Close-up menu ----
const shop = $('[data-shop]'), soon = $('[data-soon]'), swatches = $('[data-swatches]'), colourName = $('[data-colour-name]');
const etsy = $<HTMLAnchorElement>('[data-etsy]'), mailto = $<HTMLAnchorElement>('[data-p-mailto]');

function fillPanel(i: number) {
  const p = item(i);
  const set = (k: string, v: string) => ($(`[data-p="${k}"]`).textContent = v);
  set('num', pad(i + 1));
  set('name', p ? p.name : 'Coming soon...');
  set('desc', p ? p.desc : 'Description: TBD');
  set('price', p ? p.price : 'TBD');
  set('origin', p?.origin ?? '');
  $('[data-p-origin]').hidden = !p?.origin;
  shop.hidden = !p; soon.hidden = !!p;
  mailto.href = 'mailto:mikes3dmodels@gmail.com?subject=' + encodeURIComponent(p ? `Question about the ${p.name}` : `Gallery case ${pad(i + 1)}`);
  panel.scrollTop = 0;
  if (!p) return;

  etsy.href = p.etsy;
  const cs = coloursOf(p);
  $('[data-colours]').hidden = !cs.length;
  colourName.textContent = '';
  swatches.innerHTML = cs.map(c => `<li class="g-swatch-opt" title="${c.name}" data-name="${c.name}"><span class="g-swatch" style="background:${swatchFill(c)}"></span><span class="sr-only">${c.name}${c.hex.length > 1 ? ' (mixed)' : ''}</span></li>`).join('');
}
// Hovering a swatch shows its name, Amazon-style (display only; colours are picked on Etsy).
swatches.addEventListener('mouseover', e => {
  const n = (e.target as Element).closest<HTMLElement>('[data-name]')?.dataset.name;
  if (n) colourName.textContent = `: ${n}`;
});
swatches.addEventListener('mouseleave', () => (colourName.textContent = ''));
// Count the click (product + case only), then let the link open Etsy as normal.
etsy.addEventListener('click', () => {
  const p = item(state.sel ?? -1);
  if (p) trackEtsyClick(p.name, pad(state.sel! + 1));
});

let settle = 0;
function move(patch: Partial<State>) {
  const from = view(state).eq, to = view({ ...state, ...patch }).eq;
  clearTimeout(settle);
  Object.assign(state, patch, { hideCam: Math.min(from, to) });
  render();
  settle = window.setTimeout(() => { state.hideCam = view(state).eq; render(); }, 1200);
}
function go(step: number) {
  step = Math.max(0, Math.min(cams(state.narrow).length - 1, step));
  if (step === state.step || state.sel != null) return;
  move({ step });
}
let returnFocus: HTMLElement | null = null;
function open(i: number) {
  if (state.sel === i) return;
  returnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
  fillPanel(i);
  move({ sel: i, lastSel: i, step: state.narrow ? i + 1 : Math.floor(i / 2) + 1 });
  // Focus the panel once it has faded in, so keyboard users land on its actions.
  setTimeout(() => {
    if (state.sel !== i) return;
    (item(i) ? etsy : soon.querySelector<HTMLElement>('a')!).focus({ preventScroll: true });
  }, 720);
}
function close() {
  if (state.sel == null) return;
  move({ sel: null });
  returnFocus?.focus({ preventScroll: true });
  returnFocus = null;
}

// ---- Input ----
world.addEventListener('click', e => {
  const c = (e.target as Element).closest<HTMLElement>('[data-case]');
  if (c) { e.stopPropagation(); open(+c.dataset.case!); }
});
focus.addEventListener('click', close);
panel.querySelector('[data-close]')!.addEventListener('click', close);
fwdBtn.addEventListener('click', () => go(state.step + 1));
backBtn.addEventListener('click', () => go(state.step - 1));

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.sel != null) return close();
  if (state.sel != null) return;
  if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(state.step + 1); }
  else if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(state.step - 1); }
});

let acc = 0, lock = 0, accT = 0;
window.addEventListener('wheel', e => {
  if (state.sel != null) return;
  e.preventDefault();
  const now = Date.now();
  if (now < lock) { acc = 0; return; }
  acc += e.deltaY;
  clearTimeout(accT); accT = window.setTimeout(() => { acc = 0; }, 220);
  if (Math.abs(acc) >= 40) { go(state.step + (acc < 0 ? 1 : -1)); acc = 0; lock = now + 850; }
}, { passive: false });

// Touch: swipe up walks forward, swipe down steps back.
let touchY: number | null = null;
main.addEventListener('touchstart', e => {
  touchY = state.sel == null && !(e.target as Element).closest('button, a, [data-panel]') ? e.touches[0].clientY : null;
}, { passive: true });
main.addEventListener('touchend', e => {
  if (touchY == null) return;
  const dy = e.changedTouches[0].clientY - touchY;
  touchY = null;
  if (Math.abs(dy) >= 40) go(state.step + (dy < 0 ? 1 : -1));
}, { passive: true });

function onResize() {
  const W = innerWidth, H = innerHeight, narrow = W < 700 && W < H;
  state.scale = Math.max(W / 1600, H / 900);
  if (narrow !== state.narrow) Object.assign(state, { narrow, step: 0, hideCam: 0, sel: null });
  render();
}
window.addEventListener('resize', onResize);
onResize();
pageReady();
initBackNav(() => { if (state.sel != null) { close(); return true; } return false; });
