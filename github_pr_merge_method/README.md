# GitHub PR Merge Method

**Automatically set the correct merge method when viewing GitHub pull requests.**

This browser extension helps you control GitHub PR merge strategies based on repository and branch names. Since GitHub doesn't support automatic merge method selection, this extension prevents mistakes by automatically selecting your preferred merge strategy for each PR.

For example, you might want to squash all commits when merging feature branches, but use merge commits when merging to your main branch. This extension ensures the correct method is always selected, preventing costly merge mistakes.

## Features

- ✅ **Automatic Selection**: Automatically sets the merge method when you open a GitHub PR
- 🎯 **Rule-Based Control**: Define rules based on repository and branch names
- 💾 **Import/Export**: Backup and share your rules with JSON import/export
- 🔒 **Local Storage**: All rules are stored locally in your browser
- 🎨 **Clean UI**: Simple popup interface for managing rules

## Installation

### From Source (Development)

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked"
5. Select the `github_pr_merge_method` folder

### From Chrome Web Store

_Coming soon_

## Usage

### Adding a Rule

1. Click the extension icon in your browser toolbar
2. Fill in the rule details:
   - **Repository**: The GitHub repository (e.g., `facebook/react`)
   - **Branch**: The destination branch (e.g., `main`, `develop`)
   - **Merge Method**: Choose from Squash, Merge, or Rebase
3. Click "Add Rule"

### Managing Rules

- **View Rules**: All your rules are displayed in the popup
- **Delete Rule**: Click the delete button (🗑️) next to any rule
- **Clear All**: Click "Clear All Rules" to remove all rules at once

### Import/Export Rules

**Export:**

1. Click "Export Rules" to download your rules as a JSON file
2. Save the file for backup or sharing

**Import:**

1. Click "Import Rules"
2. Select a previously exported JSON file
3. Your rules will be imported (duplicates are prevented)

### Rule Schema

Rules are stored in JSON format with the following structure:

```json
{
  "version": "1.0.0",
  "rules": [
    {
      "id": "rule_1705312200000_abc123def",
      "repository": "facebook/react",
      "branch": "main",
      "mergeMethod": "squash",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## Examples

### Example 1: Always Squash to Main

- **Repository**: `mycompany/my-repo`
- **Branch**: `main`
- **Merge Method**: Squash

When you view any PR targeting the `main` branch in `mycompany/my-repo`, the squash method will be automatically selected.

### Example 2: Merge Commits for Release Branch

- **Repository**: `mycompany/my-repo`
- **Branch**: `release`
- **Merge Method**: Merge

This ensures that release branches use merge commits to preserve full commit history.

### Example 3: Rebase for Feature Integration

- **Repository**: `mycompany/my-repo`
- **Branch**: `develop`
- **Merge Method**: Rebase

Keeps a clean, linear history on the develop branch.

## Merge Methods

- **Squash**: Combines all commits into a single commit
- **Merge**: Creates a merge commit preserving all individual commits
- **Rebase**: Replays commits on top of the base branch for a linear history

## Rule Matching

Rules are matched based on **exact repository and branch names**:

- Repository format: `owner/repo` (e.g., `facebook/react`)
- Branch name: exact match (e.g., `main`, `develop`, `feature/new-feature`)
- One rule per repository-branch combination

**Note**: Wildcards are not currently supported. Each rule must specify exact repository and branch names.

## Privacy

This extension:

- ✅ Stores all data locally in your browser
- ✅ Does not collect or transmit any data
- ✅ Only accesses GitHub PR pages you visit
- ✅ Does not require account login or external services

## Permissions

- **Storage**: To save your rules locally in your browser
- **Content Scripts on GitHub**: To automatically set merge methods on PR pages

## Development

### Project Structure

```
github_pr_merge_method/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js             # Content script for GitHub pages
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── popup.css              # Popup styles
├── rules_utils.js         # Core rule validation and management
├── storage.js             # Storage abstraction
├── templates.js           # UI templates
├── constants.js           # Shared constants
└── *.test.js              # Test files
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# Create a production zip file
zip -r github-pr-merge-method-v1.0.0.zip . \
  -x "*.test.js" \
  -x "*.md" \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log"
```

## Troubleshooting

**Rules not applying?**

- Ensure you're on a GitHub PR page (URL matches `https://github.com/*/*/pull/*`)
- Check that your repository and branch names match exactly
- Verify the merge method button exists on the page

**Can't import rules?**

- Ensure the JSON file follows the correct schema
- Check that the file is valid JSON
- Verify the version matches (currently `1.0.0`)

**Extension not loading?**

- Try disabling and re-enabling the extension
- Check for conflicts with other GitHub extensions
- Look for errors in the browser console

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### TODO list

- [ ] Update rules list display with edit functionality
- [ ] Style options page with modern CSS
- [ ] Add rule limit (e.g., max 50 rules) with clear messaging

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. [Add your support email/website]

## Acknowledgments

Inspired by similar extensions that solve the problem of GitHub's lack of automatic merge method selection.

---

**Made with ❤️ for developers who care about their Git history**
