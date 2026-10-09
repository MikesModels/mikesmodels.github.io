// In-page forms (custom design "make it" / "solve it", reviews): rendering from a spec, required-field
// checks, uploads, sending, and the thank-you screen with "edit my response" / "new form".
import { sendForm, mountSpamCheck } from './submit';

type Base = { name: string; label: string; required?: boolean; help?: string };
export type Field =
  | (Base & { kind: 'text' | 'email' | 'tel' | 'date'; placeholder?: string; autocomplete?: string; maxLength?: number })
  | (Base & { kind: 'textarea'; placeholder?: string; rows?: number; maxLength?: number })
  | (Base & { kind: 'select'; options: string[]; placeholder?: string })
  | (Base & { kind: 'number'; min: number; max: number; value?: number })
  | (Base & { kind: 'dims' })
  | (Base & { kind: 'rating' })
  | (Base & { kind: 'files' });

export type FormSpec = {
  type: 'make' | 'solve' | 'review';
  sections: { title: string; fields: Field[] }[];
  submitLabel: string;
  thanks: { title: string; body: string; another: string };
};

export type Answer = { name: string; label: string; value: string };

const FILE_ACCEPT = 'image/*,.heic,.pdf,.stl,.3mf,.step,.stp,.obj';
const MAX_FILES = 6, MAX_EACH = 8 * 1024 * 1024, MAX_TOTAL = 20 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+(]?[\d\s().-]{7,}$/;

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const mb = (n: number) => (n / 1048576).toFixed(n < 1048576 ? 2 : 1) + ' MB';
const STAR = (on: boolean, size: number) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}"><path d="M12 2.6l2.85 5.9 6.45.9-4.7 4.5 1.15 6.4L12 17.2l-5.75 3.1 1.15-6.4-4.7-4.5 6.45-.9z" fill="${on ? '#E8A132' : 'none'}" stroke="${on ? '#B06F0C' : '#C2C7D1'}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
/** Scroll `el` into view inside its own scroll box only (the built-in version would also shift the page behind a panel). */
function reveal(el: HTMLElement, where: 'top' | 'center' | 'nearest') {
  let box = el.parentElement;
  while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
  if (!box) return;
  const er = el.getBoundingClientRect(), br = box.getBoundingClientRect();
  if (where === 'nearest' && er.top >= br.top && er.bottom <= br.bottom) return;
  let top = box.scrollTop + er.top - br.top - 12;
  if (where === 'center') top -= (br.height - er.height) / 2 - 12;
  box.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
const newRef = () => {
  const d = new Date(), pad = (n: number) => String(n).padStart(2, '0');
  return `MM-${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

function labelHtml(f: Field, forId?: string) {
  const req = f.required ? '<span class="req" aria-hidden="true">*</span><span class="sr-only"> (required)</span>' : '';
  return forId ? `<label for="${forId}">${esc(f.label)}${req}</label>` : `<legend>${esc(f.label)}${req}</legend>`;
}

function fieldHtml(f: Field, p: string) {
  const id = `${p}-${f.name}`, help = f.help ? `<p class="field-help" id="${id}-help">${esc(f.help)}</p>` : '';
  const desc = `aria-describedby="${f.help ? id + '-help ' : ''}${id}-err"`;
  const req = f.required ? ' aria-required="true"' : '';
  const err = `<p class="field-err" id="${id}-err" hidden></p>`;
  switch (f.kind) {
    case 'textarea':
      return `<div class="field" data-field="${f.name}">${labelHtml(f, id)}${help}<textarea id="${id}" name="${f.name}" rows="${f.rows ?? 4}" maxlength="${f.maxLength ?? 2000}" placeholder="${esc(f.placeholder ?? '')}"${req} ${desc}></textarea>${err}</div>`;
    case 'select':
      return `<div class="field" data-field="${f.name}">${labelHtml(f, id)}${help}<div class="select-wrap"><select id="${id}" name="${f.name}"${req} ${desc}><option value="">${esc(f.placeholder ?? 'Pick one')}</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></div>${err}</div>`;
    case 'number':
      return `<div class="field field--short" data-field="${f.name}">${labelHtml(f, id)}${help}<input id="${id}" name="${f.name}" type="number" inputmode="numeric" min="${f.min}" max="${f.max}" value="${f.value ?? ''}"${req} ${desc}>${err}</div>`;
    case 'dims':
      return `<fieldset class="field" data-field="${f.name}" ${desc}>${labelHtml(f)}${help}<div class="dims">` +
        ['Length', 'Width', 'Height'].map((d, i) => `<label class="dim"><span>${d}</span><input name="${f.name}_${'lwh'[i]}" type="number" inputmode="decimal" min="0" step="any"${req}></label>`).join('<span class="dim-x" aria-hidden="true">×</span>') +
        `<label class="dim dim--unit"><span>Unit</span><span class="select-wrap"><select name="${f.name}_unit"><option>mm</option><option>cm</option><option>in</option></select><svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></label></div>${err}</fieldset>`;
    case 'rating':
      return `<fieldset class="field" data-field="${f.name}" ${desc}>${labelHtml(f)}${help}<div class="rating"><span class="stars" data-stars></span><span class="rating-text" data-rating-text>0 of 5</span></div><input type="hidden" name="${f.name}" value="0">${err}</fieldset>`;
    case 'files':
      return `<div class="field" data-field="${f.name}">${labelHtml(f, id)}${help}<div class="drop" data-drop><input id="${id}" type="file" multiple accept="${FILE_ACCEPT}" class="drop-input" ${desc}><svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg><span><strong>Choose files</strong> or drag them here</span><span class="drop-hint">Photos, sketches, PDF or STL · up to ${MAX_FILES} files, ${MAX_EACH / 1048576} MB each</span></div><ul class="file-list" data-files></ul>${err}</div>`;
    default:
      return `<div class="field" data-field="${f.name}">${labelHtml(f, id)}${help}<input id="${id}" name="${f.name}" type="${f.kind}" maxlength="${'maxLength' in f && f.maxLength ? f.maxLength : 200}" placeholder="${esc(('placeholder' in f && f.placeholder) || '')}"${'autocomplete' in f && f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ''}${req} ${desc}>${err}</div>`;
  }
}

/** Renders `spec` into `host` and wires it up. Returns a focus helper for when the form is shown. */
export function mountForm(host: HTMLElement, spec: FormSpec, opts: { onDone?: () => void } = {}) {
  const p = `f-${spec.type}`;
  const fields = spec.sections.flatMap(s => s.fields);
  host.innerHTML = `
    <form class="mm-form" novalidate>
      <p class="form-legend"><span class="req" aria-hidden="true">*</span> Required</p>
      <div class="form-notice" role="alert" hidden></div>
      <p class="form-editing" hidden></p>
      ${spec.sections.map((s, i) => `<section class="form-section"><h3><span class="form-step">${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</h3>${s.fields.map(f => fieldHtml(f, p)).join('')}</section>`).join('')}
      <div class="hp" aria-hidden="true"><label>Leave this empty<input name="mm_hp" tabindex="-1" autocomplete="off" data-lpignore="true" data-1p-ignore></label></div>
      <div class="spam-slot"></div>
      <div class="form-actions">
        <p class="form-send-err" role="alert" hidden></p>
        <button type="submit" class="btn btn--primary btn--lg"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg><span data-submit-label>${esc(spec.submitLabel)}</span></button>
      </div>
    </form>
    <div class="form-thanks" hidden tabindex="-1">
      <div class="thanks-badge" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h3>${esc(spec.thanks.title)}</h3>
      <p>${esc(spec.thanks.body)}</p>
      <p class="thanks-ref">Reference <strong data-ref></strong></p>
      <dl class="thanks-summary" data-summary></dl>
      <div class="thanks-actions">
        <button type="button" class="btn btn--secondary" data-edit>Edit my response</button>
        <button type="button" class="btn btn--primary" data-new>${esc(spec.thanks.another)}</button>
      </div>
    </div>`;

  const form = host.querySelector<HTMLFormElement>('form')!;
  const thanks = host.querySelector<HTMLElement>('.form-thanks')!;
  const notice = host.querySelector<HTMLElement>('.form-notice')!;
  const sendErr = host.querySelector<HTMLElement>('.form-send-err')!;
  const editing = host.querySelector<HTMLElement>('.form-editing')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  let ref = newRef(), isEdit = false, sending = false;
  let spam: Promise<{ token(): string; reset(): void }> | null = null;
  const loadSpam = () => (spam ??= mountSpamCheck(host.querySelector<HTMLElement>('.spam-slot')!).catch(() => ({ token: () => '', reset: () => {} })));

  // ---- rating ----
  const ratingField = fields.find(f => f.kind === 'rating');
  const ratingInput = ratingField ? form.querySelector<HTMLInputElement>(`input[name="${ratingField.name}"]`)! : null;
  const starsEl = form.querySelector<HTMLElement>('[data-stars]');
  const renderStars = () => {
    if (!starsEl || !ratingInput) return;
    const r = +ratingInput.value;
    starsEl.innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" class="star-btn" data-n="${n}" aria-label="${n} star${n > 1 ? 's' : ''}" aria-pressed="${n === r}">${STAR(n <= r, 30)}</button>`).join('');
    form.querySelector('[data-rating-text]')!.textContent = `${r} of 5`;
  };
  starsEl?.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-n]');
    if (!b || !ratingInput) return;
    const n = +b.dataset.n!;
    ratingInput.value = String(+ratingInput.value === n ? 0 : n);
    renderStars();
    starsEl.querySelector<HTMLElement>(`[data-n="${n}"]`)!.focus();
    check(ratingField!);
  });
  renderStars();

  // ---- files ----
  const filesField = fields.find(f => f.kind === 'files');
  let files: File[] = [];
  const fileList = form.querySelector<HTMLElement>('[data-files]');
  const drop = form.querySelector<HTMLElement>('[data-drop]');
  const fileInput = drop?.querySelector<HTMLInputElement>('input[type=file]');
  const urls = new Map<File, string>();
  const renderFiles = () => {
    if (!fileList) return;
    fileList.innerHTML = files.map((f, i) => {
      let thumb = '<span class="file-thumb file-thumb--doc" aria-hidden="true">FILE</span>';
      if (f.type.startsWith('image/') && !/heic/i.test(f.type)) {
        if (!urls.has(f)) urls.set(f, URL.createObjectURL(f));
        thumb = `<img class="file-thumb" src="${urls.get(f)}" alt="">`;
      }
      return `<li>${thumb}<span class="file-name">${esc(f.name)}</span><span class="file-size">${mb(f.size)}</span><button type="button" class="icon-btn" data-remove="${i}" aria-label="Remove ${esc(f.name)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></li>`;
    }).join('');
  };
  const addFiles = (list: FileList | File[]) => {
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      if (files.length >= MAX_FILES) { problems.push(`Only ${MAX_FILES} files can be attached.`); break; }
      if (f.size > MAX_EACH) { problems.push(`${f.name} is over ${MAX_EACH / 1048576} MB.`); continue; }
      if (files.reduce((a, x) => a + x.size, 0) + f.size > MAX_TOTAL) { problems.push(`Attachments can total ${MAX_TOTAL / 1048576} MB at most.`); break; }
      if (!files.some(x => x.name === f.name && x.size === f.size)) files.push(f);
    }
    renderFiles();
    if (filesField) setErr(filesField.name, problems.join(' '));
  };
  fileInput?.addEventListener('change', () => { if (fileInput.files) addFiles(fileInput.files); fileInput.value = ''; });
  fileList?.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-remove]');
    if (!b) return;
    const [gone] = files.splice(+b.dataset.remove!, 1);
    if (urls.has(gone)) { URL.revokeObjectURL(urls.get(gone)!); urls.delete(gone); }
    renderFiles();
    if (filesField) setErr(filesField.name, '');
  });
  if (drop) {
    ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, () => drop.classList.remove('is-over')));
    drop.addEventListener('drop', e => { e.preventDefault(); if ((e as DragEvent).dataTransfer?.files) addFiles((e as DragEvent).dataTransfer!.files); });
  }

  // ---- values + validation ----
  const val = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? '';
  const dimsText = (name: string) => {
    const parts = ['l', 'w', 'h'].map(k => val(`${name}_${k}`));
    if (parts.every(x => !x)) return '';
    return parts.map(x => x || '–').join(' × ') + ' ' + val(`${name}_unit`) + '  (L × W × H)';
  };
  const valueOf = (f: Field): string => {
    if (f.kind === 'dims') return dimsText(f.name);
    if (f.kind === 'rating') return +val(f.name) ? `${val(f.name)} of 5` : '';
    if (f.kind === 'files') return files.map(x => x.name).join(', ');
    return val(f.name);
  };
  function setErr(name: string, msg: string) {
    const box = form.querySelector<HTMLElement>(`[data-field="${name}"]`)!;
    const err = box.querySelector<HTMLElement>('.field-err')!;
    err.textContent = msg; err.hidden = !msg;
    box.classList.toggle('is-invalid', !!msg);
    box.querySelectorAll('input:not([type=hidden]):not([type=file]), select, textarea').forEach(el => {
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    });
  }
  function problem(f: Field): string {
    const v = valueOf(f);
    if (f.kind === 'files') return '';
    if (f.kind === 'dims') {
      const nums = ['l', 'w', 'h'].map(k => val(`${f.name}_${k}`)).filter(Boolean);
      if (nums.some(n => !(+n > 0))) return 'Sizes must be numbers above zero.';
      return f.required && !nums.length ? 'Add at least one measurement.' : '';
    }
    if (!v) return f.required ? (f.kind === 'select' ? 'Please pick one.' : f.kind === 'rating' ? 'Pick a star rating.' : 'Please fill this in.') : '';
    if (f.kind === 'email' && !EMAIL_RE.test(v)) return 'That email address doesn’t look right.';
    if (f.kind === 'tel' && !PHONE_RE.test(v)) return 'That phone number doesn’t look right.';
    if (f.kind === 'number' && (!Number.isInteger(+v) || +v < f.min || +v > f.max)) return `Enter a whole number from ${f.min} to ${f.max}.`;
    return '';
  }
  function check(f: Field) { const m = problem(f); setErr(f.name, m); return !m; }
  // Re-check a field once the visitor changes it, so an error clears as soon as it's fixed.
  form.addEventListener('input', e => {
    const box = (e.target as Element).closest<HTMLElement>('[data-field]');
    const f = box && fields.find(x => x.name === box.dataset.field);
    if (f && box!.classList.contains('is-invalid')) check(f);
    sendErr.hidden = true;
  });

  function showNotice(bad: Field[]) {
    const missing = bad.length;
    notice.innerHTML = `<strong>Your form wasn’t sent.</strong> ${missing === 1 ? 'One field needs' : `${missing} fields need`} attention — required fields are marked <span class="req">*</span>.<ul>${bad.map(f => `<li><a href="#${p}-${f.name}" data-jump="${f.name}">${esc(f.label)}</a></li>`).join('')}</ul>`;
    notice.hidden = false;
    reveal(notice, 'nearest');
  }
  notice.addEventListener('click', e => {
    const a = (e.target as Element).closest<HTMLElement>('[data-jump]');
    if (!a) return;
    e.preventDefault();
    const box = form.querySelector<HTMLElement>(`[data-field="${a.dataset.jump}"]`)!;
    reveal(box, 'center');
    box.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea, button')?.focus({ preventScroll: true });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    sendErr.hidden = true;
    const bad = fields.filter(f => !check(f));
    if (bad.length) { showNotice(bad); return; }
    notice.hidden = true;

    const answers: Answer[] = fields.map(f => ({ name: f.name, label: f.label, value: valueOf(f) }));
    const data = new FormData();
    data.set('payload', JSON.stringify({ form: spec.type, ref, edit: isEdit, answers }));
    files.forEach(f => data.append('files', f, f.name));
    data.set('mm_hp', val('mm_hp'));
    const check2 = await loadSpam();
    data.set('cf-turnstile-response', check2?.token() ?? '');

    sending = true; submitBtn.disabled = true; submitLabel.textContent = 'Sending…';
    try {
      await sendForm(data);
      showThanks(answers);
    } catch (err) {
      sendErr.innerHTML = `Sorry, that didn’t go through (${esc((err as Error).message)}). Please try again in a minute — nothing you typed has been lost.`;
      sendErr.hidden = false;
      check2?.reset();
    } finally {
      sending = false; submitBtn.disabled = false;
      submitLabel.textContent = isEdit ? 'Send updated response' : spec.submitLabel;
    }
  });

  function showThanks(answers: Answer[]) {
    host.querySelector('[data-ref]')!.textContent = ref;
    host.querySelector('[data-summary]')!.innerHTML = answers.filter(a => a.value)
      .map(a => `<dt>${esc(a.label)}</dt><dd>${esc(a.value)}</dd>`).join('');
    form.hidden = true; thanks.hidden = false;
    reveal(thanks, 'top');
    thanks.focus({ preventScroll: true });
    opts.onDone?.();
  }

  host.querySelector('[data-edit]')!.addEventListener('click', () => {
    isEdit = true;
    editing.textContent = `Editing your response ${ref}. Sending it again replaces the earlier one.`;
    editing.hidden = false;
    submitLabel.textContent = 'Send updated response';
    thanks.hidden = true; form.hidden = false;
    reveal(form, 'top');
    focusFirst();
  });
  host.querySelector('[data-new]')!.addEventListener('click', () => {
    form.reset();
    files = []; urls.forEach(u => URL.revokeObjectURL(u)); urls.clear(); renderFiles();
    if (ratingInput) { ratingInput.value = '0'; renderStars(); }
    fields.forEach(f => setErr(f.name, ''));
    ref = newRef(); isEdit = false; editing.hidden = true; notice.hidden = true;
    submitLabel.textContent = spec.submitLabel;
    thanks.hidden = true; form.hidden = false;
    reveal(form, 'top');
    focusFirst();
  });

  const focusFirst = () => form.querySelector<HTMLElement>('input:not([type=hidden]):not([tabindex="-1"]), select, textarea')?.focus({ preventScroll: true });

  return {
    /** Call when the form becomes visible: focuses the first field, and loads the spam check once the opening
     *  animation is over (loading it is heavy enough to stutter the animation). */
    shown() {
      if (!form.hidden) focusFirst();
      if (!spam) setTimeout(loadSpam, 1400);
    },
  };
}
