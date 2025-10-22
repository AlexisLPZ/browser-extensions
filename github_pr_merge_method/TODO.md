# GitHub Merge Method Auto-Selector Extension - TODO

## Feature Overview

Transform the dummy alert extension into a practical tool that automatically selects the default merge method on GitHub PR pages based on user-defined rules. Users can configure different merge methods for different repository/branch combinations.

## User Stories

- As a developer, I want to automatically set "Squash and merge" for feature branches going to `develop`
- As a developer, I want to automatically set "Create a merge commit" for releases going to `production`
- As a developer, I want to configure different rules for different repositories
- As a developer, I want to manage multiple rules without memory constraints

## Technical Architecture Decisions

### UI Choice: **Options Page** ✅

**Decision**: Use Options Page instead of Popup
**Rationale**:

- Need to manage multiple rules (repo + branch + merge method combinations)
- Requires form with add/edit/delete functionality
- Better UX for complex configuration
- More space for help text and rule management

### Storage: **localStorage** ✅

**Decision**: Use localStorage instead of chrome.storage API
**Rationale**:

- Cross-browser compatibility (Chrome, Edge, Firefox, Safari)
- No additional permissions needed
- Simple implementation
- Sync limitation acceptable for this use case

### Data Structure

```javascript
// localStorage key: "githubMergeRules"
{
  "rules": [
    {
      "id": "unique_id",
      "repo": "organization_1/repo_1",
      "branch": "develop",
      "mergeMethod": "squash"
    },
    {
      "id": "unique_id_2",
      "repo": "organization_1/repo_1",
      "branch": "production",
      "mergeMethod": "merge"
    }
  ]
}
```

## Implementation Steps

### Phase 1: Foundation Setup

- [ ] Update `manifest.json` to include options page
- [ ] Add `options.html` and `options.js` files
- [ ] Create basic HTML structure for rule management
- [ ] Implement localStorage helper functions (save/load/delete rules)

### Phase 2: Options Page Development

- [ ] Create form to add new rules (repo input, branch dropdown, merge method dropdown)
- [ ] Implement rule validation (repo format, required fields)
- [ ] Create rules list display with edit/delete functionality
- [ ] Add rule management (add, edit, delete, reorder)
- [ ] Implement data persistence to localStorage

### Phase 3: Content Script Enhancement

- [ ] Modify `content.js` to detect GitHub PR merge page
- [ ] Extract current repo and target branch from page
- [ ] Load user rules from localStorage
- [ ] Match current context against user rules
- [ ] Automatically select appropriate merge method
- [ ] Handle edge cases (no matching rule, invalid page state)

### Phase 4: UI/UX Polish

- [ ] Style options page with modern CSS
- [ ] Add helpful tooltips and descriptions
- [ ] Implement rule import/export functionality
- [ ] Add rule limit (e.g., max 50 rules) with clear messaging
- [ ] Add confirmation dialogs for destructive actions

### Phase 5: Testing & Edge Cases

- [ ] Test with various GitHub URL patterns
- [ ] Handle GitHub's dynamic content loading
- [ ] Test rule matching logic thoroughly
- [ ] Handle cases where merge options aren't available
- [ ] Test cross-browser compatibility

## Technical Considerations

### GitHub Page Detection

- Target: GitHub PR merge page (`/owner/repo/pull/123/merge`)
- Handle GitHub's SPA navigation
- Detect when merge options are loaded (may be async)

### Merge Method Mapping

```javascript
const MERGE_METHODS = {
  squash: "Squash and merge",
  merge: "Create a merge commit",
  rebase: "Rebase and merge",
};
```

### Rule Matching Logic

- Exact repo match: `currentRepo === rule.repo`
- Branch matching: Support wildcards (`*` for any branch)
- Priority: First matching rule wins (or most specific)

### Error Handling

- Invalid repo format validation
- Graceful fallback when no rules match
- Handle GitHub UI changes gracefully
- Clear error messages for users

## Success Criteria

- [ ] Users can configure multiple repo/branch/merge-method rules
- [ ] Extension automatically selects merge method on GitHub PR pages
- [ ] Rules persist across browser sessions
- [ ] Works reliably with GitHub's dynamic content
- [ ] Cross-browser compatible
- [ ] Intuitive rule management interface

## Future Enhancements (Post-MVP)

- Rule import/export (JSON file)
- Rule templates for common patterns
- Integration with GitHub API for branch validation
- Rule sharing between team members
- Analytics on rule usage
