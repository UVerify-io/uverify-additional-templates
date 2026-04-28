import type { UVerifyCertificate } from '@uverify/core';
import Certificate from './Certificate';

/**
 * Development preview — simulates what UVerify injects at runtime.
 *
 * The certificate hash is the SHA-256 of the actual lab report PDF.
 * In this dev environment the file-drop verification compares against this hash.
 * Replace with a real SHA-256 of a test PDF to exercise the full flow locally.
 */
function App() {
  const certificate = new Certificate();

  // SHA-256 of the lab report PDF (the notarized document)
  const hash =
    'ab014ec3043bdf53a88d75aecf568e7924975571af58d566e30e6fd76dc823e4';

  const metadata = {
    uverify_template_id: 'foodAnalysisReport',

    // ── Public fields (always visible) ──────────────────────────────────────
    sample_id:        'PO-2024-08-1547',
    product_name:     'Bio Hafer Granola',
    product_category: 'Organic Cereal',
    analysis_date:    '2024-08-22',
    overall_result:   'PASS',

    // ── Gated fields (revealed after PDF integrity check) ───────────────────
    batch_number:           'BT-20240815-003',
    sampling_date:          '2024-08-15',
    client_name:            'NatureGrain GmbH',
    accreditation_number:   'DAKKS-PO-2024-1142',

    pesticide_residues_value:  '0.003 mg/kg',
    pesticide_residues_limit:  '≤ 0.010 mg/kg',
    pesticide_residues_result: 'PASS',

    heavy_metals_value:  'Pb 0.008 / Cd 0.001 mg/kg',
    heavy_metals_limit:  'Pb ≤ 0.020 / Cd ≤ 0.005 mg/kg',
    heavy_metals_result: 'PASS',

    mycotoxins_value:  'AFB1 < 0.1 μg/kg',
    mycotoxins_limit:  '≤ 4.0 μg/kg',
    mycotoxins_result: 'PASS',

    microbiology_value:  'TVC 8.2×10³ CFU/g',
    microbiology_limit:  '≤ 1.0×10⁵ CFU/g',
    microbiology_result: 'PASS',

    nutritional_compliance_value:  'Protein 12.1 g / Fat 6.8 g / Carbs 67.4 g per 100 g',
    nutritional_compliance_limit:  '± 20% of label claim',
    nutritional_compliance_result: 'PASS',

    notes: 'All parameters within EU regulatory limits per (EC) No 396/2005.',
  };

  const uVerifyCertificate: UVerifyCertificate = {
    hash,
    metadata: JSON.stringify(metadata),
    blockHash:
      '8c1c39da354d0e77d6b009cdeea4f9a85bd91c04d63dc6f26d673ad1823f9aee',
    blockNumber: 12127742,
    transactionHash:
      '84c6aade3bda02c6266ac55b7257fcdeebddb7af2ffb08dc6ab2a6def7eac954',
    address: 'addr1vqqj4545qe59w2jkaa6gf5xq00vu8kk2989553fk5qh4orcamfqq5',
    slot: 161002968,
    creationTime: 1724320800000,
    issuer: 'addr1vqqj4545qe59w2jkaa6gf5xq00vu8kk2989553fk5qh4orcamfqq5',
  };

  const background = certificate.theme.background ?? 'bg-[#F7F4EE]';

  return (
    <div className={`min-h-screen ${background} flex items-center justify-center py-12 px-4`}>
      {certificate.render(hash, metadata, uVerifyCertificate, <></>, {
        hashedMultipleTimes: false,
        firstDateTime: new Date(1724320800000).toDateString(),
        issuer: 'addr1vqqj4545qe59w2jkaa6gf5xq00vu8kk2989553fk5qh4orcamfqq5',
        serverError: false,
        isLoading: false,
      })}
    </div>
  );
}

export default App;
