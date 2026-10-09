// Ambient scene motion, driven by data-anim hooks in the markup (Web Animations API, so it runs
// on the compositor). Timings are the design's. Off when the visitor prefers reduced motion.

const inf = Infinity;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let running: Animation[] = [];

function start() {
  running.forEach(a => a.cancel());
  running = [];
  if (reduce.matches) return;
  const add = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => {
    if (el.animate) running.push(el.animate(kf, o));
  };
  document.querySelectorAll<HTMLElement | SVGElement>('[data-anim]').forEach((el, i) => {
    const t = el.dataset.anim;
    if (t === 'cloud') {
      const dur = +el.dataset.dur! * 1000, from = +el.dataset.start!;
      add(el, [{ transform: 'translateX(-30vw)' }, { transform: 'translateX(125vw)' }],
        { duration: dur, iterations: inf, easing: 'linear', delay: -((from + 30) / 155) * dur });
    } else if (t === 'sway') {
      add(el, [{ transform: 'rotate(-1.4deg)' }, { transform: 'rotate(1.4deg)' }],
        { duration: 4200 + (i % 4) * 900, iterations: inf, direction: 'alternate', easing: 'ease-in-out', delay: -(i * 700) });
    } else if (t === 'spin') {
      add(el, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 18000, iterations: inf, easing: 'linear' }); // an HTML layer, so it runs on the compositor
    } else if (t === 'banner') {
      add(el, [{ transform: 'rotate(-0.3deg) skewX(0.2deg)' }, { transform: 'rotate(0.3deg) skewX(-0.2deg)' }],
        { duration: 5200, iterations: inf, direction: 'alternate', easing: 'ease-in-out' });
    } else if (t === 'wave') {
      add(el, [
        { transform: 'rotate(0deg)', offset: 0 }, { transform: 'rotate(-13deg)', offset: .07 },
        { transform: 'rotate(5deg)', offset: .14 }, { transform: 'rotate(-13deg)', offset: .21 },
        { transform: 'rotate(5deg)', offset: .28 }, { transform: 'rotate(0deg)', offset: .35 },
        { transform: 'rotate(0deg)', offset: 1 },
      ], { duration: 7000, iterations: inf, easing: 'ease-in-out', delay: 500 });
    } else if (t === 'blink') {
      add(el, [
        { transform: 'scaleY(1)', offset: 0 }, { transform: 'scaleY(1)', offset: .95 },
        { transform: 'scaleY(.1)', offset: .975 }, { transform: 'scaleY(1)', offset: 1 },
      ], { duration: 4600, iterations: inf });
    } else if (t === 'bounce') {
      add(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(12px)' }],
        { duration: 650, iterations: inf, direction: 'alternate', easing: 'ease-in-out', delay: -(i * 200) });
    } else if (t === 'sun') {
      add(el, [{ opacity: 0.88 }, { opacity: 1 }], { duration: 9000, iterations: inf, direction: 'alternate', easing: 'ease-in-out' });
    } else if (t === 'light') {
      add(el, [{ opacity: 0 }, { opacity: 0.12 }], { duration: 14000, iterations: inf, direction: 'alternate', easing: 'ease-in-out' });
    }
  });
}

export function startAmbientMotion() {
  start();
  reduce.addEventListener('change', start);
}
