// Hallway markup, converted from the design's Gallery template (geometry and styling unchanged).
import type { Product } from '../data/products';
import floor from '../assets/img/floor-marble.webp';
import carpet from '../assets/img/carpet-pile.webp';
import white from '../assets/img/marble-white.webp';
import dark from '../assets/img/marble-dark.webp';

// Imported (not CSS variables) so the URLs resolve correctly from inline styles on any page path.
const T = { floor, carpet, white, dark };

const PH_ICON = '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** One floor + ceiling bay centred at depth zc. */
export const bayHtml = (zc: number) => `
        <div style="position:absolute;left:-650px;top:-380px;width:1300px;height:760px;overflow:hidden;background:url(${T.floor}) 80px 0/380px 380px #D8DCE3;transform:translate3d(0px,330px,${zc}px) rotateX(90deg);" data-part>
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse 70px 150px at 0 190px,rgba(255,238,205,.32),rgba(255,238,205,0)),radial-gradient(ellipse 70px 150px at 0 570px,rgba(255,238,205,.32),rgba(255,238,205,0)),radial-gradient(ellipse 70px 150px at 1300px 190px,rgba(255,238,205,.32),rgba(255,238,205,0)),radial-gradient(ellipse 70px 150px at 1300px 570px,rgba(255,238,205,.32),rgba(255,238,205,0)),linear-gradient(90deg,rgba(6,8,14,.42),rgba(6,8,14,0) 9%,rgba(6,8,14,0) 91%,rgba(6,8,14,.42));"></div>
          <div style="position:absolute;left:360px;width:580px;top:0;bottom:0;box-sizing:border-box;border-left:30px solid #0E2F66;border-right:30px solid #0E2F66;background:url(${T.carpet}) 0 0/152px 152px,radial-gradient(circle,rgba(1,203,254,.3) 0 2.5px,rgba(1,203,254,0) 3.5px) 0 0/40px 40px,repeating-linear-gradient(45deg,rgba(255,255,255,.07) 0 1.5px,rgba(255,255,255,0) 1.5px 28.28px),repeating-linear-gradient(-45deg,rgba(255,255,255,.07) 0 1.5px,rgba(255,255,255,0) 1.5px 28.28px),#0A48AB;box-shadow:inset 3px 0 0 rgba(232,161,50,.75),inset -3px 0 0 rgba(232,161,50,.75),inset 10px 0 0 #0C3A85,inset -10px 0 0 #0C3A85,inset 12px 0 0 rgba(1,203,254,.7),inset -12px 0 0 rgba(1,203,254,.7),0 0 8px 3px rgba(0,0,0,.4);">
            <div style="position:absolute;left:-30px;right:-30px;top:0;bottom:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,rgba(255,255,255,0) 2px 20px);"></div>
            <div style="position:absolute;left:-30px;right:-30px;top:0;bottom:0;background:linear-gradient(90deg,rgba(0,0,0,.34),rgba(0,0,0,0) 32%,rgba(255,240,215,.1) 50%,rgba(0,0,0,0) 68%,rgba(0,0,0,.34));"></div>
          </div>
          <div class="g-shade" data-shade style="opacity:0;"></div>
        </div>
        <!-- ceiling: coffers, beams, laylight, wall-washers -->
        <div style="position:absolute;left:-650px;top:-380px;width:1300px;height:760px;overflow:hidden;background:#262B35;transform:translate3d(0px,-470px,${zc}px) rotateX(-90deg);" data-part>
          <div style="position:absolute;left:0;right:0;top:0;height:26px;background:linear-gradient(#2F3542,#3A404D);border-bottom:1px solid #4B5263;"></div>
          <div style="position:absolute;left:0;right:0;bottom:0;height:26px;background:linear-gradient(#3A404D,#2F3542);border-top:1px solid #4B5263;"></div>
          <div style="position:absolute;left:100px;width:320px;top:60px;bottom:60px;background:linear-gradient(90deg,#1B1F27,#262B35);box-shadow:inset 0 0 0 8px #343A47,inset 0 0 0 9px #151920,inset 0 0 0 17px #2B303B,inset 0 0 0 18px #151920,inset 0 0 34px rgba(0,0,0,.55);"></div>
          <div style="position:absolute;right:100px;width:320px;top:60px;bottom:60px;background:linear-gradient(90deg,#262B35,#1B1F27);box-shadow:inset 0 0 0 8px #343A47,inset 0 0 0 9px #151920,inset 0 0 0 17px #2B303B,inset 0 0 0 18px #151920,inset 0 0 34px rgba(0,0,0,.55);"></div>
          <div style="position:absolute;left:470px;width:360px;top:50px;bottom:50px;box-sizing:border-box;border:10px solid #1B1F27;background:repeating-linear-gradient(90deg,rgba(150,128,90,.4) 0 2px,rgba(150,128,90,0) 2px 56.7px),repeating-linear-gradient(0deg,rgba(150,128,90,.4) 0 2px,rgba(150,128,90,0) 2px 56.7px),radial-gradient(ellipse at 50% 50%,#FFFBF0,#FFEACB);box-shadow:0 0 0 3px #4B5263,0 0 80px 26px rgba(255,236,200,.26);"></div>
          <div style="position:absolute;left:49px;top:179px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#FFFDF4 0 45%,#FFE7B8 60%,#9AA1AD 64% 78%,#39404F 80%);box-shadow:0 0 26px 10px rgba(255,236,200,.38);"></div>
          <div style="position:absolute;left:49px;top:559px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#FFFDF4 0 45%,#FFE7B8 60%,#9AA1AD 64% 78%,#39404F 80%);box-shadow:0 0 26px 10px rgba(255,236,200,.38);"></div>
          <div style="position:absolute;left:1229px;top:179px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#FFFDF4 0 45%,#FFE7B8 60%,#9AA1AD 64% 78%,#39404F 80%);box-shadow:0 0 26px 10px rgba(255,236,200,.38);"></div>
          <div style="position:absolute;left:1229px;top:559px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#FFFDF4 0 45%,#FFE7B8 60%,#9AA1AD 64% 78%,#39404F 80%);box-shadow:0 0 26px 10px rgba(255,236,200,.38);"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.4),rgba(0,0,0,0) 5%,rgba(0,0,0,0) 95%,rgba(0,0,0,.4));"></div>
          <div class="g-shade" data-shade style="opacity:0;"></div>
        </div>`;

/** One side-wall bay with its transform. */
export const wallHtml = (tf: string) => `
        <div style="position:absolute;left:-380px;top:-400px;width:760px;height:800px;overflow:hidden;background:repeating-linear-gradient(45deg,rgba(57,64,79,.04) 0 1px,rgba(57,64,79,0) 1px 22px),repeating-linear-gradient(-45deg,rgba(57,64,79,.04) 0 1px,rgba(57,64,79,0) 1px 22px),radial-gradient(circle,rgba(57,64,79,.06) 0 2px,rgba(57,64,79,0) 3px) 0 0/31.1px 31.1px,#C4CBD6;transform:${tf};" data-part>
          <div style="position:absolute;left:0;right:0;top:46px;height:90px;background:linear-gradient(rgba(14,18,26,.26),rgba(14,18,26,0));"></div>
          <div style="position:absolute;left:40px;top:46px;width:300px;height:560px;background:radial-gradient(ellipse 20% 16% at 50% 0%,rgba(255,252,240,.95),rgba(255,252,240,0)),radial-gradient(ellipse 50% 100% at 50% 0%,rgba(255,243,220,.92) 0%,rgba(255,238,205,.6) 36%,rgba(255,236,200,.22) 60%,rgba(255,236,200,0) 76%);"></div>
          <div style="position:absolute;left:420px;top:46px;width:300px;height:560px;background:radial-gradient(ellipse 20% 16% at 50% 0%,rgba(255,252,240,.95),rgba(255,252,240,0)),radial-gradient(ellipse 50% 100% at 50% 0%,rgba(255,243,220,.92) 0%,rgba(255,238,205,.6) 36%,rgba(255,236,200,.22) 60%,rgba(255,236,200,0) 76%);"></div>
          <div style="position:absolute;left:74px;top:150px;width:612px;height:376px;box-sizing:border-box;border:3px solid #F2F4F7;box-shadow:0 2px 0 rgba(40,46,58,.28),inset 0 2px 0 rgba(40,46,58,.2);">
            <div style="position:absolute;inset:14px;border:1px solid rgba(57,64,79,.22);box-shadow:1px 1px 0 rgba(255,255,255,.6);"></div>
          </div>
          <div style="position:absolute;left:0;right:0;top:106px;height:6px;background:linear-gradient(#FFFFFF,#C2C7D1);box-shadow:0 3px 4px rgba(14,18,26,.2);"></div>
          <div style="position:absolute;left:0;right:0;top:0;height:46px;background:repeating-linear-gradient(90deg,#F4F6F9 0 10px,#9AA1AD 10px 12px,#D5DAE2 12px 18px) 0 30px/100% 10px no-repeat,linear-gradient(180deg,#9AA1AD 0 5px,#F7F8FA 5px 13px,#C2C7D1 13px 17px,#FFFFFF 17px 24px,#DCDFE6 24px 30px,#DCDFE6 40px);border-bottom:2px solid #687082;box-shadow:0 4px 8px rgba(0,0,0,.24);"></div>
          <div style="position:absolute;left:0;right:0;top:556px;height:16px;background:linear-gradient(#FFFFFF 0 3px,#DCDFE6 3px 9px,#9AA1AD 9px 11px,#ECEEF2 11px 14px,#687082 14px);box-shadow:0 5px 6px rgba(0,0,0,.3);z-index:1;"></div>
          <div style="position:absolute;left:0;right:0;top:572px;bottom:40px;background:linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,0) 30px),#0E2F66;">
            <div style="position:absolute;left:62px;right:62px;top:28px;bottom:26px;background:linear-gradient(rgba(255,255,255,.05),rgba(0,0,0,.12)),#0F3470;box-shadow:inset 2px 2px 0 rgba(255,255,255,.16),inset -2px -2px 0 rgba(0,0,0,.4),0 0 0 7px #0C2A5A,0 0 0 8px rgba(232,161,50,.6);"></div>
          </div>
          <div style="position:absolute;left:0;right:0;bottom:0;height:40px;background:linear-gradient(rgba(232,161,50,.6) 0 1px,#39404F 1px 3px,#1B2536 3px 36px,#0E1320 36px);"></div>
          <div style="position:absolute;left:0;width:30px;top:46px;bottom:40px;background:repeating-linear-gradient(90deg,rgba(40,46,58,.16) 0 2px,rgba(40,46,58,0) 2px 7px),linear-gradient(90deg,rgba(0,0,0,.1),rgba(255,255,255,.12) 50%,rgba(0,0,0,.16)),url(${T.white}) 0 0/260px 260px;box-shadow:7px 0 9px rgba(14,18,26,.26);z-index:2;">
            <div style="position:absolute;left:0;right:-8px;top:0;height:22px;background:url(${T.white}) 40px 0/260px 260px;border-bottom:2px solid #687082;box-shadow:0 3px 4px rgba(0,0,0,.25);"></div>
            <div style="position:absolute;left:0;right:-8px;bottom:0;height:34px;background:linear-gradient(rgba(255,255,255,.14),rgba(0,0,0,.2)),url(${T.dark}) 0 0/260px 260px;box-shadow:inset 0 2px 0 rgba(232,161,50,.6);"></div>
          </div>
          <div style="position:absolute;right:0;width:30px;top:46px;bottom:40px;background:repeating-linear-gradient(90deg,rgba(40,46,58,.16) 0 2px,rgba(40,46,58,0) 2px 7px),linear-gradient(90deg,rgba(0,0,0,.16),rgba(255,255,255,.12) 50%,rgba(0,0,0,.1)),url(${T.white}) 120px 0/260px 260px;box-shadow:-7px 0 9px rgba(14,18,26,.26);z-index:2;">
            <div style="position:absolute;left:-8px;right:0;top:0;height:22px;background:url(${T.white}) 90px 0/260px 260px;border-bottom:2px solid #687082;box-shadow:0 3px 4px rgba(0,0,0,.25);"></div>
            <div style="position:absolute;left:-8px;right:0;bottom:0;height:34px;background:linear-gradient(rgba(255,255,255,.14),rgba(0,0,0,.2)),url(${T.dark}) 60px 0/260px 260px;box-shadow:inset 0 2px 0 rgba(232,161,50,.6);"></div>
          </div>
          <div style="position:absolute;left:0;right:0;bottom:0;height:60px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.22));z-index:3;"></div>
          <div class="g-shade" data-shade style="opacity:0;z-index:4;"></div>
        </div>`;

/** One display case (geometry is applied by gallery.ts). */
export function caseHtml(p: Product, i: number, num: string, left: boolean, photo?: string) {
  const shTf = 'translate3d(' + (left ? -30 : 30) + 'px,-2px,0) rotateX(90deg)';
  const dL = left ? 0.34 : 0.1, dR = left ? 0.1 : 0.34;
  const mpos = ((i * 83) % 240) + 'px ' + ((i * 137) % 240) + 'px';
  const slot = photo
    ? `<img class="g-photo" src="${photo}" alt="${esc(p.name)}" loading="lazy" decoding="async">`
    : `<div class="ph" role="img" aria-label="${esc(p.name)} — photo coming soon">${PH_ICON}<span>Photo coming soon</span></div>`;
  return `
        <div class="g-case" data-case="${i}">
          <div style="position:absolute;left:-280px;top:-280px;width:560px;height:560px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,234,196,.55),rgba(255,234,196,.2) 55%,rgba(255,234,196,0));transform:translate3d(0,-1px,0) rotateX(90deg);"></div>
          <div style="position:absolute;left:-150px;top:-150px;width:300px;height:300px;background:radial-gradient(closest-side,rgba(8,11,18,.5),rgba(8,11,18,0));transform:${shTf};"></div>
          <div style="position:absolute;left:-118px;top:-118px;width:236px;height:236px;background:rgba(8,11,18,.6);box-shadow:0 0 18px 10px rgba(8,11,18,.45);transform:translate3d(0,-3px,0) rotateX(90deg);"></div>
          <div style="position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle,#FFFDF4 0 40%,#FFE9BF 58%,#9AA1AD 62% 76%,#39404F 78%);box-shadow:0 0 34px 14px rgba(255,236,200,.5);transform:translate3d(0,-799px,0) rotateX(90deg);"></div>
                      <div style="position:absolute;left:-115px;top:-149px;width:230px;height:298px;background:linear-gradient(rgba(255,240,205,.26),rgba(255,240,205,.07));clip-path:polygon(45% 0,55% 0,100% 100%,0 100%);transform:translate3d(0,-649px,0);"></div>
          <!-- base (dark marble) -->
          <div style="position:absolute;left:-115px;top:-115px;width:230px;height:230px;background:linear-gradient(rgba(255,255,255,.14),rgba(255,255,255,.14)),url(${T.dark}) ${mpos}/300px 300px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);transform:translate3d(0,-34px,0) rotateX(90deg);"></div>
          <div style="position:absolute;left:-115px;top:-17px;width:230px;height:34px;background:linear-gradient(rgba(255,255,255,.12),rgba(0,0,0,.28)),url(${T.dark}) ${mpos}/300px 300px;box-shadow:inset 0 2px 0 rgba(232,161,50,.65);backface-visibility:hidden;transform:translate3d(0,-17px,115px);"></div>
          <div style="position:absolute;left:-115px;top:-17px;width:230px;height:34px;background:linear-gradient(rgba(255,255,255,.12),rgba(0,0,0,.28)),url(${T.dark}) 90px 40px/300px 300px;box-shadow:inset 0 2px 0 rgba(232,161,50,.65);backface-visibility:hidden;transform:translate3d(-115px,-17px,0) rotateY(-90deg);">
            <div style="position:absolute;inset:0;background:#07090E;opacity:${dL};"></div>
          </div>
          <div style="position:absolute;left:-115px;top:-17px;width:230px;height:34px;background:linear-gradient(rgba(255,255,255,.12),rgba(0,0,0,.28)),url(${T.dark}) 30px 140px/300px 300px;box-shadow:inset 0 2px 0 rgba(232,161,50,.65);backface-visibility:hidden;transform:translate3d(115px,-17px,0) rotateY(90deg);">
            <div style="position:absolute;inset:0;background:#07090E;opacity:${dR};"></div>
          </div>
          <!-- body (white marble) -->
          <div style="position:absolute;left:-95px;top:-108px;width:190px;height:216px;background:linear-gradient(rgba(0,0,0,.24),rgba(0,0,0,0) 14px),linear-gradient(90deg,rgba(0,0,0,.1),rgba(0,0,0,0) 4px,rgba(0,0,0,0) calc(100% - 4px),rgba(0,0,0,.1)),url(${T.white}) 60px 20px/320px 320px;backface-visibility:hidden;transform:translate3d(-95px,-142px,0) rotateY(-90deg);">
            <div style="position:absolute;inset:0;background:linear-gradient(rgba(7,9,14,.05),rgba(7,9,14,.3)),rgba(7,9,14,${dL});"></div>
          </div>
          <div style="position:absolute;left:-95px;top:-108px;width:190px;height:216px;background:linear-gradient(rgba(0,0,0,.24),rgba(0,0,0,0) 14px),linear-gradient(90deg,rgba(0,0,0,.1),rgba(0,0,0,0) 4px,rgba(0,0,0,0) calc(100% - 4px),rgba(0,0,0,.1)),url(${T.white}) 200px 90px/320px 320px;backface-visibility:hidden;transform:translate3d(95px,-142px,0) rotateY(90deg);">
            <div style="position:absolute;inset:0;background:linear-gradient(rgba(7,9,14,.05),rgba(7,9,14,.3)),rgba(7,9,14,${dR});"></div>
          </div>
          <div style="position:absolute;left:-95px;top:-108px;width:190px;height:216px;box-sizing:border-box;background:linear-gradient(rgba(0,0,0,.24),rgba(0,0,0,0) 14px),linear-gradient(rgba(255,246,225,.14),rgba(7,9,14,.16)),linear-gradient(90deg,rgba(0,0,0,.1),rgba(0,0,0,0) 4px,rgba(0,0,0,0) calc(100% - 4px),rgba(0,0,0,.1)),url(${T.white}) ${mpos}/320px 320px;backface-visibility:hidden;transform:translate3d(0,-142px,95px);display:flex;justify-content:center;padding-top:30px;">
            <div style="width:156px;height:max-content;box-sizing:border-box;padding:9px 11px 11px;background:#39404F;color:#FFFFFF;border-radius:2px;box-shadow:inset 0 0 0 2px #4B5263,0 0 0 1px rgba(232,161,50,.75),2px 4px 5px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:5px;">
              <span style="font:700 9px/1 var(--font-display);letter-spacing:.14em;color:#01CBFE;">CASE ${num}</span>
              <span style="font:700 14px/1.1 var(--font-display);letter-spacing:-.01em;">${esc(p.name)}</span>
              <span style="font:500 10px/1.35 var(--font-body);color:#C2C7D1;">${esc(p.desc)}</span>
              <span style="font:700 13px/1 var(--font-display);font-variant-numeric:tabular-nums;color:#FFFFFF;margin-top:2px;">${esc(p.price)}</span>
            </div>
          </div>
          <!-- cap -->
          <div style="position:absolute;left:-101px;top:-101px;width:202px;height:202px;background:radial-gradient(circle,rgba(255,246,225,.4),rgba(255,246,225,0) 70%),url(${T.white}) ${mpos}/320px 320px;box-shadow:inset 0 0 0 2px #39404F;transform:translate3d(0,-258px,0) rotateX(90deg);"></div>
          <div style="position:absolute;left:-92px;top:-30px;width:184px;height:60px;background:radial-gradient(closest-side,rgba(8,11,18,.5),rgba(8,11,18,0));transform:translate3d(0,-259px,0) rotateX(90deg);"></div>
          <div style="position:absolute;left:-101px;top:-4px;width:202px;height:8px;background:url(${T.dark}) 0 0/300px 300px;box-shadow:inset 0 -1px 0 rgba(232,161,50,.7);backface-visibility:hidden;transform:translate3d(0,-254px,101px);"></div>
          <div style="position:absolute;left:-101px;top:-4px;width:202px;height:8px;background:url(${T.dark}) 0 0/300px 300px;box-shadow:inset 0 -1px 0 rgba(232,161,50,.7);backface-visibility:hidden;transform:translate3d(-101px,-254px,0) rotateY(-90deg);"></div>
          <div style="position:absolute;left:-101px;top:-4px;width:202px;height:8px;background:url(${T.dark}) 0 0/300px 300px;box-shadow:inset 0 -1px 0 rgba(232,161,50,.7);backface-visibility:hidden;transform:translate3d(101px,-254px,0) rotateY(90deg);"></div>
          <!-- product -->
          <div style="position:absolute;left:-92px;top:-102px;width:184px;height:204px;transform:translate3d(0,-364px,0);">
            ${slot}
          </div>
          <!-- glass vitrine -->
          <div style="position:absolute;left:-98px;top:-120px;width:196px;height:240px;box-sizing:border-box;background:rgba(214,232,255,.1);border-left:1px solid rgba(255,255,255,.7);border-right:1px solid rgba(255,255,255,.7);border-top:3px solid #39404F;border-bottom:3px solid #39404F;transform:translate3d(0,-378px,-98px);"></div>
          <div style="position:absolute;left:-98px;top:-120px;width:196px;height:240px;box-sizing:border-box;background:rgba(214,232,255,.13);border-left:2px solid #39404F;border-right:2px solid #39404F;border-top:3px solid #39404F;border-bottom:3px solid #39404F;transform:translate3d(-98px,-378px,0) rotateY(-90deg);"></div>
          <div style="position:absolute;left:-98px;top:-120px;width:196px;height:240px;box-sizing:border-box;background:rgba(214,232,255,.13);border-left:2px solid #39404F;border-right:2px solid #39404F;border-top:3px solid #39404F;border-bottom:3px solid #39404F;transform:translate3d(98px,-378px,0) rotateY(90deg);"></div>
          <div style="position:absolute;left:-98px;top:-98px;width:196px;height:196px;box-sizing:border-box;background:radial-gradient(circle,rgba(255,250,235,.5),rgba(255,250,235,0) 60%),rgba(236,244,255,.22);border:3px solid #39404F;transform:translate3d(0,-498px,0) rotateX(90deg);"></div>
          <div style="position:absolute;left:-98px;top:-120px;width:196px;height:240px;box-sizing:border-box;overflow:hidden;background:radial-gradient(ellipse 34% 12% at 50% 5%,rgba(255,252,240,.5),rgba(255,252,240,0)),rgba(214,232,255,.08);border-left:2px solid #39404F;border-right:2px solid #39404F;border-top:3px solid #39404F;border-bottom:3px solid #39404F;box-shadow:inset 0 0 22px rgba(255,255,255,.25);transform:translate3d(0,-378px,98px);">
            <div style="position:absolute;left:22px;top:-20px;width:18px;height:280px;background:rgba(255,255,255,.22);transform:skewX(-16deg);"></div>
            <div style="position:absolute;left:48px;top:-20px;width:6px;height:280px;background:rgba(255,255,255,.16);transform:skewX(-16deg);"></div>
          </div>
        </div>`;
}
