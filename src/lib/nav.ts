// The arrow in the site nav goes back one step: out of an in-page view first (e.g. an open form),
// otherwise to the previous page on this site. With neither, it follows its href (home).
export function initBackNav(beforeBack?: () => boolean) {
  document.querySelectorAll<HTMLAnchorElement>('[data-back]').forEach(a =>
    a.addEventListener('click', e => {
      if (beforeBack?.()) { e.preventDefault(); return; }
      let sameSite = false;
      try { sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch { /* bad referrer */ }
      if (sameSite && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    }));
}
