// Page transitions: a quick fade to black when following a link to another page on the site, and a fade back in
// once the next page has finished setting itself up (scene built, bubble placed, fonts loaded), so visitors never
// see a half-built page. The arriving page's black cover comes from the inline script in partials/head.html.
const root = document.documentElement;
const OUT_MS = 180;

/** Fade to black, then run `go` (navigate). */
export function fadeOut(go: () => void) {
  try { sessionStorage.setItem('mm-fade', '1'); } catch { /* storage blocked: the next page just won't fade in */ }
  root.classList.remove('mm-cover', 'mm-ready');
  root.classList.add('mm-leaving');
  setTimeout(go, OUT_MS);
}

/** Call once the page has laid itself out: lifts the black cover after fonts settle (never waits more than 600ms). */
export function pageReady() {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fonts, new Promise(r => setTimeout(r, 600))]).then(() =>
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('mm-ready'))));
}

// Same-site links fade out first. Links that open elsewhere, new tabs, downloads and in-page links are left alone,
// as are clicks a page already handled itself (e.g. the desk placards that open a form).
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.('a');
  if (!a || !a.href || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search) return;
  e.preventDefault();
  fadeOut(() => location.assign(url.href));
});

// Any way of leaving (back button, reload) marks the next page to fade in.
addEventListener('pagehide', () => { try { sessionStorage.setItem('mm-fade', '1'); } catch { /* ignore */ } });
// Coming back via the back/forward cache: the page is restored mid-fade, so fade it in again.
addEventListener('pageshow', e => {
  if (!e.persisted) return;
  root.classList.remove('mm-leaving', 'mm-ready');
  root.classList.add('mm-cover');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('mm-ready')));
});
