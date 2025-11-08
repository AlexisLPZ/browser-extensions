# Privacy Policy for GitHub PR Merge Method

**Last Updated:** November 8, 2025

## Introduction

GitHub PR Merge Method ("the Extension") is committed to protecting your privacy. This privacy policy explains how the Extension handles your data.

## Data Collection

### What Data We Collect

The Extension stores the following data **locally in your browser**:

- **Rule Configurations**: Repository names, branch names, and merge method preferences you configure
- **Rule Metadata**: Rule IDs, creation timestamps, and update timestamps
- **Extension Settings**: Any preferences you configure within the Extension

### What Data We Do NOT Collect

The Extension does NOT collect, store, or transmit:

- Personal information (name, email, address, etc.)
- GitHub authentication credentials
- Browsing history
- Analytics or usage data
- Any information about your GitHub repositories or pull requests beyond what you explicitly configure

## Data Storage

All data is stored **locally** using Chrome's `storage.sync` or `storage.local` API:

- Data remains on your device and within your browser profile
- Data is synchronized across your devices if you're signed into Chrome (via Chrome Sync)
- No data is sent to external servers or third parties
- No data is collected by the Extension developer

## Data Usage

The Extension uses your locally stored data exclusively to:

1. Automatically select the appropriate merge method when you view GitHub pull requests
2. Display your configured rules in the Extension popup
3. Enable import/export functionality for backing up your rules

## Data Sharing

The Extension does NOT share your data with any third parties. All data processing happens locally in your browser.

## Permissions

The Extension requires the following permissions:

### Storage Permission

- **Purpose**: To save your rule configurations locally in your browser
- **Scope**: Local browser storage only
- **Data Access**: Only data you explicitly configure in the Extension

### Content Scripts on GitHub

- **Purpose**: To automatically set merge methods on GitHub pull request pages
- **Scope**: Only pages matching `https://github.com/*/*/pull/*`
- **Access**: Read-only access to detect repository name, branch name, and merge method buttons

The Extension does NOT:

- Access your GitHub account or authentication tokens
- Modify any GitHub data
- Access pages outside of GitHub pull request URLs
- Track your browsing activity

## Data Deletion

You can delete your data at any time:

### Delete Individual Rules

1. Open the Extension popup
2. Click the delete button (🗑️) next to any rule

### Delete All Rules

1. Open the Extension popup
2. Click "Clear All Rules"

### Complete Removal

To completely remove all Extension data:

1. Uninstall the Extension from Chrome
2. All locally stored data will be permanently deleted

## Data Export

You have full control over your data:

- **Export**: Download your rules as a JSON file for backup or transfer
- **Import**: Import previously exported rules
- **Portability**: Your exported data is in a standard JSON format

## Third-Party Services

The Extension does NOT:

- Use third-party analytics services
- Connect to external APIs or servers
- Embed third-party tracking scripts
- Share data with advertisers or data brokers

## Children's Privacy

The Extension does not knowingly collect data from children under 13. The Extension is designed for developers using GitHub and does not target children.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date at the top of this policy. Continued use of the Extension after changes constitutes acceptance of the updated policy.

## Contact

If you have questions or concerns about this privacy policy or the Extension's data practices, contact via the email adress on the main page of the extension.

## Compliance

This Extension complies with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) principles

## Your Rights

You have the right to:

- Access your data (via the Extension popup or export function)
- Delete your data (via the Extension interface or uninstallation)
- Export your data (via the export function)
- Modify your data (by editing or deleting rules)

## Open Source

This Extension is open source. You can review the source code to verify our privacy practices at: [Your Repository URL]

---

**Summary**: GitHub PR Merge Method stores your rule configurations locally in your browser. It does not collect, transmit, or share any personal data. You have complete control over your data and can delete it at any time.
