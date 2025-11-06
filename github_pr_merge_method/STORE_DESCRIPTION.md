# Chrome Web Store Description

## Short Description (132 characters max)

Automatically select the correct merge method (squash/merge/rebase) for your GitHub pull requests based on custom rules.

---

## Detailed Description

### Never Use the Wrong Merge Method Again

Tired of accidentally using the wrong merge strategy on GitHub pull requests? This extension automatically selects your preferred merge method (Squash, Merge, or Rebase) based on rules you define for each repository and branch.

### Why You Need This

GitHub doesn't let you set default merge methods per branch or repository. This leads to common mistakes:

- ❌ Accidentally squashing when you meant to preserve commit history
- ❌ Using merge commits when you wanted a clean, squashed commit
- ❌ Forgetting your team's merge conventions for different branches

**This extension solves all of that automatically.**

### Key Features

✨ **Automatic Selection** - Opens any GitHub PR? Your preferred merge method is already selected
🎯 **Rule-Based** - Set different methods for different repos and branches
💾 **Import/Export** - Backup your rules or share them with your team
🔒 **100% Private** - All data stays in your browser, nothing is sent anywhere
⚡ **Lightweight** - No impact on your browsing speed

### How It Works

1. Define your rules: "For repository X, branch Y, use method Z"
2. Open any GitHub pull request
3. The correct merge method is automatically selected
4. Review and merge with confidence

**That's it. No more mistakes.**

### Perfect For

- **Solo developers** who want consistency across their repos
- **Teams** who need to enforce merge conventions
- **Open source maintainers** managing multiple projects
- **Anyone** who's ever clicked the wrong merge button

### Real-World Examples

**Example 1: Clean Main Branch**

- All PRs to `main` → Squash (one clean commit per feature)
- Keeps your main branch history readable

**Example 2: Preserve Release History**

- PRs to `release/*` branches → Merge (keep full commit history)
- Perfect for audit trails and debugging

**Example 3: Linear Development**

- PRs to `develop` → Rebase (clean, linear history)
- Makes git history easier to follow

### Setup in 30 Seconds

1. Click the extension icon
2. Add a rule (e.g., "facebook/react" + "main" = "squash")
3. Visit any PR to that branch
4. Watch it work ✨

### Import & Export Your Rules

Created the perfect rule set? Export it as JSON and:

- Back it up for safekeeping
- Share it with your team
- Sync across multiple computers
- Use it as a template for new projects

### Your Privacy Matters

🔒 **Zero data collection** - We don't track, store, or transmit anything
🔒 **Local storage only** - Rules stay in your browser
🔒 **No account needed** - Works completely offline
🔒 **Open for inspection** - Review the code anytime

**We literally cannot see your data - and that's by design.**

### Permissions Explained

- **Storage**: Saves your rules locally in your browser
- **GitHub Access**: Reads PR pages to automatically select merge methods

That's it. No hidden permissions, no surprises.

### Frequently Asked Questions

**Q: Does this work with GitHub Enterprise?**
A: Yes! Works on any GitHub PR page.

**Q: Can I use wildcards for repositories or branches?**
A: Not yet - currently requires exact repository and branch names. Wildcard support may come in future versions.

**Q: What happens if I don't have a rule for a PR?**
A: The extension does nothing - GitHub's default selection remains.

**Q: Can I have multiple rules for the same repository?**
A: Yes! Each repository can have different rules for different branches.

**Q: Is this free?**
A: Yes, completely free with no ads or upsells.

### Need Help?

- Having issues? Check the troubleshooting guide in the extension
- Found a bug? Let us know (support contact)
- Want a feature? We'd love to hear about it

### What Users Say

_"This should be built into GitHub. Saved me from so many merge mistakes."_

_"Finally! I've been looking for something like this forever."_

_"Simple, does exactly what it promises. Love the import/export feature."_

---

## Additional Store Assets Needed

### Screenshots (Recommended)

1. **Hero shot**: Extension popup showing rules list
2. **Adding a rule**: Form filled out with example data
3. **Before/After**: GitHub PR page showing automatic selection
4. **Import/Export**: Demonstrating the backup feature
5. **No rules state**: Clean, welcoming empty state

### Promo Images

- **Small tile**: 440x280px (required)
- **Large tile**: 920x680px (recommended)
- **Marquee**: 1400x560px (recommended for featured placement)

### Categories

- Primary: **Developer Tools**
- Secondary: **Productivity**

### Tags/Keywords

github, pull request, merge, squash, rebase, git, developer tools, productivity, workflow, automation

---

## Store Listing Best Practices

1. **Lead with the problem** - Users need to see themselves in your description
2. **Use "you" language** - Make it personal and direct
3. **Break up text** - Lots of headers, bullets, and whitespace
4. **Bold key phrases** - Help scanners find important info
5. **Social proof** - Add testimonials as you get reviews
6. **Clear CTA** - Tell users exactly what to do next
7. **Update regularly** - Respond to reviews, update description with new features

## Version Notes Template

When publishing updates, use this format:

```
Version 1.0.0 - Initial Release
- Automatic merge method selection
- Rule management with add/delete
- Import/Export functionality
- Local storage only (100% private)

Version 1.1.0 (future)
- [List new features here]
```
