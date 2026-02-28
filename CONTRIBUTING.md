# 🤝 Contributing to UVerify Additional Templates

Thank you for your interest in contributing to UVerify Additional Templates! We value your input and collaboration. Please follow these guidelines to ensure a smooth contribution process.

## 📝 Guidelines

1. **Open an Issue First**
   Before starting work on a new template or modification, please open an issue in the repository to align with the project goals. This helps avoid duplicate efforts and ensures your contribution fits the project's vision.

2. **Semantic Commits**
   Use [semantic commit messages](https://www.conventionalcommits.org/) to maintain a clean and meaningful commit history. Examples:

   - `feat: add new event certificate template`
   - `fix: resolve layout issue in tadamon template`
   - `docs: update README with integration example`
   - `chore: update dependencies to latest versions`

3. **Sign the CLA**
   All contributors must sign the **Contributor License Agreement (CLA)** before their contributions can be merged. This ensures that the project remains open and accessible to everyone.

   - The bot will guide you through the signing process when you open a pull request.

4. **Pull Requests**

   - Fork the repository and create a new branch for your changes.
   - Ensure your template is well-structured and follows the patterns established in existing templates.
   - Submit a pull request with a clear description of your changes and the use case your template serves.

5. **Template Requirements**
   When contributing a new template, please ensure:

   - It extends the `Template` base class from `@uverify/core`.
   - It declares a `whitelist` if the template is intended for specific issuers only.
   - Any custom metadata fields are documented in `layoutMetadata`.
   - Assets (images, fonts, etc.) are included in the template's `src/assets/` directory.
   - The template follows Tailwind CSS v4 conventions.

6. **Testing**
   Please test your template visually in both the `uverify-ui` development environment and across common viewport sizes before submitting a pull request. Refer to the [Custom Templates documentation](https://docs.uverify.io/custom-templates) for integration instructions.

## 💡 Feature Requests

If you have an idea for a new template or a template feature, please open an issue and describe your proposal in detail. We encourage collaboration and will work with you to refine your idea.

## 📧 Need Help?

If you have any questions or need assistance, feel free to reach out to us at **[hello@uverify.io](mailto:hello@uverify.io)**.

Thank you for contributing to UVerify! 💙
