# cardano-academy-certificate

UVerify template for Cardano Academy badges issued by the Cardano Foundation. Template ID: `cardanoAcademyCertificate`.

The page renders a medal-style badge, the course description, skills and earning criteria, a blockchain verification box, PDF download and a share dialog (link, QR code, LinkedIn "Add to profile", social networks, embed snippet). It is optimised for print (A4 landscape, single page with QR code) and for phone widths.

## Development

```bash
npm install
npm run dev
```

`src/App.tsx` renders a sample badge with mock certificate data. Preview switches:

| Query parameter | Effect |
|---|---|
| `?badge=<catalog key>` | Preview another badge, e.g. `?badge=CBCA_CERTIFICATION` |
| `?preview=hashed` | Show the privacy-protected state (name not revealed) |
| `?backend=<url>` | Point the issuer credential lookup at another backend |

UVerify only imports `src/Certificate.tsx`. Run `npm run lint` and `npm run build` before opening a pull request.

`og.png` is the Open Graph image (1200x630) shown in link previews. Regenerate it with `npm run og` after changing the badge design, the script reads the ada logo paths from `src/Certificate.tsx`.

## On-chain metadata

A badge certificate carries three fields. All long texts (badge description, skills, earning criteria) are fixed in `BADGE_CATALOG` inside `src/Certificate.tsx` and resolved from `badgeId`, which keeps a certificate at about 140 bytes of metadata.

| Field | Example | Notes |
|---|---|---|
| `badgeId` | `BLOCKCHAIN_FUNDAMENTALS` | Catalog key. Old slug IDs such as `blockchain-fundamentals` still resolve through `LEGACY_BADGE_IDS`. |
| `uv_url_name` | `b2ac2ef4…8f77` | `sha256("<name>~<salt>")`. The UI reveals the name only when `?name=<name>~<salt>` matches, otherwise the badge shows "privacy-protected recipient". |
| `issuedAt` | `2026-04-02` | `YYYY-MM-DD`, rendered as "April 02, 2026". Falls back to the transaction time. |
| `uverify_update_policy` | `restricted` | Only the issuing wallet can add versions to a badge. Must be set in the first submission, the page applies no default. The template pre-selects it in the creation form. |

The issuer name is fixed to Cardano Foundation. When a new badge appears in the Academy export, add its texts to `BADGE_CATALOG` under a new enum key.

Metadata for the sandbox deployment is generated from the Academy CSV export with `sandbox/simulator/build-academy-plan.py` in [uverify-examples](https://github.com/UVerify-io/uverify-examples), see the simulator README there.

## Issuer restriction

Only badges signed by the Cardano Foundation wallet render as Academy badges. The template compares `certificate.address`, the hex payment credential of the signing wallet, with `ISSUER.paymentCredential` (`5a8dd1a6…83ae3`, shared by the mainnet address `addr1q9dgm5dx…evsym9` and the preprod address `addr_test1qpdgm5dx…66dyh6`). A certificate from any other wallet renders a "not an official Cardano Academy badge" notice with the signing address and the hash instead of the badge. Preview it with `?issuer=other` in the dev harness.

The same two addresses are set as the template `whitelist`, which hides the template in the creation form for other wallets. That check runs in the creation UI only, the display-time check above is what protects recipients.

## Issuer identity (vLEI binding)

The template resolves the issuing wallet's `IdentityAuth` credential at render time. `useIssuerCredential` calls `GET {backendUrl}/api/v1/credential/{issuerPaymentCredential}?type=identity` using the payment credential the UI passes as `extra.issuer` and `this.uverifyConfig.backendUrl`. A `404` leaves the page unchanged, so badges issued before the binding keep working, and nothing about the issuer link is stored on-chain: the target can change any time without reissuing badges.

| Credential state | "Issued by Cardano Foundation" links to | Badge next to it |
|---|---|---|
| No active credential | https://cardanofoundation.org | none |
| Credential indexed, `keriVerified: false` | `/verify/<authHash>` (the identity certificate) | Amber "Issuer identity registered" |
| Credential indexed, `keriVerified: true` | `/verify/<authHash>` | Green "Verified issuer identity" (or the legal name when the API returns `acdc.legalName`) |

`/verify/<authHash>` renders the built-in `IdentityAuth` template of uverify-ui with the AID, schema and OOBI of the binding. The AUTH certificate must keep `uverify_template_id: IdentityAuth`, since the backend indexer only indexes certificates with that ID. Explanatory content about the vLEI (what it is, why it proves the Cardano Foundation) therefore belongs either into that built-in template or into this template as an explanation panel that links to the identity certificate.

To issue the binding, the wallet that issues the badges submits an `IdentityAuth` certificate with `t: "AUTH"`, `ct: "identity"`, `i: <Legal Entity AID>`, `s: <ACDC schema SAID>`, `o: <OOBI>` and `p: <qb64 signature of "cardano:<paymentCredential>">`. For the sandbox, `sandbox/simulator/bind-issuer-identity.ts` in uverify-examples does this for the simulator wallet.

To make the binding mandatory, uncomment `requiredCredentials = ['identity']` in the template class. Certificates from wallets without an active identity credential then fall back to the default UVerify template.

## Registering the template

Add an entry to `additional-templates.json` in uverify-ui. The `name` becomes the template ID, so it has to be `cardanoAcademyCertificate`. `ogImage` makes the UI build copy the link preview image to `public/og/cardanoAcademyCertificate.png`:

```json
{
  "type": "repository",
  "name": "cardanoAcademyCertificate",
  "url": "https://github.com/UVerify-io/uverify-additional-templates",
  "commit": "<commit>",
  "path": "cardano-academy-certificate/src/Certificate.tsx",
  "ogImage": "cardano-academy-certificate/og.png"
}
```

## License

This template is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), see [LICENSE](LICENSE). The UVerify core (`uverify-ui`, `uverify-backend`) is licensed under the AGPL-3.0. Custom templates are dynamically imported extension points and do not fall under the AGPL-3.0.
