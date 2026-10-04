import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { htmlPartials, htmlMinify } from './plugins/html-partials.ts';

const page = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Public address (GitHub Pages user site). Used for canonical URLs and link previews.
const SITE = 'https://mikesmodels.github.io';

export default defineConfig({
  // Relative base: the build works from a GitHub Pages project path (/repo/) or a custom domain root.
  base: './',
  plugins: [htmlPartials({ site: SITE }), htmlMinify()],
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    rollupOptions: {
      input: {
        home: page('index.html'),
        customDesign: page('custom-design/index.html'),
        customRequest: page('custom-request/index.html'),
        gallery: page('gallery/index.html'),
        about: page('about/index.html'),
      },
    },
  },
});
