import {
  Template,
  type ThemeSettings,
  type UVerifyCertificate,
  type UVerifyCertificateExtraData,
  type UVerifyMetadata,
} from '@uverify/core';
import { useState, useCallback, useRef, type JSX } from 'react';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = {
  green:      '#2A7A4B',
  greenLight: '#3A9B60',
  greenMuted: '#E8F5EE',
  amber:      '#D4891A',
  amberLight: '#FEF3DC',
  cream:      '#F7F4EE',
  dark:       '#1C2B1F',
  muted:      '#5C7060',
  border:     '#D6D0C4',
  red:        '#B91C1C',
  redMuted:   '#FEE2E2',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(val: string | number | boolean | null): string {
  if (!val) return '—';
  try {
    return new Date(String(val)).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return String(val);
  }
}

function shortHash(hash: string): string {
  if (!hash || hash.length < 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PureOriginLogo(): JSX.Element {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PureOrigin logo">
      <path d="M14 10 L14 24 L8 36 Q7 38 9 38 L35 38 Q37 38 36 36 L30 24 L30 10 Z"
        fill="#ffffff" stroke={BRAND.greenLight} strokeWidth="2" strokeLinejoin="round" />
      <rect x="11" y="8" width="22" height="4" rx="2" fill={BRAND.green} />
      <path d="M16 26 L10 36 Q9.5 37.5 11 38 L33 38 Q34.5 38 34 36 L28 26 Z"
        fill={BRAND.green} opacity="0.85" />
      <path d="M22 8 C22 8 22 2 27 1 C27 1 27 6 22 8 Z" fill={BRAND.greenLight} />
      <path d="M22 8 C22 8 22 2 17 1 C17 1 17 6 22 8 Z" fill={BRAND.green} />
      <line x1="22" y1="2" x2="22" y2="8" stroke={BRAND.green} strokeWidth="1.5" />
      <circle cx="16" cy="33" r="1.5" fill="white" opacity="0.5" />
      <circle cx="21" cy="35" r="1"   fill="white" opacity="0.4" />
      <circle cx="26" cy="32" r="1.5" fill="white" opacity="0.5" />
    </svg>
  );
}

function ResultBadge({ value, large = false }: { value: string | number | boolean | null; large?: boolean }): JSX.Element {
  const str    = String(value ?? '').toUpperCase();
  const isPass = str === 'PASS';
  const isFail = str === 'FAIL';
  const icon   = isPass ? '✓' : isFail ? '✗' : '—';
  const label  = isPass ? 'PASS' : isFail ? 'FAIL' : str || '—';

  if (large) {
    const bg = isPass ? BRAND.green : isFail ? BRAND.red : '#6B7280';
    return (
      <div style={{ backgroundColor: bg }}
        className="inline-flex items-center gap-3 px-8 py-3 rounded-xl text-white font-bold text-xl tracking-widest">
        <span className="text-2xl">{icon}</span>{label}
      </div>
    );
  }

  const bg   = isPass ? BRAND.greenMuted : isFail ? BRAND.redMuted : '#F3F4F6';
  const text = isPass ? BRAND.green      : isFail ? BRAND.red      : '#6B7280';
  return (
    <span style={{ backgroundColor: bg, color: text }}
      className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap">
      {icon} {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-start py-2" style={{ borderBottom: `1px solid ${BRAND.border}` }}>
      <dt style={{ color: BRAND.muted }} className="w-44 shrink-0 text-xs font-medium uppercase tracking-wider">{label}</dt>
      <dd style={{ color: BRAND.dark  }} className="flex-1 text-sm font-semibold">{value || '—'}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: string }): JSX.Element {
  return (
    <h2 style={{ color: BRAND.amber, borderBottom: `2px solid ${BRAND.amber}` }}
      className="text-xs font-bold uppercase tracking-widest pb-1 mb-3">
      {children}
    </h2>
  );
}

// ── File-drop verification panel ──────────────────────────────────────────────
type VerifyState = 'idle' | 'hashing' | 'match' | 'mismatch';

function FileDropGate({
  expectedHash,
  onVerified,
}: {
  expectedHash: string;
  onVerified: () => void;
}): JSX.Element {
  const [state, setState] = useState<VerifyState>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setState('hashing');
    try {
      const computed = await sha256File(file);
      if (computed === expectedHash) {
        setState('match');
        onVerified();
      } else {
        setState('mismatch');
      }
    } catch {
      setState('mismatch');
    }
  }, [expectedHash, onVerified]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (state === 'match') {
    return (
      <div style={{ backgroundColor: BRAND.greenMuted, border: `1px solid ${BRAND.green}40` }}
        className="rounded-xl px-5 py-4 flex items-center gap-3">
        <span style={{ color: BRAND.green }} className="text-2xl">✓</span>
        <div>
          <p style={{ color: BRAND.green }} className="text-sm font-bold">Report integrity confirmed</p>
          <p style={{ color: BRAND.muted }} className="text-xs mt-0.5 font-mono">{fileName}</p>
        </div>
      </div>
    );
  }

  if (state === 'mismatch') {
    return (
      <div style={{ backgroundColor: BRAND.redMuted, border: `1px solid ${BRAND.red}40` }}
        className="rounded-xl px-5 py-4 flex items-center gap-3">
        <span style={{ color: BRAND.red }} className="text-2xl">✗</span>
        <div>
          <p style={{ color: BRAND.red }} className="text-sm font-bold">Hash mismatch — file does not match this certificate</p>
          <p style={{ color: BRAND.muted }} className="text-xs mt-0.5 font-mono">{fileName}</p>
          <button onClick={() => setState('idle')}
            style={{ color: BRAND.red }} className="text-xs underline mt-1">
            Try another file
          </button>
        </div>
      </div>
    );
  }

  const borderColor = dragging ? BRAND.green : BRAND.border;
  const bgColor     = dragging ? BRAND.greenMuted : '#FAFAF9';

  return (
    <div
      style={{ border: `2px dashed ${borderColor}`, backgroundColor: bgColor, transition: 'all 0.15s' }}
      className="rounded-xl px-6 py-8 flex flex-col items-center gap-3 cursor-pointer"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={onInputChange} />

      {state === 'hashing' ? (
        <>
          <svg style={{ color: BRAND.green }} className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p style={{ color: BRAND.muted }} className="text-sm">Computing SHA-256…</p>
        </>
      ) : (
        <>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={dragging ? BRAND.green : BRAND.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="12" y2="12"/>
            <line x1="15" y1="15" x2="12" y2="12"/>
          </svg>
          <div className="text-center">
            <p style={{ color: BRAND.dark }} className="text-sm font-semibold">
              {dragging ? 'Release to verify' : 'Drop the lab report PDF here'}
            </p>
            <p style={{ color: BRAND.muted }} className="text-xs mt-1">
              or <span style={{ color: BRAND.green }} className="underline cursor-pointer">browse to select</span>
            </p>
          </div>
          <p style={{ color: BRAND.muted }} className="text-xs text-center max-w-xs">
            The file is hashed locally in your browser. Nothing is uploaded.
            A matching SHA-256 proves this is the exact report notarized on-chain.
          </p>
        </>
      )}
    </div>
  );
}

// ── Analyte result table ───────────────────────────────────────────────────────
interface TestCategory {
  label:      string;
  valueKey:   string;
  limitKey:   string;
  resultKey:  string;
}

const TEST_CATEGORIES: TestCategory[] = [
  { label: 'Pesticide Residues',     valueKey: 'pesticide_residues_value',        limitKey: 'pesticide_residues_limit',        resultKey: 'pesticide_residues_result' },
  { label: 'Heavy Metals',           valueKey: 'heavy_metals_value',              limitKey: 'heavy_metals_limit',              resultKey: 'heavy_metals_result' },
  { label: 'Mycotoxins',             valueKey: 'mycotoxins_value',                limitKey: 'mycotoxins_limit',                resultKey: 'mycotoxins_result' },
  { label: 'Microbiology',           valueKey: 'microbiology_value',              limitKey: 'microbiology_limit',              resultKey: 'microbiology_result' },
  { label: 'Nutritional Compliance', valueKey: 'nutritional_compliance_value',    limitKey: 'nutritional_compliance_limit',    resultKey: 'nutritional_compliance_result' },
];

function AnalyteTable({ metadata }: { metadata: UVerifyMetadata }): JSX.Element {
  const rows = TEST_CATEGORIES.filter(cat => metadata[cat.resultKey] !== undefined);

  return (
    <div style={{ border: `1px solid ${BRAND.border}` }} className="rounded-xl overflow-hidden">
      {/* Header */}
      <div style={{ backgroundColor: BRAND.dark }} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-5 py-2.5">
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Category</span>
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest text-right">Measured</span>
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest text-right">Limit</span>
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest text-right">Result</span>
      </div>
      {/* Rows */}
      {rows.map((cat, idx) => (
        <div
          key={cat.resultKey}
          style={{
            backgroundColor: idx % 2 === 0 ? '#FAFAF9' : '#ffffff',
            borderTop: `1px solid ${BRAND.border}`,
          }}
          className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-5 py-3"
        >
          <span style={{ color: BRAND.dark }} className="text-sm font-medium">{cat.label}</span>
          <span style={{ color: BRAND.muted }} className="text-xs font-mono text-right">
            {String(metadata[cat.valueKey] ?? '—')}
          </span>
          <span style={{ color: BRAND.muted }} className="text-xs font-mono text-right">
            {String(metadata[cat.limitKey] ?? '—')}
          </span>
          <div className="flex justify-end">
            <ResultBadge value={metadata[cat.resultKey]} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Template class ─────────────────────────────────────────────────────────────
class FoodAnalysisReport extends Template {
  public name = 'Food Analysis Report';

  public theme: Partial<ThemeSettings> = {
    background: `bg-[${BRAND.cream}]`,
    footer: { hide: false },
  };

  public layoutMetadata = {
    // Public
    sample_id:        'Unique sample identifier (e.g. PO-2024-08-1547)',
    product_name:     'Name of the analysed product',
    product_category: 'Product category (e.g. Organic Cereal, Dairy)',
    analysis_date:    'Date the analysis was completed (ISO 8601, e.g. 2024-08-22)',
    overall_result:   'Overall verdict: PASS or FAIL',
    // Gated — revealed after PDF verification
    batch_number:           'Batch / lot number',
    sampling_date:          'Date the sample was taken (ISO 8601)',
    client_name:            'Client / submitter organisation name',
    accreditation_number:   'Laboratory accreditation number',
    pesticide_residues_value:        'Measured value (e.g. 0.003 mg/kg)',
    pesticide_residues_limit:        'Regulatory limit (e.g. ≤ 0.010 mg/kg)',
    pesticide_residues_result:       'PASS or FAIL',
    heavy_metals_value:              'Measured value',
    heavy_metals_limit:              'Regulatory limit',
    heavy_metals_result:             'PASS or FAIL',
    mycotoxins_value:                'Measured value',
    mycotoxins_limit:                'Regulatory limit',
    mycotoxins_result:               'PASS or FAIL',
    microbiology_value:              'Measured value',
    microbiology_limit:              'Regulatory limit',
    microbiology_result:             'PASS or FAIL',
    nutritional_compliance_value:    'Measured value (optional)',
    nutritional_compliance_limit:    'Regulatory limit (optional)',
    nutritional_compliance_result:   'PASS or FAIL (optional)',
    notes: 'Additional notes or regulatory references (optional)',
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    pagination: JSX.Element,
    extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    if (extra.isLoading) {
      return (
        <div style={{ color: BRAND.muted }} className="flex items-center justify-center h-64 text-base font-medium">
          Loading report…
        </div>
      );
    }

    if (extra.serverError) {
      return (
        <div className="flex items-center justify-center h-64 text-base font-medium text-red-600">
          Error loading certificate. Please try again later.
        </div>
      );
    }

    return <FoodReportCard
      hash={hash}
      metadata={metadata}
      certificate={certificate}
      pagination={pagination}
      extra={extra}
    />;
  }
}

// ── Stateful card (hooks require a function component) ─────────────────────────
function FoodReportCard({
  hash,
  metadata,
  certificate,
  pagination,
  extra,
}: {
  hash: string;
  metadata: UVerifyMetadata;
  certificate: UVerifyCertificate | undefined;
  pagination: JSX.Element;
  extra: UVerifyCertificateExtraData;
}): JSX.Element {
  const [verified, setVerified] = useState(false);

  const notarizedDate = certificate
    ? formatDate(new Date(certificate.creationTime).toISOString())
    : extra.firstDateTime
      ? formatDate(extra.firstDateTime)
      : '—';

  return (
    <div
      style={{ backgroundColor: '#ffffff', border: `1px solid ${BRAND.border}`, fontFamily: "'Inter','system-ui',sans-serif" }}
      className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg overflow-hidden"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: BRAND.green }} className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PureOriginLogo />
            <div>
              <p className="text-white font-bold text-lg leading-tight tracking-tight">PureOrigin</p>
              <p className="text-white/70 text-xs tracking-widest uppercase">Food Analytics</p>
            </div>
          </div>
          {metadata.accreditation_number && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
              className="text-right rounded-lg px-3 py-2">
              <p className="text-white/70 text-[10px] uppercase tracking-widest">ISO/IEC 17025 Accredited</p>
              <p className="text-white font-mono text-xs font-semibold mt-0.5">{String(metadata.accreditation_number)}</p>
            </div>
          )}
        </div>
      </header>

      <div style={{ backgroundColor: BRAND.amber }} className="h-1" />

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-6">

        {/* Title + overall verdict */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ color: BRAND.dark }} className="text-2xl font-extrabold tracking-tight">Food Analysis Report</h1>
            <p style={{ color: BRAND.muted }} className="text-xs mt-0.5 uppercase tracking-widest">
              Blockchain-Verified Certificate · Cardano
            </p>
          </div>
          <ResultBadge value={metadata.overall_result} large />
        </div>

        {/* Public summary ─────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Summary</SectionTitle>
          <dl>
            <InfoRow label="Sample ID"       value={String(metadata.sample_id       ?? '')} />
            <InfoRow label="Product"         value={String(metadata.product_name    ?? '')} />
            <InfoRow label="Category"        value={String(metadata.product_category ?? '')} />
            <InfoRow label="Analysis Date"   value={formatDate(metadata.analysis_date)} />
          </dl>
        </section>

        {/* PDF integrity gate ─────────────────────────────────────────── */}
        <section>
          <SectionTitle>
            {verified ? 'Detailed Results (Verified)' : 'Detailed Results'}
          </SectionTitle>

          {!verified && (
            <>
              <p style={{ color: BRAND.muted }} className="text-xs mb-3">
                Drop the original lab report PDF to prove file integrity and unlock the full analyte results.
                Hashing happens locally — the file never leaves your device.
              </p>
              <FileDropGate expectedHash={hash} onVerified={() => setVerified(true)} />
            </>
          )}

          {verified && (
            <div className="space-y-4">
              {/* Additional sample details */}
              <dl>
                <InfoRow label="Batch Number"   value={String(metadata.batch_number   ?? '')} />
                <InfoRow label="Sampling Date"  value={formatDate(metadata.sampling_date)} />
                <InfoRow label="Client"         value={String(metadata.client_name    ?? '')} />
              </dl>

              {/* Analyte table */}
              <AnalyteTable metadata={metadata} />

              {/* Notes */}
              {metadata.notes && (
                <p style={{ color: BRAND.muted, backgroundColor: BRAND.amberLight, borderLeft: `3px solid ${BRAND.amber}` }}
                  className="text-xs px-4 py-3 rounded-r-lg">
                  {String(metadata.notes)}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Blockchain verification ─────────────────────────────────────── */}
        <section>
          <SectionTitle>Blockchain Verification</SectionTitle>
          <div style={{ backgroundColor: BRAND.dark }} className="rounded-xl px-5 py-4 font-mono">
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-start gap-3">
                <span className="text-white/40 w-20 shrink-0">Notarized</span>
                <span className="text-white/80">{notarizedDate}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white/40 w-20 shrink-0">Hash</span>
                <span className="text-white/80 break-all">{shortHash(hash)}</span>
              </div>
              {certificate && (
                <div className="flex items-start gap-3">
                  <span className="text-white/40 w-20 shrink-0">TX</span>
                  <span className="text-white/80 break-all">{shortHash(certificate.transactionHash)}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {pagination && <div>{pagination}</div>}

        {/* Block explorer link */}
        {certificate && (
          <div className="text-center">
            <a href={`https://cexplorer.io/tx/${certificate.transactionHash}`}
              target="_blank" rel="noopener noreferrer"
              style={{ color: BRAND.green, border: `1px solid ${BRAND.green}` }}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold hover:opacity-80 transition-opacity">
              View on Block Explorer
              <svg width="14" height="14" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                <path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: BRAND.dark, borderTop: `3px solid ${BRAND.amber}` }}
        className="px-8 py-4 flex items-center justify-between">
        <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-[10px] uppercase tracking-widest">
          PureOrigin Food Analytics GmbH · Certified Laboratory
        </p>
        <p style={{ color: 'rgba(255,255,255,0.30)' }} className="text-[10px] font-mono">
          Precision Science. Pure Results.
        </p>
      </footer>
    </div>
  );
}

export default FoodAnalysisReport;
