// Gallery products, in case order (case 01 = first on the left). Only list real, finished products:
// every case without a product shows "Coming soon..." with TBD details.
//
// To add one, put its photo in src/assets/products/ and add an entry, e.g.
//   { name: 'Flexi dragon', desc: 'Articulated, printed in one piece.', price: '$24.00', image: 'flexi-dragon.webp' },
// `origin` (a line about where the design came from) is optional. Products get COLOURS below unless
// they set their own `colours` (use [] for a product that only comes one way).
export type Colour = { name: string; hex: string[] }; // one hex = solid, two or more = mixed
export type Product = {
  name: string;
  desc: string;
  price: string;
  image: string;
  origin?: string;
  colours?: Colour[];
};

/** Number of display cases in the hall. */
export const CASES = 12;

export const PRODUCTS: Product[] = [];

/** Default colour choices. Mike orders filament to match whatever the customer picks or asks for. */
export const COLOURS: Colour[] = [
  { name: 'Black', hex: ['#1B1F27'] },
  { name: 'White', hex: ['#F4F5F7'] },
  { name: 'Red', hex: ['#D7263D'] },
  { name: 'Blue', hex: ['#1F6FEB'] },
  { name: 'Blue & white', hex: ['#1F6FEB', '#F4F5F7'] },
  { name: 'Black & gold', hex: ['#1B1F27', '#D4A537'] },
  { name: 'Rainbow', hex: ['#E8413C', '#F5A623', '#F2D51C', '#3BB273', '#1F6FEB', '#8E44AD'] },
];

export const coloursOf = (p: Product) => p.colours ?? COLOURS;

/** CSS background for a colour swatch: flat for solid, diagonal split or bands for mixed. */
export function swatchFill(c: Colour) {
  const h = c.hex;
  if (h.length === 1) return h[0];
  if (h.length === 2) return `linear-gradient(135deg,${h[0]} 50%,${h[1]} 50%)`;
  const step = 100 / h.length;
  return `linear-gradient(135deg,${h.map((x, i) => `${x} ${(i * step).toFixed(1)}% ${((i + 1) * step).toFixed(1)}%`).join(',')})`;
}

// Resolved product photo URLs (Vite fingerprints whatever is in src/assets/products/).
const photos = import.meta.glob<string>('../assets/products/*', { eager: true, query: '?url', import: 'default' });
export const photoUrl = (file?: string) => (file ? photos[`../assets/products/${file}`] : undefined);
