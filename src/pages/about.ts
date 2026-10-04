import '../styles/site.css';
import '../styles/about.css';
import { startAmbientMotion } from '../lib/motion';
import { PRODUCTS } from '../data/products';
import approved from '../data/reviews.json';

type Review = { name: string; product: string; rating: number; comment: string };
const EMAIL = 'mikes3dmodels@gmail.com';
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;

const main = $('main');
const stacks = [...main.querySelectorAll<HTMLElement>('[data-stack]')];
const contact = $('[data-contact]'), compactCard = $('[data-compact-contact]');
const reviewsSec = $('[data-reviews]'), board = $('[data-reviews-board]');
const list = $('[data-list]'), track = $('[data-track]'), thumb = $('[data-thumb]');

const star = (on: boolean, size: number, sw: number) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" style="display:block;"><path d="M12 2.6l2.85 5.9 6.45.9-4.7 4.5 1.15 6.4L12 17.2l-5.75 3.1 1.15-6.4-4.7-4.5 6.45-.9z" fill="${on ? '#E8A132' : 'none'}" stroke="${on ? '#B06F0C' : '#C2C7D1'}" stroke-width="${sw}" stroke-linejoin="round"></path></svg>`;

// ---- Reviews board (approved reviews live in src/data/reviews.json) ----
function renderReviews(reviews: Review[]) {
  list.replaceChildren();
  // An empty role=list is invalid ARIA, so the role only applies once there are reviews.
  if (reviews.length) list.setAttribute('role', 'list'); else list.removeAttribute('role');
  if (!reviews.length) {
    const empty = document.createElement('div');
    empty.className = 'review-empty';
    empty.innerHTML = '<strong>No reviews yet.</strong><span>Bought something from me? You could be the first.</span>';
    list.append(empty);
    return;
  }
  for (const r of reviews) {
    const row = document.createElement('div');
    row.className = 'review';
    row.setAttribute('role', 'listitem');
    row.innerHTML = `<span class="review-who"><strong></strong> — <span></span></span><span class="review-stars" role="img" aria-label="${r.rating} out of 5 stars">${[1, 2, 3, 4, 5].map(n => star(n <= r.rating, 16, 1.6)).join('')}</span><span class="review-text"></span>`;
    row.querySelector('.review-who strong')!.textContent = r.name;
    row.querySelector('.review-who > span')!.textContent = r.product;
    row.querySelector('.review-text')!.textContent = r.comment;
    list.append(row);
  }
}
renderReviews(approved as Review[]);

// ---- Custom scrollbar: shown only when the list overflows ----
const thumbH = () => Math.max(28, list.scrollHeight > 0 ? list.clientHeight ** 2 / list.scrollHeight : 0);
function syncScroll() {
  const span = list.scrollHeight - list.clientHeight;
  track.hidden = span <= 1;
  if (track.hidden) return;
  const th = thumbH();
  thumb.style.height = th + 'px';
  thumb.style.top = (span > 0 ? (list.scrollTop / span) * (list.clientHeight - th) : 0) + 'px';
}
list.addEventListener('scroll', syncScroll, { passive: true });
thumb.addEventListener('pointerdown', e => {
  e.preventDefault(); e.stopPropagation();
  const y0 = e.clientY, s0 = list.scrollTop, k = (list.scrollHeight - list.clientHeight) / Math.max(1, list.clientHeight - thumbH());
  const mv = (ev: PointerEvent) => { list.scrollTop = s0 + (ev.clientY - y0) * k; };
  const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
});
track.addEventListener('pointerdown', e => {
  const r = track.getBoundingClientRect(), t = thumbH();
  list.scrollTo({ top: ((e.clientY - r.top - t / 2) / Math.max(1, list.clientHeight - t)) * (list.scrollHeight - list.clientHeight), behavior: 'smooth' });
});

// ---- Responsive layout (the design's renderVals() maths) ----
let stackB = 0, cH = 200;
const clamp = (a: number, v: number, b: number) => Math.max(a, Math.min(v, b));

function layout() {
  const W = innerWidth, H = innerHeight, narrow = W < 900;
  const legsH0 = Math.min(38, Math.max(22, 0.04 * H)) + 9, nMin = Math.ceil((stackB + 16 + 200 + legsH0) / 0.88);
  const minH = narrow ? Math.max(820, nMin) : 600, mh = Math.max(H, minH);
  const legsH = clamp(22, 0.04 * H, 38) + 9;
  main.style.minHeight = minH + 'px';
  if (!narrow) {
    const fw = Math.min(1520, 0.96 * W), R = W / 2 + fw / 2 - 30, tL = 0.38 * W, tR = 0.98 * W, mid = 0.68 * W, bL = 0.22 * W + 0.11 * H;
    let bw = clamp(250, 0.62 * W - 0.11 * H - 300, 380), rW = clamp(300, 0.27 * W, 460);
    const sW = clamp(220, 0.2 * W, 300);
    let sL = Math.max(tL + 24, (tL + mid) / 2 - sW / 2);
    const ov = sL < bL + bw + 24 && mh * 0.73 - cH < stackB + 16;
    const bw0 = bw;
    let compact = false;
    if (ov) {
      bw = clamp(250, R - bL - sW - rW - 48, bw); sL = bL + bw + 24;
      if (R - (sL + sW + 24) < 280) { compact = true; bw = bw0; }
    }
    const minL = compact ? bL + bw + 24 : sL + sW + 24;
    let rL = Math.max(minL, (mid + tR) / 2 - rW / 2);
    if (rL + rW > R) { rL = Math.max(minL, R - rW); rW = R - rL; }
    const rH = clamp(240, mh * 0.73 - legsH - Math.max(0.12 * mh, 96), 560);
    stacks[0].style.width = bw + 'px';
    compactCard.hidden = !compact;
    contact.hidden = compact;
    Object.assign(contact.style, { left: sL + 'px', width: sW + 'px', transform: 'none' });
    Object.assign(reviewsSec.style, { left: rL + 'px', width: rW + 'px', transform: 'none' });
    board.style.height = rH + 'px';
  } else {
    const rH = clamp(160, mh * 0.88 - legsH - (stackB + 16), 340);
    Object.assign(reviewsSec.style, { left: '65%', width: 'min(300px,62vw)', transform: 'translateX(-50%)' });
    board.style.height = rH + 'px';
  }
}

function measure() {
  let changed = false;
  const st = stacks.find(s => s.offsetParent);
  if (st) {
    const b = Math.round(st.offsetTop + st.offsetHeight);
    if (Math.abs(b - stackB) > 2) { stackB = b; changed = true; }
  }
  if (contact.offsetParent) {
    const h = contact.offsetHeight;
    if (Math.abs(h - cH) > 2) { cH = h; changed = true; }
  }
  return changed;
}

function update() {
  for (let i = 0; i < 5; i++) { layout(); if (!measure()) break; }
  syncScroll();
}
update();
window.addEventListener('resize', update);
new ResizeObserver(update).observe(stacks[0]);
new ResizeObserver(update).observe(stacks[1]);
document.fonts?.ready.then(update);

// ---- Leave a review: emails Mike a pre-filled review to approve ----
const dialog = $<HTMLDialogElement>('[data-dialog]');
const form = $<HTMLFormElement>('[data-form]'), thanks = $('[data-thanks]'), err = $('[data-err]');
const select = $<HTMLSelectElement>('#rv-product'), starsEl = $('[data-stars]'), ratingText = $('[data-rating-text]');
let rating = 0;

for (const name of [...PRODUCTS.map(p => p.name), 'Custom order']) select.add(new Option(name, name));

function renderStars() {
  starsEl.innerHTML = [1, 2, 3, 4, 5].map(n =>
    `<button type="button" class="star-btn" data-n="${n}" aria-label="${n} star${n > 1 ? 's' : ''}" aria-pressed="${n === rating}">${star(n <= rating, 30, 1.5)}</button>`).join('');
  ratingText.textContent = `${rating} of 5`;
}
starsEl.addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('[data-n]');
  if (!b) return;
  const n = +b.dataset.n!;
  rating = rating === n ? 0 : n;
  renderStars();
  starsEl.querySelector<HTMLElement>(`[data-n="${n}"]`)!.focus();
});
renderStars();

const showErr = (m: string) => { err.textContent = m; err.hidden = !m; };
form.addEventListener('input', () => showErr(''));

$('[data-open-form]').addEventListener('click', () => {
  form.hidden = false; thanks.hidden = true; showErr('');
  dialog.showModal();
});
dialog.addEventListener('click', e => {
  if (e.target === dialog || (e.target as Element).closest('[data-close]')) dialog.close();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name')).trim(), product = String(data.get('product')), comment = String(data.get('comment')).trim();
  if (!name || !product || !comment) return showErr('Add your name, the product and a quick comment.');
  const subject = `Review: ${product}${rating ? ` (${rating}/5)` : ''}`;
  const body = `Name: ${name}\nProduct: ${product}\nRating: ${rating} of 5\n\n${comment}\n\n(Sent from the review form on the Mike's Models website.)`;
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  form.reset(); rating = 0; renderStars();
  form.hidden = true; thanks.hidden = false;
});

startAmbientMotion();
