import '../styles/site.css';
import '../styles/custom-request.css';

// Placeholder until the real multi-step request form exists: copy + mailto subject follow ?type=make|solve.
const COPY = {
  make: {
    eyebrow: 'Custom design · Make it',
    title: "Let's make it.",
    body: "You know what you want. I'll need the details: what it is, rough size, colour and how many. Sketches, photos and STL files all help.",
    subject: 'Custom design: make it',
  },
  solve: {
    eyebrow: 'Custom design · Solve it',
    title: "Let's build your solution together.",
    body: "Tell me what's broken, missing or in the way. I'll sketch a few ideas and we'll pick the one that works.",
    subject: 'Custom design: help me solve a problem',
  },
};

const type = new URLSearchParams(location.search).get('type') === 'solve' ? 'solve' : 'make';
const c = COPY[type];
document.querySelector<HTMLElement>('main')!.dataset.type = type;
document.querySelectorAll<HTMLElement>('[data-copy]').forEach(el => (el.textContent = c[el.dataset.copy as 'eyebrow' | 'title' | 'body']));
document.querySelector<HTMLAnchorElement>('[data-mailto]')!.href = 'mailto:mikes3dmodels@gmail.com?subject=' + encodeURIComponent(c.subject);
