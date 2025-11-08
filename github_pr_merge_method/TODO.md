# GitHub Merge Method Auto-Selector Extension - TODO

## Development steps

- [ ] Update rules list display with edit functionality
- [ ] Style options page with modern CSS
- [ ] Add rule limit (e.g., max 50 rules) with clear messaging

## Publish steps

- [ ] Add screenshots (1280x800 or 640x400 recommended)
- [ ] Add promotional images (varies by store)
- [ ] Add license information
- [ ] Create zip file

```bash
#!/bin/bash
# build.sh

EXTENSION_DIR="github_pr_merge_method"
OUTPUT_NAME="github-pr-merge-method-v1.0.0.zip"

cd "$EXTENSION_DIR"

zip -r "../$OUTPUT_NAME" . \
  -x "*.test.js" \
  -x "*.md" \
  -x "TODO.md" \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".gitignore" \
  -x "*.log"

echo "Package created: $OUTPUT_NAME"
```

See existing extensions:

- [github-pr-merge-strategy](https://chromewebstore.google.com/detail/github-pr-merge-strategy/nhejampjhfhnalboieehcfhehmmfljhg)
- [github-pr-merge-button-cu](https://chromewebstore.google.com/detail/github-pr-merge-button-cu/bpafckemfjmkpojmcikjnhlcnohpejbn)
