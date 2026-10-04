import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { minify } from 'html-minifier-terser';

/**
 * Build-time HTML composition, so every page ships fully rendered with no runtime templating:
 *
 *   <x-include src="mike" full wave></x-include>   → partials/mike.html, rendered with those flags
 *   <x-icon name="arrow-left" size="18"></x-icon>   → the Lucide SVG, inlined (no icon requests)
 *   {{root}}                                         → relative path from the page to the site root
 *   {{url}}, {{site}}                                → this page's absolute URL, and the site's origin
 *
 * Partials support {{#if flag}}…{{/if}} (not nested) and {{name}} for attribute values.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PARTIALS = path.join(ROOT, 'partials');
const ICONS = path.join(ROOT, 'node_modules', 'lucide-static', 'icons');

type Vars = Record<string, string | boolean>;

const parseAttrs = (s: string): Vars => {
  const out: Vars = {};
  for (const m of s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) out[m[1]] = m[2] ?? true;
  return out;
};

const iconCache = new Map<string, string>();
function icon(name: string, size: string, cls: string) {
  let svg = iconCache.get(name);
  if (!svg) {
    const file = path.join(ICONS, `${name}.svg`);
    if (!fs.existsSync(file)) throw new Error(`Unknown Lucide icon "${name}"`);
    svg = fs.readFileSync(file, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/ class="[^"]*"/, '')
      .replace(/ width="24" height="24"/, '')
      .replace(/> </g, '><')
      .trim();
    iconCache.set(name, svg);
  }
  return svg.replace('<svg', `<svg class="icon${cls ? ' ' + cls : ''}" width="${size}" height="${size}" aria-hidden="true" focusable="false"`);
}

function render(html: string, vars: Vars, depth = 0): string {
  if (depth > 8) throw new Error('x-include nested too deeply');
  return html
    .replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, k, body) => (vars[k] ? body : ''))
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (typeof vars[k] === 'string' ? (vars[k] as string) : m))
    .replace(/<x-include\s+([^>]*)><\/x-include>/g, (_, a) => {
      const attrs = parseAttrs(a);
      const file = path.join(PARTIALS, `${attrs.src}.html`);
      return render(fs.readFileSync(file, 'utf8'), { root: vars.root, url: vars.url, site: vars.site, ...attrs }, depth + 1);
    })
    .replace(/<x-icon\s+([^>]*)><\/x-icon>/g, (_, a) => {
      const { name, size = '20', class: cls = '' } = parseAttrs(a);
      return icon(String(name), String(size), String(cls));
    });
}

export function htmlPartials({ site }: { site: string }): Plugin {
  return {
    name: 'mm-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const depth = ctx.path.split('/').filter(Boolean).length - 1;
        const url = site + ctx.path.replace(/index\.html$/, '');
        return render(html, { root: depth > 0 ? '../'.repeat(depth) : './', url, site });
      },
    },
    handleHotUpdate({ file, server }) {
      if (path.normalize(file).startsWith(PARTIALS)) server.ws.send({ type: 'full-reload' });
    },
  };
}

export function htmlMinify(): Plugin {
  return {
    name: 'mm-html-minify',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: html =>
        minify(html, {
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeComments: true,
          caseSensitive: true,
          keepClosingSlash: true,
          minifyJS: true,
        }),
    },
  };
}
