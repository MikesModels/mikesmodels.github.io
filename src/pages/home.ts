import '../styles/site.css';
import '../styles/home.css';
import { startAmbientMotion } from '../lib/motion';
import { pageReady } from '../lib/transition';

const MSGS: Record<string, [string, string]> = {
  default: ["Welcome to Mike's Models!", "From fun toys and gadgets to DIY and engineering projects, I'm here to help! Select a sign to continue."],
  custom: ['Got an idea?', 'If you know exactly what you want or need help figuring it out, this is the place for you.'],
  gallery: ['Have a browse.', "Flexi dragons, keychains, gadgets — everything I've printed lately."],
  about: ["That's me.", 'Who I am, how I work, and the quickest way to reach me.'],
};

const main = document.querySelector<HTMLElement>('main')!;
const bubble = main.querySelector<HTMLElement>('[data-bubble]')!;
const svg = main.querySelector<SVGSVGElement>('[data-mike] svg')!;
const frame = main.querySelector<HTMLElement>('[data-frame]')!;
const tailFill = bubble.querySelector('[data-tail-fill]')!;
const tailLine = bubble.querySelector('[data-tail-line]')!;

// ---- Bubble copy reacts to the signs ----
let msg = 'default';
const setText = (key: string) => {
  const [title, body] = MSGS[key] || MSGS.default;
  main.querySelectorAll('[data-msg-title]').forEach(e => (e.textContent = title));
  main.querySelectorAll('[data-msg-body]').forEach(e => (e.textContent = body));
};
function say(key: string) {
  if (key === msg) return;
  msg = key;
  setText(key);
  fit(); // same spot: only the height changes, growing upward from a fixed bottom edge
}
main.querySelectorAll<HTMLAnchorElement>('a[data-key]').forEach(a => {
  const enter = () => say(a.dataset.key!);
  const leave = () => say('default');
  a.addEventListener('mouseenter', enter);
  a.addEventListener('focus', enter);
  a.addEventListener('mouseleave', leave);
  a.addEventListener('blur', leave);
});

// ---- Bubble placement ----
// One consistent spot: to the left of Mike's head (there's open sky there at every desktop size), sized for the
// longest (welcome) message. Hover messages keep the same left, width and bottom edge, so the bubble never jumps.
type Box = { l: number; t: number; r: number; b: number };
let anchor: { x: number; bottom: number; w: number; side: 'left' | 'right' } | null = null;

function geometry() {
  const M = main.getBoundingClientRect(), R = svg.getBoundingClientRect(), s = R.width / 420;
  return { M, R, s };
}

function placeBubble() {
  if (!bubble.offsetParent) return; // hidden on narrow screens
  if (msg !== 'default') setText('default'); // always size the spot for the welcome message
  const { M, R, s } = geometry(), F = frame.getBoundingClientRect();
  const box = (l: number, t: number, r: number, bt: number): Box => ({ l: R.left + l * s, t: R.top + t * s, r: R.left + r * s, b: R.top + bt * s });
  const head = box(112, 76, 248, 212), arm = box(312, 148, 384, 330), body = box(70, 236, 286, 440);
  const pad = 10;
  const obst: Box[] = [head, arm, body, ...[...main.querySelectorAll('[data-obst]')]
    .map(e => e.getBoundingClientRect()).filter(r => r.width)
    .map(r => ({ l: r.left - pad, t: r.top - pad, r: r.right + pad + 6, b: r.bottom + pad + 6 }))];
  const limF = { l: F.left + 24, r: F.right - 24, t: M.top + 10, b: M.bottom - 10 };
  const limM = { l: M.left + 12, r: M.right - 12, t: M.top + 10, b: M.bottom - 10 };
  const mouthY = R.top + 186 * s;
  const ov = (a: Box, o: Box) => Math.max(0, Math.min(a.r, o.r) - Math.max(a.l, o.l)) * Math.max(0, Math.min(a.b, o.b) - Math.max(a.t, o.t));
  const prevW = bubble.style.width;
  type Best = { score: number; x: number; y: number; w: number; o: number };
  const search = (side: 'left' | 'right', lim: Box, dxs: number[]) => {
    let best: Best | null = null;
    for (const [wi, w] of [210, 190, 175].entries()) {
      bubble.style.width = w + 'px';
      const h = bubble.offsetHeight;
      for (const dx of dxs) {
        const x = side === 'right' ? Math.max(head.r, arm.r) + 14 + dx : head.l - 14 - w - dx;
        if (x < lim.l || x + w > lim.r) continue;
        const ideal = mouthY - h * 0.6;
        for (let k = 0; k <= 80; k++) {
          const off = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 6, y = ideal + off;
          if (y < lim.t || y + h > lim.b || y > head.b + 60 || y + h < head.t + 10) continue;
          const o = obst.reduce((a, q) => a + ov({ l: x, r: x + w, t: y, b: y + h }, q), 0);
          const score = o * 10 + Math.abs(off) + wi * 25 + dx * 0.8;
          if (!best || score < best.score) best = { score, x, y, w, o };
          if (o === 0) break;
        }
      }
    }
    return best;
  };
  // Left of Mike inside the booth; then left, allowed out into the sky; right side only as a last resort.
  let side: 'left' | 'right' = 'left';
  let b = search('left', limF, [0, 20, 40]);
  if (!b || b.o > 0) b = search('left', limM, [0, 20, 40, 80]);
  if (!b || b.o > 0) { const r = search('right', limM, [0, 30, 60, 100]); if (r && (!b || r.o < b.o)) { b = r; side = 'right'; } }
  bubble.style.width = prevW;
  if (msg !== 'default') setText(msg);
  if (!b) return;
  bubble.style.width = b.w + 'px';
  anchor = { x: Math.round(b.x - M.left), bottom: Math.round(b.y - M.top + bubble.offsetHeight), w: b.w, side };
  fit();
  bubble.classList.add('is-placed');
}

/** Apply the anchor for the current message: same left, width and bottom edge; then aim the tail at Mike's mouth. */
function fit() {
  if (!anchor || !bubble.offsetParent) return;
  const { M, R, s } = geometry();
  bubble.style.width = anchor.w + 'px';
  const h = bubble.offsetHeight, top = anchor.bottom - h, right = anchor.side === 'right';
  Object.assign(bubble.style, { left: anchor.x + 'px', top: top + 'px' });
  const bx = anchor.x + M.left, by = top + M.top;
  const tx = Math.round(R.left + (right ? 246 : 114) * s - bx - 2), ty = Math.round(R.top + 128 * s - by - 2);
  const bc = Math.min(Math.max(ty, 22), Math.max(22, Math.min(60, h - 30))), e = right ? -2 : anchor.w - 2, ei = right ? e + 3 : e - 3;
  const y1 = bc - 11, y2 = bc + 11;
  tailFill.setAttribute('points', `${ei},${y1 - 1} ${tx},${ty} ${ei},${y2 + 1}`);
  tailLine.setAttribute('d', `M${e + 1} ${y1} L${tx} ${ty} L${e + 1} ${y2}`);
}

let raf = 0, timer = 0;
function place() {
  cancelAnimationFrame(raf); clearTimeout(timer);
  const run = () => { cancelAnimationFrame(raf); clearTimeout(timer); placeBubble(); };
  raf = requestAnimationFrame(run);
  timer = window.setTimeout(run, 80);
}

// Back/forward cache restores the page as it was left: mid-hover on the sign that was clicked. Reset the bubble.
addEventListener('pageshow', e => { if (e.persisted) say('default'); });
window.addEventListener('resize', place);
const ro = new ResizeObserver(place);
ro.observe(main);
main.querySelectorAll('[data-obst]').forEach(e => ro.observe(e));
document.fonts?.ready.then(place);
placeBubble();

startAmbientMotion();
pageReady();
