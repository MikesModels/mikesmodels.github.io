// Gallery items, in case order (case 01 = first on the left). These are still the design's placeholder
// items: swap in real names, copy and prices, and set `image` to a file in src/assets/products/
// (e.g. image: 'flexi-dragon.webp') once photos are ready. Cases without an image show a placeholder.
export type Product = {
  name: string;
  desc: string;
  origin: string;
  price: string;
  image?: string;
};

export const PRODUCTS: Product[] = [
  { name: 'Flexi dragon', desc: 'Articulated and printed in one piece. Every joint moves, no assembly.', origin: 'My own design, refined over several versions.', price: '$24.00' },
  { name: 'Planetary gear toy', desc: 'Turn the outer ring and the gears inside spin in sync.', origin: 'Started as a test print for gear tolerances.', price: '$18.00' },
  { name: 'Articulated axolotl', desc: 'Pocket-sized and very wiggly. Same joint design as the dragon.', origin: 'A smaller spin-off of the flexi dragon.', price: '$12.00' },
  { name: 'Headphone stand', desc: 'Weighted base with a cable hook on the back.', origin: 'Designed to fit over-ear and gaming headsets.', price: '$32.00' },
  { name: 'Cable clip set', desc: 'Six clips that tuck under a desk edge for 3–8 mm cables.', origin: 'Drawn up to tidy my own workbench.', price: '$8.00' },
  { name: 'Low-poly fox', desc: 'Faceted shelf figure, 120 mm tall.', origin: 'Modeled from scratch.', price: '$16.00' },
  { name: 'Modular drawers', desc: 'Stackable drawers for screws, bits and SD cards.', origin: 'Built to fit a standard shelf depth.', price: '$28.00' },
  { name: 'Lithophane lamp', desc: 'Your photo, printed in thin layers that glow when lit.', origin: 'A custom-order favourite.', price: '$40.00' },
  { name: 'Replacement knob', desc: 'A matched copy of a broken appliance knob.', origin: 'Measured from the original with calipers.', price: '$10.00' },
  { name: 'Gear fidget cube', desc: 'Meshing gears on every face of a 40 mm cube.', origin: 'Print-in-place, no supports.', price: '$14.00' },
  { name: 'RC car chassis', desc: 'Lightweight frame for a 1:18 hobby build.', origin: 'Engineering project, printed in PETG.', price: '$45.00' },
  { name: 'Keychain set', desc: 'Three names or shapes in your colours.', origin: 'The booth best-seller.', price: '$9.00' },
];

// Resolved product photo URLs (Vite fingerprints whatever is in src/assets/products/).
const photos = import.meta.glob<string>('../assets/products/*', { eager: true, query: '?url', import: 'default' });
export const photoUrl = (file?: string) => (file ? photos[`../assets/products/${file}`] : undefined);
