# UVerify Additional Templates

This repository contains external UI certificate templates for [UVerify](https://app.uverify.io) that have been outsourced from the main [uverify-ui](https://github.com/UVerify-io/uverify-ui) repository due to user-specific or use-case-specific restrictions — for example, templates that include proprietary logos, custom branding, or designs tailored to a particular organization or event that are not suitable for the general-purpose template library.

## What are UVerify Templates?

UVerify templates define how a certificate is rendered in the browser when someone verifies a hash on the Cardano blockchain. Each template is a React component that extends the `Template` base class from `@uverify/core` and implements a `render()` method.

Templates can be scoped to specific issuer addresses via a `whitelist`, carry their own theme configuration, and declare custom metadata fields that they expect to receive alongside a certificate.

## Creating a Custom Template

Templates are scaffolded and registered using the **UVerify CLI**. Refer to the documentation for a step-by-step guide:

- [Custom Templates — docs.uverify.io](https://docs.uverify.io/custom-templates)

A minimal template looks like this:

```tsx
import { Template, type UVerifyConfig, type UVerifyCertificate, type UVerifyMetadata, type UVerifyCertificateExtraData } from '@uverify/core';
import type { JSX } from 'react';

class MyTemplate extends Template {
  public name = 'MyTemplate';

  constructor(uverifyConfig: UVerifyConfig) {
    super(uverifyConfig);
  }

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    return <div>Certificate hash: {hash}</div>;
  }
}

export default MyTemplate;
```

## Templates in this Repository

| Template | Description |
|---|---|
| `social-hub` | Connected-goods social profile page, built for the Cardano Buidler Fest 2025 t-shirt experience |
| `tadamon` | CSO certificate template for the UNDP Tadamon programme |

## Integrating Templates into UVerify UI

Templates in this repository are consumed by `uverify-ui` via the `additional-templates.json` file. You can reference a template either as a local file path or by pinning a specific commit from a Git repository:

```json
[
  {
    "type": "file",
    "name": "MyTemplate",
    "path": "../uverify-additional-templates/my-template/src/Certificate.tsx"
  },
  {
    "type": "repository",
    "name": "MyTemplate",
    "url": "https://github.com/UVerify-io/uverify-additional-templates",
    "commit": "abc1234",
    "path": "my-template/src/Certificate.tsx"
  }
]
```

See the [Custom Templates documentation](https://docs.uverify.io/custom-templates) for full configuration details.

## Links

- [UVerify App](https://app.uverify.io)
- [Documentation](https://docs.uverify.io)
- [Custom Templates Guide](https://docs.uverify.io/custom-templates)
- [UVerify UI Repository](https://github.com/UVerify-io/uverify-ui)
- [GitHub Organization](https://github.com/UVerify-io)

## License

The templates in this repository are licensed under the [Apache License 2.0](./LICENSE).
