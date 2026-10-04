import '../styles/site.css';
import '../styles/custom-design.css';
import { startAmbientMotion } from '../lib/motion';

const MSGS: Record<string, [string, string]> = {
  default: ['Two ways to start.', "Pick the desk that fits. Either way, I'll take it from here."],
  make: ['Bring the details.', 'What it is, rough size, colour and how many. Sketches, photos and STL files all help.'],
  solve: ["Let's figure it out.", "Tell me what's broken, missing or in the way. I'll sketch a few ideas and we'll pick the one that works."],
};

const title = document.querySelector('[data-msg-title]')!;
const body = document.querySelector('[data-msg-body]')!;
const say = (key: string) => { [title.textContent, body.textContent] = MSGS[key]; };

document.querySelectorAll<HTMLAnchorElement>('a[data-key]').forEach(a => {
  const enter = () => say(a.dataset.key!);
  const leave = () => say('default');
  a.addEventListener('mouseenter', enter);
  a.addEventListener('focus', enter);
  a.addEventListener('mouseleave', leave);
  a.addEventListener('blur', leave);
});

startAmbientMotion();
