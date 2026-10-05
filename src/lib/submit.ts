// Sends a form to the Mike's Models mini-server (worker/), which emails it to Mike.
// The endpoint and the spam-check site key are public values, set per build in .env.* files.
const ENDPOINT = (import.meta.env.VITE_FORMS_ENDPOINT as string | undefined)?.replace(/\/$/, '');
const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined;

export const formsConnected = !!ENDPOINT;

export async function sendForm(data: FormData): Promise<void> {
  if (!ENDPOINT) throw new Error('Forms are not connected yet.');
  const res = await fetch(ENDPOINT + '/submit', { method: 'POST', body: data });
  if (!res.ok) {
    let msg = '';
    try { msg = (await res.json()).error; } catch { /* not JSON */ }
    throw new Error(msg || `The server answered ${res.status}.`);
  }
}

// ---- Cloudflare Turnstile (invisible spam check), loaded only when a form is first shown ----
type Turnstile = { render(el: HTMLElement, o: Record<string, unknown>): string; reset(id: string): void; getResponse(id: string): string | undefined };
declare global { interface Window { turnstile?: Turnstile } }
let loading: Promise<void> | null = null;

function loadTurnstile() {
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('spam check failed to load'));
    document.head.append(s);
  });
  return loading;
}

/** Adds the spam check to `slot` (if configured) and returns a getter for its token. */
export async function mountSpamCheck(slot: HTMLElement): Promise<{ token(): string; reset(): void }> {
  if (!TURNSTILE_SITEKEY) return { token: () => '', reset: () => {} };
  await loadTurnstile();
  const id = window.turnstile!.render(slot, { sitekey: TURNSTILE_SITEKEY, appearance: 'interaction-only', theme: 'light' });
  return { token: () => window.turnstile!.getResponse(id) ?? '', reset: () => window.turnstile!.reset(id) };
}
