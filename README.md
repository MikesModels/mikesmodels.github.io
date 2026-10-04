# Mike's Models — website

Static site built from the Claude Design handoff (`../Mike's Models Homepage/design_handoff_mikes_models_site`).
Vite + plain TypeScript, no framework: every page ships as pre-rendered HTML with a 1–6 KB script.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ to check the build
```

## Where things live

| What | Where |
|---|---|
| Pages | `index.html`, `custom-design/`, `custom-request/`, `gallery/`, `about/` |
| Shared scene parts (Mike, booth backdrop, table, sign stand, desk, head tags) | `partials/*.html` |
| Page behaviour | `src/pages/*.ts` |
| Styles (design tokens first) | `src/styles/` |
| Gallery items | `src/data/products.ts` |
| Approved reviews | `src/data/reviews.json` |
| Source images (full size) | `assets-src/` → `npm run images` writes the optimised copies |

Partials are composed at build time by `plugins/html-partials.ts`:
`<x-include src="mike" full wave></x-include>` inlines a partial, `<x-icon name="mail" size="18"></x-icon>` inlines a Lucide icon,
and `{{root}}` is the relative path back to the site root. Mike is one partial (`partials/mike.html`) used everywhere —
`waist`/`full` pick the crop, `wave`/`rest` the arm pose.

## Everyday edits

**Gallery items** — edit `src/data/products.ts`. Add a photo by dropping it in `src/assets/products/` and setting
`image: 'file-name.webp'` on the item. The hallway adapts to however many items there are.

**Reviews** — the review form emails a pre-filled review to mikes3dmodels@gmail.com (GitHub Pages has no server).
To publish one, add it to `src/data/reviews.json` and rebuild:

```json
[{ "name": "Priya S.", "product": "Flexi dragon", "rating": 5, "comment": "Every joint actually moves." }]
```

**Table props on the home page** (keychains, display model, flexi dragon, trinkets) are placeholders in `index.html`
(`<div class="ph" …>`). Replace each with `<img class="prop-img" src="/src/assets/…" alt="…">`.

**Custom request** is still the design's placeholder (email link). The real multi-step form needs a form backend;
GitHub Pages can't receive uploads, so that means a form service or a different host.

## Publishing

Live at **https://mikesmodels.github.io/** (repo `MikesModels/mikesmodels.github.io`).
Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages.
Check progress under the repo's **Actions** tab.

## Keeping models private

This repo is **public**, so it must only ever contain the website.

- `.gitignore` refuses 3D model and print files (`.stl`, `.3mf`, `.step`, `.f3d`, `.blend`, `.gcode`, …), archives, and `assets-src/`.
- `scripts/check-no-models.mjs` blocks the same file types plus anything over 1.5 MB. It runs:
  - before every commit (git hook in `.githooks/`), and
  - in the deploy workflow, on the repo and on the built site — so nothing blocked can go live.
- Full-size original images live in `assets-src/`, which stays on this PC. Only the web-sized copies are committed.

After cloning this repo somewhere new, turn the commit hook on once:

```bash
git config core.hooksPath .githooks
```
