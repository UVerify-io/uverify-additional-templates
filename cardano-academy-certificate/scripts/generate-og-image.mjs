// Renders og.png (1200x630) for link previews of Cardano Academy badges.
// The medal uses the same ada logo paths as src/Certificate.tsx, read from
// the source so the two never drift apart.
//
//   npm run og
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const certificateSource = fs.readFileSync(path.join(projectDirectory, 'src', 'Certificate.tsx'), 'utf8');
const adaPathsBlock = /const ADA_PATHS = \[([\s\S]*?)\];/.exec(certificateSource);
if (!adaPathsBlock) throw new Error('ADA_PATHS not found in src/Certificate.tsx');
const adaPaths = [...adaPathsBlock[1].matchAll(/"([^"]+)"/g)].map((match) => `<path d="${match[1]}" />`).join('');

const blue = '#0084ff';
const text = '#0d0d0d';
const textMuted = '#4a4f68';
const border = '#dde1ef';
const headerBorder = 'rgba(229,231,235,0.9)';

const medal = `
<svg viewBox="0 0 200 200" width="340" height="340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3399ff" />
      <stop offset="100%" stop-color="#0057b3" />
    </linearGradient>
    <linearGradient id="ribbon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0068cc" />
      <stop offset="100%" stop-color="#004494" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="rgba(0,87,179,0.28)" />
    </filter>
    <filter id="ribbon-shadow" x="-10%" y="-40%" width="120%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)" />
    </filter>
  </defs>
  <circle cx="100" cy="98" r="92" fill="url(#ring)" filter="url(#shadow)" />
  <circle cx="100" cy="98" r="86.5" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" stroke-dasharray="1.5 2.6" />
  <circle cx="100" cy="98" r="80" fill="white" />
  <circle cx="100" cy="98" r="75" fill="none" stroke="${border}" stroke-width="1" />
  <g transform="translate(86.5, 35) scale(0.1)" fill="${blue}">${adaPaths}</g>
  <text x="100" y="74" text-anchor="middle" font-size="6.5" font-family="Arial, sans-serif" fill="${blue}" font-weight="700" letter-spacing="2">CARDANO ACADEMY</text>
  <line x1="74" y1="81" x2="126" y2="81" stroke="${border}" stroke-width="1" />
  <text x="100" y="111" text-anchor="middle" font-size="10.5" font-family="Arial, sans-serif" fill="#1a2040" font-weight="700">Cardano Academy</text>
  <text x="100" y="125" text-anchor="middle" font-size="10.5" font-family="Arial, sans-serif" fill="#1a2040" font-weight="700">Badge</text>
  <g filter="url(#ribbon-shadow)">
    <path d="M 20,150 H 62 V 178 H 20 L 29,164 Z" fill="#003a7a" />
    <path d="M 180,150 H 138 V 178 H 180 L 171,164 Z" fill="#003a7a" />
    <path d="M 40,146 H 160 L 166,164 L 160,182 H 40 L 34,164 Z" fill="url(#ribbon)" />
  </g>
  <path d="M 70,164 L 75,169 L 84,159" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <text x="113" y="167.5" text-anchor="middle" font-size="8" font-family="Arial, sans-serif" fill="white" font-weight="700" letter-spacing="1.8">VERIFIED</text>
</svg>`;

const logo = `
<div style="display:flex;align-items:center;gap:14px">
  <svg width="58" height="54" viewBox="0 0 272 251.17" xmlns="http://www.w3.org/2000/svg"><g fill="${blue}">${adaPaths}</g></svg>
  <div style="line-height:1;font-family:Arial, sans-serif;font-weight:800;letter-spacing:1px;font-size:21px">
    <div style="color:${text}">CARDANO</div>
    <div style="color:${blue};margin-top:5px">ACADEMY</div>
  </div>
</div>`;

const html = `<!doctype html><html><head><style>
  body {
    margin: 0; width: 1200px; height: 630px; overflow: hidden;
    font-family: "Inter", "Helvetica Neue", Arial, sans-serif; color: ${text};
    background-color: #f5f6fa;
    background-image: radial-gradient(#c6c6c6 1.6px, transparent 1.6px);
    background-size: 36px 36px;
    display: flex; flex-direction: column;
  }
  header {
    height: 118px; padding: 0 56px; box-sizing: border-box;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(245,246,250,0.72);
    border-top: 2px solid ${headerBorder}; border-bottom: 2px solid ${headerBorder};
  }
  .verify { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 600; color: #00be7a; }
  main { flex: 1; display: flex; align-items: center; gap: 72px; padding: 0 56px 0 96px; }
  h1 { margin: 0 0 18px; font-size: 62px; line-height: 1.1; font-weight: 700; letter-spacing: -0.5px; }
  p { margin: 0; font-size: 28px; line-height: 1.45; color: ${textMuted}; max-width: 620px; }
  .tags { display: flex; gap: 12px; margin-top: 30px; }
  .tag { padding: 10px 22px; border: 2px solid #b8c0da; border-radius: 999px; background: #e6f3ff; color: ${blue}; font-size: 22px; font-weight: 600; }
</style></head><body>
  <header>
    ${logo}
    <div class="verify">
      <svg width="34" height="34" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#00be7a" /><path d="M5 10.5L8.5 14L15 7" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>
      Verified on Cardano
    </div>
  </header>
  <main>
    ${medal}
    <div>
      <h1>Cardano Academy Badge</h1>
      <p>Issued by the Cardano Foundation and anchored on the Cardano blockchain. Open the link to verify the badge.</p>
      <div class="tags"><span class="tag">Tamper-proof</span><span class="tag">Privacy-preserving</span><span class="tag">uverify.io</span></div>
    </div>
  </main>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
const outputPath = path.join(projectDirectory, 'og.png');
await page.screenshot({ path: outputPath });
await browser.close();
console.log(`generated ${outputPath}`);
