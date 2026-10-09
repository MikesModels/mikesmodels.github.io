// Mike's Models forms mini-server (Cloudflare Worker).
//   POST /submit   — a form from the site → checked → emailed to Mike (via Resend), photos attached.
//   GET  /approve  — from the "Approve & publish" button in a review email: shows a confirmation page.
//   POST /approve  — publishes the review: adds it to src/data/reviews.json in the site repo, which redeploys the site.
// The approve link is signed, and publishing needs a button press on the page, so email link-scanners can't approve.
//   POST /click    — the gallery's "Buy on Etsy" button: logs product + time (nothing about the visitor)
//                    and emails Mike straight away (subject "Etsy click: …", for his Gmail filter).
//   GET  /clicks   — Mike's private click log (signed link, in every click email).

export interface Env {
  TO_EMAIL: string;
  FROM_EMAIL: string;
  SITE_ORIGINS: string; // comma-separated origins allowed to submit
  SITE_URL: string;
  GITHUB_REPO: string;
  REVIEWS_PATH: string;
  RESEND_API_KEY?: string;
  APPROVE_SECRET?: string;
  GITHUB_TOKEN?: string;
  TURNSTILE_SECRET?: string;
  DEV_MODE?: string; // "1" locally: no email is sent; GET /dev/last shows what would have been
  TIME_ZONE: string; // Mike's time zone for click times, e.g. America/New_York
  CLICKS: KVNamespace; // Etsy click log: key c:<ISO time>:<random>, metadata { p: product, c: case }
}

type FormType = 'make' | 'solve' | 'review';
type Answer = { name: string; label: string; value: string };
type Review = { id: string; name: string; product: string; rating: number; comment: string; date: string };

// Same required fields as src/data/form-specs.ts — never trust the browser alone.
const REQUIRED: Record<FormType, string[]> = {
  make: ['name', 'email', 'title', 'description'],
  solve: ['name', 'email', 'problem', 'purpose', 'use'],
  review: ['name', 'email', 'product', 'rating', 'comment'],
};
const FILE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|pdf|stl|3mf|step|stp|obj)$/i;
const MAX_FILES = 6, MAX_EACH = 8 * 1024 * 1024, MAX_TOTAL = 20 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let devOutbox: unknown[] = [];
const devReviews: Review[] = [];

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const cors = corsHeaders(req, env);
    try {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (url.pathname === '/submit' && req.method === 'POST') {
        if (!cors['Access-Control-Allow-Origin']) return json({ error: 'Not allowed from this site.' }, 403, cors);
        return await submit(req, env, url, cors);
      }
      if (url.pathname === '/click' && req.method === 'POST') return await logClick(req, env, cors, ctx);
      if (url.pathname === '/clicks' && req.method === 'GET') return await clicksPage(url, env);
      if (url.pathname === '/approve' && req.method === 'GET') return await approvePage(url, env);
      if (url.pathname === '/approve' && req.method === 'POST') return await approve(req, env);
      if (url.pathname === '/dev/last' && env.DEV_MODE === '1') return json({ outbox: devOutbox, reviews: devReviews }, 200, {});
      if (url.pathname === '/') return new Response("Mike's Models forms server is running.", { headers: { 'content-type': 'text/plain' } });
      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return json({ error: 'Something went wrong on my end.' }, 500, cors);
    }
  },
};

// ------------------------------------------------------------------ Etsy clicks
type Click = { t: string; p: string; c: string };

// Resend's free plan allows 100 emails a day (shared with the forms), so click emails stop at this many a day; clicks are still logged.
const CLICK_EMAILS_PER_DAY = 80;

async function logClick(req: Request, env: Env, cors: Record<string, string>, ctx: ExecutionContext) {
  // Only count clicks from the site itself (the browser sends Origin with the beacon).
  if (!cors['Access-Control-Allow-Origin']) return new Response(null, { status: 403 });
  let body: { product?: unknown; case?: unknown };
  try { body = JSON.parse(await req.text()); } catch { return new Response(null, { status: 400, headers: cors }); }
  const p = String(body.product ?? '').slice(0, 80).trim(), c = String(body.case ?? '').replace(/\D/g, '').slice(0, 3);
  if (!p) return new Response(null, { status: 400, headers: cors });
  const t = new Date().toISOString();
  await env.CLICKS.put(`c:${t}:${crypto.randomUUID().slice(0, 6)}`, '', { metadata: { p, c } });
  ctx.waitUntil(clickEmail(env, { t, p, c }).catch(err => console.error('click email', err)));
  return new Response(null, { status: 204, headers: cors });
}

async function clickEmail(env: Env, click: Click) {
  const quota = `meta:mails:${click.t.slice(0, 10)}`, sent = +(await env.CLICKS.get(quota) ?? 0);
  if (sent >= CLICK_EMAILS_PER_DAY) { console.log('click email limit reached for today; logged only'); return; }
  await env.CLICKS.put(quota, String(sent + 1), { expirationTtl: 3 * 86400 });
  const all = await readClicks(env), forThis = all.filter(x => x.p === click.p).length;
  const time = new Date(click.t).toLocaleTimeString('en-US', { timeZone: env.TIME_ZONE, hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }); // seconds keep each subject unique, so Gmail doesn't stack clicks into one thread
  const td = 'style="padding:6px 14px 6px 0;color:#687082;white-space:nowrap"';
  await sendEmail(env, `Etsy click: ${click.p} — ${time}`, mailBox('Someone clicked “Buy on Etsy”',
    `<table style="border-collapse:collapse"><tr><td ${td}>Product</td><td><strong>${esc(click.p)}</strong></td></tr>
      ${click.c ? `<tr><td ${td}>Gallery case</td><td>${esc(click.c)}</td></tr>` : ''}
      <tr><td ${td}>When</td><td>${when(click.t, env)}</td></tr>
      <tr><td ${td}>Clicks on this product</td><td>${forThis}</td></tr>
      <tr><td ${td}>Clicks on all products</td><td>${all.length}</td></tr></table>
    <p style="margin-top:18px"><a href="${esc(await clicksUrl(env))}" style="color:#0B5AD6;font-weight:700">See every click so far</a> <span style="color:#687082;font-size:13px">(private link)</span></p>`));
}

async function readClicks(env: Env, prefix = 'c:'): Promise<Click[]> {
  const out: Click[] = [];
  let cursor: string | undefined;
  do {
    const page: KVNamespaceListResult<{ p: string; c: string }> = await env.CLICKS.list({ prefix, cursor });
    for (const k of page.keys) out.push({ t: k.name.split(':').slice(1, -1).join(':'), p: k.metadata?.p ?? '?', c: k.metadata?.c ?? '' });
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && out.length < 20000);
  return out;
}

const WORKER_ORIGIN = 'https://mikes-models-forms.mikes-models-forms.workers.dev';
const clicksUrl = async (env: Env) => `${WORKER_ORIGIN}/clicks?k=${await sign('clicks', env.APPROVE_SECRET!)}`;
const when = (iso: string, env: Env) => new Date(iso).toLocaleString('en-US', { timeZone: env.TIME_ZONE, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

function clickTables(clicks: Click[], env: Env) {
  const counts = new Map<string, number>();
  clicks.forEach(c => counts.set(c.p, (counts.get(c.p) ?? 0) + 1));
  const td = 'style="padding:6px 14px 6px 0;border-bottom:1px solid #DCDFE6"';
  const byProduct = [...counts].sort((a, b) => b[1] - a[1]).map(([p, n]) => `<tr><td ${td}>${esc(p)}</td><td ${td}><strong>${n}</strong></td></tr>`).join('');
  const list = [...clicks].reverse().slice(0, 500).map(c => `<tr><td ${td}>${when(c.t, env)}</td><td ${td}>${esc(c.p)}</td><td ${td}>${c.c ? 'Case ' + esc(c.c) : ''}</td></tr>`).join('');
  return `<h2 style="font-size:17px;margin:20px 0 6px">By product</h2><table style="border-collapse:collapse">${byProduct}</table>
    <h2 style="font-size:17px;margin:20px 0 6px">Every click, newest first</h2><table style="border-collapse:collapse">${list}</table>`;
}

async function clicksPage(url: URL, env: Env) {
  if (!env.APPROVE_SECRET || url.searchParams.get('k') !== await sign('clicks', env.APPROVE_SECRET)) return page('Link not valid', '<p>Use the link from your Etsy clicks email.</p>', 403);
  const clicks = await readClicks(env);
  const body = clicks.length
    ? `<p><strong>${clicks.length}</strong> click${clicks.length === 1 ? '' : 's'} on “Buy on Etsy” so far.</p>${clickTables(clicks, env)}`
    : '<p>No one has clicked “Buy on Etsy” yet.</p>';
  return page('Etsy button clicks', body);
}

async function sendEmail(env: Env, subject: string, html: string) {
  if (!env.RESEND_API_KEY) { devOutbox = [{ subject, html }, ...devOutbox].slice(0, 10); console.log('[dev] would send:', subject); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.FROM_EMAIL, to: [env.TO_EMAIL], subject, html }),
  });
  if (!res.ok) console.error('Resend', res.status, await res.text());
}

const mailBox = (title: string, inner: string) => `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.5;color:#39404F;max-width:640px"><div style="background:#0C3A85;color:#FFFFFF;padding:16px 20px;border-radius:4px 4px 0 0;font-size:20px;font-weight:700">${title}</div><div style="border:2px solid #39404F;border-top:0;padding:16px 20px;border-radius:0 0 4px 4px">${inner}</div></div>`;

// ------------------------------------------------------------------ submit
async function submit(req: Request, env: Env, url: URL, cors: Record<string, string>) {
  const fd = await req.formData();
  // Honeypot (an off-screen field only bots fill): pretend it worked, send nothing.
  if (String(fd.get('mm_hp') ?? '')) { console.log('honeypot hit — not sent'); return json({ ok: true }, 200, cors); }

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, String(fd.get('cf-turnstile-response') ?? ''), req.headers.get('CF-Connecting-IP'));
    if (!ok) { console.log('spam check failed'); return json({ error: 'The spam check didn’t pass — please try again.' }, 400, cors); }
  }

  let payload: { form?: string; ref?: string; edit?: boolean; answers?: Answer[] };
  try { payload = JSON.parse(String(fd.get('payload') ?? '')); } catch { return json({ error: 'Bad form data.' }, 400, cors); }
  const form = payload.form as FormType;
  if (!(form in REQUIRED)) return json({ error: 'Unknown form.' }, 400, cors);
  const ref = String(payload.ref ?? '').replace(/[^A-Z0-9-]/gi, '').slice(0, 24) || 'MM-' + Date.now().toString(36).toUpperCase();
  const answers: Answer[] = (Array.isArray(payload.answers) ? payload.answers : []).slice(0, 40).map(a => ({
    name: String(a?.name ?? '').slice(0, 40), label: String(a?.label ?? '').slice(0, 120), value: String(a?.value ?? '').slice(0, 4000),
  }));
  const get = (n: string) => answers.find(a => a.name === n)?.value.trim() ?? '';

  const missing = REQUIRED[form].filter(n => !get(n));
  if (missing.length) return json({ error: `Required fields are missing: ${missing.join(', ')}.` }, 400, cors);
  if (!EMAIL_RE.test(get('email'))) return json({ error: 'That email address doesn’t look right.' }, 400, cors);
  const rating = form === 'review' ? parseInt(get('rating'), 10) : 0;
  if (form === 'review' && !(rating >= 1 && rating <= 5)) return json({ error: 'Pick a star rating.' }, 400, cors);

  const files = form === 'review' ? [] : fd.getAll('files').filter((f): f is File => typeof f !== 'string');
  if (files.length > MAX_FILES) return json({ error: `Attach up to ${MAX_FILES} files.` }, 400, cors);
  let total = 0;
  for (const f of files) {
    total += f.size;
    if (f.size > MAX_EACH || !FILE_EXT.test(f.name)) return json({ error: `${f.name} can’t be attached (type or size).` }, 400, cors);
  }
  if (total > MAX_TOTAL) return json({ error: 'Attachments are too large in total.' }, 400, cors);

  // ---- build the email ----
  const name = get('name'), edited = payload.edit ? 'Updated: ' : '';
  const subject = form === 'make' ? `${edited}New project (Make it): ${get('title')} — ${name}`
    : form === 'solve' ? `${edited}New project (Solve it) — ${name}`
    : `${edited}New review: ${'★'.repeat(rating)} ${get('product')} — ${name}`;
  let approveUrl = '';
  if (form === 'review') {
    if (!env.APPROVE_SECRET) throw new Error('APPROVE_SECRET is not set');
    const review: Review = { id: ref, name: name.slice(0, 40), product: get('product').slice(0, 80), rating, comment: get('comment').slice(0, 400), date: new Date().toISOString().slice(0, 10) };
    const d = b64url(JSON.stringify(review));
    approveUrl = `${url.origin}/approve?d=${d}&s=${await sign(d, env.APPROVE_SECRET)}`;
  }
  const html = emailHtml(form, ref, !!payload.edit, answers, files.map(f => f.name), approveUrl);
  const text = [subject, `Reference: ${ref}`, '', ...answers.filter(a => a.value).map(a => `${a.label}: ${a.value}`),
    files.length ? `\nAttached: ${files.map(f => f.name).join(', ')}` : '', approveUrl ? `\nApprove & publish: ${approveUrl}` : ''].join('\n');
  const attachments = await Promise.all(files.map(async f => ({ filename: f.name, content: bytesToB64(new Uint8Array(await f.arrayBuffer())) })));

  const message = { from: env.FROM_EMAIL, to: [env.TO_EMAIL], reply_to: get('email'), subject: subject.slice(0, 200), html, text, attachments };
  if (!env.RESEND_API_KEY) {
    if (env.DEV_MODE !== '1') throw new Error('RESEND_API_KEY is not set');
    devOutbox = [{ ...message, attachments: attachments.map(a => ({ filename: a.filename, bytes: Math.round(a.content.length * 0.75) })), approveUrl }];
    console.log('[dev] would send:', subject);
    return json({ ok: true, ref }, 200, cors);
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) { console.error('Resend', res.status, await res.text()); return json({ error: 'The email service didn’t accept it.' }, 502, cors); }
  console.log(`sent ${form} ${ref} → Resend id ${((await res.json()) as { id?: string }).id}`);
  return json({ ok: true, ref }, 200, cors);
}

// ------------------------------------------------------------------ approve
async function readSigned(d: string, s: string, env: Env): Promise<Review | null> {
  if (!env.APPROVE_SECRET || !d || !s || s !== await sign(d, env.APPROVE_SECRET)) return null;
  try { return JSON.parse(fromB64url(d)); } catch { return null; }
}

async function approvePage(url: URL, env: Env) {
  const d = url.searchParams.get('d') ?? '', s = url.searchParams.get('s') ?? '';
  const r = await readSigned(d, s, env);
  if (!r) return page('Link not valid', '<p>This approval link is incomplete or has been changed. Use the button in the original email.</p>', 400);
  return page('Publish this review?', `${reviewCard(r)}
    <form method="post" action="/approve"><input type="hidden" name="d" value="${esc(d)}"><input type="hidden" name="s" value="${esc(s)}">
    <button type="submit">Publish review</button></form>
    <p class="muted">Don’t want it on the site? Just close this page — nothing is published until you press the button.</p>`);
}

async function approve(req: Request, env: Env) {
  const fd = await req.formData();
  const r = await readSigned(String(fd.get('d') ?? ''), String(fd.get('s') ?? ''), env);
  if (!r) return page('Link not valid', '<p>This approval link is incomplete or has been changed.</p>', 400);

  if (!env.GITHUB_TOKEN && env.DEV_MODE === '1') {
    const i = devReviews.findIndex(x => x.id === r.id);
    if (i >= 0) devReviews[i] = r; else devReviews.unshift(r);
  } else {
    if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set');
    const api = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${env.REVIEWS_PATH}`;
    const headers = { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'mikes-models-forms' };
    // Retry once if someone else committed in between (409 = file changed since it was read).
    for (let attempt = 0; attempt < 2; attempt++) {
      const cur = await fetch(api, { headers });
      if (!cur.ok) throw new Error(`GitHub read ${cur.status}`);
      const file = await cur.json() as { content: string; sha: string };
      const list: Review[] = JSON.parse(fromB64(file.content.replace(/\n/g, '')) || '[]');
      const i = list.findIndex(x => x.id === r.id);
      if (i >= 0) list[i] = r; else list.unshift(r);
      const put = await fetch(api, {
        method: 'PUT', headers,
        body: JSON.stringify({ message: `Publish review from ${r.name} (${r.id})`, content: toB64(JSON.stringify(list, null, 2) + '\n'), sha: file.sha }),
      });
      if (put.ok) break;
      if (put.status !== 409 || attempt === 1) throw new Error(`GitHub write ${put.status}: ${await put.text()}`);
    }
  }
  return page('Published!', `${reviewCard(r)}<p>It’ll appear on the <a href="${esc(env.SITE_URL)}/about/">About page</a> in about a minute, once the site rebuilds.</p>`);
}

// ------------------------------------------------------------------ helpers
function corsHeaders(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = env.SITE_ORIGINS.split(',').map(s => s.trim()).includes(origin);
  return allowed ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' } : { Vary: 'Origin' };
}
const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'content-type': 'application/json' } });

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  if (!token) return false;
  const body = new FormData();
  body.set('secret', secret); body.set('response', token);
  if (ip) body.set('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  return ((await r.json()) as { success?: boolean }).success === true;
}

async function sign(data: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
  return bytesToB64(mac).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function bytesToB64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const toB64 = (text: string) => bytesToB64(new TextEncoder().encode(text));
const fromB64 = (b64: string) => new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)));
const b64url = (text: string) => toB64(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s: string) => fromB64(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const stars = (n: number) => `<span style="color:#E8A132;font-size:20px;letter-spacing:2px">${'★'.repeat(n)}</span><span style="color:#C2C7D1;font-size:20px;letter-spacing:2px">${'★'.repeat(5 - n)}</span>`;
const reviewCard = (r: Review) => `<div class="card"><p><strong>${esc(r.name)}</strong> — ${esc(r.product)}</p><p>${stars(r.rating)}</p><p>${esc(r.comment)}</p></div>`;

function emailHtml(form: FormType, ref: string, edit: boolean, answers: Answer[], fileNames: string[], approveUrl: string) {
  const heading = form === 'make' ? 'New custom project — Make it' : form === 'solve' ? 'New custom project — Solve it' : 'New review to approve';
  const rows = answers.filter(a => a.value).map(a => `<tr><td style="padding:8px 12px 8px 0;color:#687082;vertical-align:top;white-space:nowrap">${esc(a.label)}</td><td style="padding:8px 0;color:#1B1F27;white-space:pre-wrap">${esc(a.value)}</td></tr>`).join('');
  const button = approveUrl ? `<p style="margin:24px 0 8px"><a href="${esc(approveUrl)}" style="display:inline-block;padding:12px 20px;background:#1F6FEB;color:#FFFFFF;text-decoration:none;border-radius:3px;font-weight:700">Approve &amp; publish</a></p><p style="color:#687082;font-size:13px;margin:0">Opens a confirmation page — nothing goes live until you press Publish there. To reject, just ignore this email.</p>` : '';
  const files = fileNames.length ? `<p style="color:#39404F">Attached: ${fileNames.map(esc).join(', ')}</p>` : '';
  const reply = form === 'review' ? '' : '<p style="color:#687082;font-size:13px">Reply to this email to answer them directly.</p>';
  return `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.5;color:#39404F;max-width:640px">
    <div style="background:#0C3A85;color:#FFFFFF;padding:16px 20px;border-radius:4px 4px 0 0"><div style="font-size:11px;letter-spacing:2px;color:#45D4FF;font-weight:700">MIKE'S MODELS · ${esc(ref)}${edit ? ' · UPDATED' : ''}</div><div style="font-size:20px;font-weight:700;margin-top:4px">${heading}</div></div>
    <div style="border:2px solid #39404F;border-top:0;padding:16px 20px;border-radius:0 0 4px 4px">
      ${edit ? '<p style="background:#FEF7EA;border:1px solid #E8A132;padding:8px 10px;color:#8A560A;font-size:13px">This replaces their earlier response with the same reference.</p>' : ''}
      <table style="border-collapse:collapse;width:100%">${rows}</table>${files}${reply}${button}
    </div></div>`;
}

function page(title: string, body: string, status = 200) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} — Mike's Models</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:#0C3A85;font:16px/1.5 system-ui,sans-serif;color:#39404F}
main{width:min(520px,100%);background:#fff;border:2px solid #39404F;border-radius:4px;box-shadow:4px 4px 0 #39404F;padding:28px}
h1{margin:0 0 16px;font-size:26px;color:#1B1F27}.card{border:1px solid #DCDFE6;border-radius:3px;padding:12px 14px;background:#F6F7F9;margin-bottom:16px}.card p{margin:4px 0}
button{height:44px;padding:0 20px;border:0;border-radius:3px;background:#1F6FEB;color:#fff;font:700 16px system-ui,sans-serif;cursor:pointer}button:hover{background:#0B5AD6}.muted{color:#687082;font-size:14px}a{color:#0B5AD6}</style></head>
<body><main><h1>${esc(title)}</h1>${body}</main></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
