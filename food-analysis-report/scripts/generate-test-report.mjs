/**
 * Generates a pseudo lab report PDF for PureOrigin Food Analytics
 * and prints its SHA-256 hash so it can be pasted into App.tsx.
 *
 * Usage: node scripts/generate-test-report.mjs
 * Output: public/test-report.pdf
 */

import PDFDocument from 'pdfkit';
import { createWriteStream, createReadStream } from 'fs';
import { createHash } from 'crypto';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir  = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, '..', 'public');
const outPath = join(outDir, 'test-report.pdf');

await mkdir(outDir, { recursive: true });

// ── Brand colours ────────────────────────────────────────────────────────────
const GREEN  = '#2A7A4B';
const AMBER  = '#D4891A';
const DARK   = '#1C2B1F';
const MUTED  = '#5C7060';

// Draw a vector checkmark centred at (cx, cy) with given size and colour.
// PDFKit built-in fonts are Latin-1 only — the Unicode checkmark (U+2713)
// renders as garbage, so we draw the glyph as a path instead.
function drawCheck(cx, cy, size, color) {
  const s = size;
  doc.save()
     .strokeColor(color)
     .lineWidth(s * 0.18)
     .lineCap('round')
     .lineJoin('round')
     .moveTo(cx - s * 0.38, cy)
     .lineTo(cx - s * 0.08, cy + s * 0.32)
     .lineTo(cx + s * 0.42, cy - s * 0.32)
     .stroke()
     .restore();
}

// ── Report data (must match App.tsx metadata) ────────────────────────────────
const report = {
  sample_id:        'PO-2024-08-1547',
  product_name:     'Bio Hafer Granola',
  product_category: 'Organic Cereal',
  batch_number:     'BT-20240815-003',
  sampling_date:    '2024-08-15',
  analysis_date:    '2024-08-22',
  client_name:      'NatureGrain GmbH',
  accreditation:    'DAKKS-PO-2024-1142',
  overall_result:   'PASS',
  results: [
    { category: 'Pesticide Residues',     value: '0.003 mg/kg',              limit: '≤ 0.010 mg/kg',              result: 'PASS' },
    { category: 'Heavy Metals',           value: 'Pb 0.008 / Cd 0.001 mg/kg', limit: 'Pb ≤ 0.020 / Cd ≤ 0.005 mg/kg', result: 'PASS' },
    { category: 'Mycotoxins',             value: 'AFB1 < 0.1 μg/kg',         limit: '≤ 4.0 μg/kg',               result: 'PASS' },
    { category: 'Microbiology',           value: 'TVC 8.2×10³ CFU/g',        limit: '≤ 1.0×10⁵ CFU/g',           result: 'PASS' },
    { category: 'Nutritional Compliance', value: 'Prot 12.1g / Fat 6.8g / Carbs 67.4g / 100g', limit: '± 20% of label claim', result: 'PASS' },
  ],
  notes: 'All parameters within EU regulatory limits per (EC) No 396/2005.',
};

// ── Build PDF ────────────────────────────────────────────────────────────────
const doc = new PDFDocument({ size: 'A4', margin: 50 });
const stream = createWriteStream(outPath);
doc.pipe(stream);

const PAGE_W = doc.page.width;
const L = 50;   // left margin
const R = PAGE_W - 50; // right margin
const W = R - L;       // usable width

// Helper: horizontal rule
function rule(y, color = MUTED) {
  doc.save().strokeColor(color).lineWidth(0.5).moveTo(L, y).lineTo(R, y).stroke().restore();
}

// Helper: two-column row
function row(label, value, y) {
  doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label, L, y, { width: 130 });
  doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK).text(value, L + 140, y, { width: W - 140 });
}

// ── Header ───────────────────────────────────────────────────────────────────
doc.rect(L, 40, W, 60).fill(GREEN);

doc.font('Helvetica-Bold').fontSize(18).fillColor('white')
   .text('PureOrigin', L + 14, 54);
doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.7)')
   .text('FOOD ANALYTICS', L + 14, 76, { characterSpacing: 2 });

doc.font('Helvetica').fontSize(7).fillColor('rgba(255,255,255,0.6)')
   .text('ISO/IEC 17025 Accredited', R - 180, 55, { width: 170, align: 'right' });
doc.font('Helvetica-Bold').fontSize(8).fillColor('white')
   .text(report.accreditation, R - 180, 67, { width: 170, align: 'right' });

// Amber stripe
doc.rect(L, 100, W, 3).fill(AMBER);

// ── Title ────────────────────────────────────────────────────────────────────
doc.font('Helvetica-Bold').fontSize(16).fillColor(DARK)
   .text('FOOD ANALYSIS REPORT', L, 118);
doc.font('Helvetica').fontSize(8).fillColor(MUTED)
   .text('Blockchain-Verified Certificate  ·  Cardano', L, 138, { characterSpacing: 0.5 });

// Overall badge
const badgeX = R - 80;
doc.rect(badgeX, 112, 80, 26).fill(GREEN);
doc.font('Helvetica-Bold').fontSize(13).fillColor('white')
   .text(`✓  ${report.overall_result}`, badgeX, 119, { width: 80, align: 'center' });

rule(152, AMBER);

// ── Sample information ────────────────────────────────────────────────────────
let y = 162;
doc.font('Helvetica-Bold').fontSize(8).fillColor(AMBER)
   .text('SAMPLE INFORMATION', L, y, { characterSpacing: 1.5 });
rule(y + 12, AMBER);
y += 22;

const sampleInfo = [
  ['Sample ID',      report.sample_id],
  ['Product Name',   report.product_name],
  ['Category',       report.product_category],
  ['Batch Number',   report.batch_number],
  ['Sampling Date',  report.sampling_date],
  ['Analysis Date',  report.analysis_date],
  ['Client',         report.client_name],
];

for (const [label, value] of sampleInfo) {
  row(label, value, y);
  y += 16;
  rule(y - 2);
}

y += 16;

// ── Analysis results ──────────────────────────────────────────────────────────
doc.font('Helvetica-Bold').fontSize(8).fillColor(AMBER)
   .text('ANALYSIS RESULTS', L, y, { characterSpacing: 1.5 });
rule(y + 12, AMBER);
y += 22;

// Table header
doc.rect(L, y - 2, W, 16).fill(DARK);
doc.font('Helvetica-Bold').fontSize(7).fillColor('white');
doc.text('CATEGORY',        L + 4,       y + 2, { width: 140 });
doc.text('MEASURED VALUE',  L + 148,     y + 2, { width: 160 });
doc.text('LIMIT',           L + 312,     y + 2, { width: 130 });
doc.text('RESULT',          L + 446,     y + 2, { width: 50, align: 'right' });
y += 20;

for (let i = 0; i < report.results.length; i++) {
  const r = report.results[i];
  if (i % 2 === 0) doc.rect(L, y - 2, W, 16).fill('#FAFAF9');

  doc.font('Helvetica').fontSize(7).fillColor(DARK)
     .text(r.category, L + 4, y + 2, { width: 140 });
  doc.font('Helvetica').fontSize(7).fillColor(MUTED)
     .text(r.value,    L + 148, y + 2, { width: 160 });
  doc.font('Helvetica').fontSize(7).fillColor(MUTED)
     .text(r.limit,    L + 312, y + 2, { width: 130 });

  // Result badge
  const badgeColor = r.result === 'PASS' ? GREEN : '#B91C1C';
  doc.rect(L + 448, y, 42, 12).fill(badgeColor);
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor('white')
     .text(`✓ ${r.result}`, L + 449, y + 2, { width: 40, align: 'center' });

  rule(y + 14);
  y += 18;
}

y += 10;

// ── Notes ─────────────────────────────────────────────────────────────────────
doc.rect(L, y, 3, 26).fill(AMBER);
doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
   .text(report.notes, L + 10, y + 6, { width: W - 10 });
y += 36;

// ── Blockchain verification ───────────────────────────────────────────────────
y += 6;
doc.font('Helvetica-Bold').fontSize(8).fillColor(AMBER)
   .text('BLOCKCHAIN VERIFICATION', L, y, { characterSpacing: 1.5 });
rule(y + 12, AMBER);
y += 22;

doc.rect(L, y, W, 54).fill(DARK);
doc.font('Helvetica').fontSize(7).fillColor('rgba(255,255,255,0.4)')
   .text('Notarized', L + 10, y + 10);
doc.fillColor('rgba(255,255,255,0.8)')
   .text(report.analysis_date, L + 80, y + 10);

doc.fillColor('rgba(255,255,255,0.4)')
   .text('Hash', L + 10, y + 24);
doc.font('Courier').fontSize(6.5).fillColor('rgba(255,255,255,0.8)')
   .text('[SHA-256 of this PDF — see App.tsx]', L + 80, y + 24);

doc.font('Helvetica').fillColor('rgba(255,255,255,0.4)')
   .text('Network', L + 10, y + 38);
doc.fillColor('rgba(255,255,255,0.8)')
   .text('Cardano Mainnet', L + 80, y + 38);

y += 64;

// ── Footer ───────────────────────────────────────────────────────────────────
doc.rect(L, y + 4, W, 3).fill(AMBER);
doc.rect(L, y + 7, W, 22).fill(DARK);
doc.font('Helvetica').fontSize(7).fillColor('rgba(255,255,255,0.4)')
   .text('PureOrigin Food Analytics GmbH  ·  Certified Laboratory', L + 4, y + 13, { width: W / 2 });
doc.text('Precision Science. Pure Results.', R - 180, y + 13, { width: 176, align: 'right' });

doc.end();

// ── Wait for stream to finish, then hash ─────────────────────────────────────
await new Promise((resolve, reject) => {
  stream.on('finish', resolve);
  stream.on('error', reject);
});

const hash = await new Promise((resolve, reject) => {
  const h = createHash('sha256');
  const rs = createReadStream(outPath);
  rs.on('data', chunk => h.update(chunk));
  rs.on('end', () => resolve(h.digest('hex')));
  rs.on('error', reject);
});

console.log('');
console.log('✓ PDF written to: public/test-report.pdf');
console.log('');
console.log('SHA-256:', hash);
console.log('');
console.log('Paste this into App.tsx:');
console.log(`  const hash = '${hash}';`);
console.log('');
