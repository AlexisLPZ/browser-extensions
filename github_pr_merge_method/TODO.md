# GitHub Merge Method Auto-Selector Extension - TODO

## Feature Overview

Transform the dummy alert extension into a practical tool that automatically selects the default merge method on GitHub PR pages based on user-defined rules. Users can configure different merge methods for different repository/branch combinations.

## User Stories

- As a developer, I want to automatically set "Squash and merge" for feature branches going to `develop`
- As a developer, I want to automatically set "Create a merge commit" for releases going to `production`
- As a developer, I want to configure different rules for different repositories
- As a developer, I want to manage multiple rules without memory constraints

## Implementation Steps

- [ ] Update rules list display with edit functionality
- [ ] Style options page with modern CSS
- [ ] Add helpful tooltips and descriptions
- [ ] Implement rule import functionality
- [ ] Add rule limit (e.g., max 50 rules) with clear messaging
