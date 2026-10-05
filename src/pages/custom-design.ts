import '../styles/site.css';
import '../styles/forms.css';
import '../styles/custom-design.css';
import { startAmbientMotion } from '../lib/motion';
import { initBackNav } from '../lib/nav';
import { mountForm } from '../lib/forms';
import { MAKE, SOLVE } from '../data/form-specs';
import { buildRoom, DESKS } from './design-room';

type Key = 'make' | 'solve';
const MSGS: Record<string, [string, string]> = {
  default: ['Two ways to start.', "Pick the desk that fits. Either way, I'll take it from here."],
  make: ['Bring the details.', 'What it is, rough size, colour and how many. Sketches, photos and STL files all help.'],
  solve: ["Let's figure it out.", "Tell me what's broken, missing or in the way. I'll sketch a few ideas and we'll pick the one that works."],
};
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;

const main = $('[data-main]'), stage = $('[data-stage]'), world = $('[data-world]');
const bubble = $('[data-bubble]'), choices = $('[data-choices]');
world.insertAdjacentHTML('afterbegin', buildRoom());

// ---- forms ----
const forms = {
  make: mountForm($('[data-form="make"]'), MAKE),
  solve: mountForm($('[data-form="solve"]'), SOLVE),
};
const panels = { make: $('[data-panel="make"]'), solve: $('[data-panel="solve"]') };

// ---- layout: stage scale, where the signs live, Mike's bubble ----
let narrow = false, placed: boolean | null = null, scale = 1, open: Key | null = null;
const signs = { make: $('[data-sign="make"]'), solve: $('[data-sign="solve"]') };

function layout() {
  const W = innerWidth, H = innerHeight;
  scale = Math.max(W / 1600, H / 900);
  stage.style.transform = `scale(${scale})`;
  const n = W < 760;
  if (n !== placed) {
    narrow = placed = n;
    for (const k of ['make', 'solve'] as Key[]) {
      const slot = world.querySelector<HTMLElement>(`[data-sign-slot="${k}"]`)!;
      (narrow ? choices : slot).append(signs[k]);
      signs[k].classList.toggle('in-scene', !narrow);
    }
    main.classList.toggle('is-narrow', narrow);
  }
  placeBubble();
}

/** World point → viewport px, for the overview camera. */
function project(x: number, y: number, z: number) {
  const f = 1000 / (1000 - z);
  const sx = 800 + x * f, sy = 396 + (450 + y - 396) * f;
  return { x: innerWidth / 2 + (sx - 800) * scale, y: innerHeight / 2 + (sy - 450) * scale };
}
function placeBubble() {
  const head = project(0, -330, -950);
  bubble.style.left = head.x + 'px';
  bubble.style.bottom = Math.max(innerHeight - head.y + 10, 0) + 'px';
}

// ---- hover messages ----
function say(key: string) { const [t, b] = MSGS[key]; $('[data-msg-title]').textContent = t; $('[data-msg-body]').textContent = b; }
document.querySelectorAll<HTMLElement>('[data-open]').forEach(a => {
  const enter = () => say(a.dataset.open!), leave = () => say('default');
  a.addEventListener('mouseenter', enter); a.addEventListener('focus', enter);
  a.addEventListener('mouseleave', leave); a.addEventListener('blur', leave);
});

// ---- camera ----
function view(k: Key | null) {
  if (!k) return 'rotateY(0deg) translate3d(0px,0px,0px)';
  const d = DESKS[k], a = d.ry * Math.PI / 180;
  // Face the desk square-on from in front of it, then slide sideways so the desk sits beside the form.
  const D = narrow ? 1000 : 720, shift = narrow ? 0 : (k === 'make' ? 290 : -290);
  const cx = d.x + Math.sin(a) * D + Math.cos(a) * shift, cz = d.z + Math.cos(a) * D - Math.sin(a) * shift, cy = -20;
  return `rotateY(${-d.ry}deg) translate3d(${(-cx).toFixed(1)}px,${-cy}px,${(-cz).toFixed(1)}px)`;
}

// ---- open / close (history-aware so the browser back button closes a form) ----
let returnFocus: HTMLElement | null = null;
function setOpen(k: Key | null) {
  if (k === open) return;
  if (k && !open) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  open = k;
  world.style.transform = view(k);
  main.classList.toggle('is-open', !!k);
  main.dataset.open = k ?? '';
  for (const key of ['make', 'solve'] as Key[]) {
    const on = key === k;
    panels[key].inert = !on;
    panels[key].classList.toggle('is-shown', on);
  }
  if (k) {
    // Let the camera move first, then hand focus to the form.
    setTimeout(() => { if (open === k) forms[k].shown(); }, 560);
  } else {
    returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
  }
}
const formFromUrl = (): Key | null => { const f = new URLSearchParams(location.search).get('form'); return f === 'make' || f === 'solve' ? f : null; };

function openForm(k: Key) {
  if (open === k) return;
  history.pushState({ inPage: true, form: k }, '', `?form=${k}`);
  setOpen(k);
}
function closeForm() {
  if (!open) return;
  if (history.state?.inPage) history.back();
  else { history.replaceState(null, '', location.pathname); setOpen(null); }
}
addEventListener('popstate', () => setOpen(formFromUrl()));

document.querySelectorAll<HTMLElement>('[data-open]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openForm(a.dataset.open as Key); }));
world.querySelectorAll<HTMLElement>('[data-desk]').forEach(d => d.addEventListener('click', () => openForm(d.dataset.desk as Key)));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeForm));
$('[data-dim]').addEventListener('click', closeForm);
addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeForm(); });
initBackNav(() => { if (open) { closeForm(); return true; } return false; });

addEventListener('resize', layout);
document.fonts?.ready.then(placeBubble);
layout();
setOpen(formFromUrl());
startAmbientMotion();
