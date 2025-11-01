# Cross-Browser Compatibility

This extension is designed to work across multiple browsers (Chrome, Firefox, Edge, Opera, etc.).

## Key Design Decisions

### 1. Manifest V3

**Why Manifest V3?**

- Modern, supported by all major browsers
- Better security and performance
- Future-proof (Manifest V2 is being phased out)
- Uses service workers for background scripts

**Storage:**

- Uses `chrome.storage.local` API instead of `localStorage`
- `chrome.storage` is actually cross-browser (Firefox supports it as an alias for `browser.storage`)
- More reliable and persistent than localStorage
- Async API provides better performance

### 2. Browser API Detection

```javascript
const browserAPI = typeof browser !== "undefined" ? browser : chrome;
```

**Why this works:**

- **Chrome/Edge/Opera**: Use the `chrome.*` namespace
- **Firefox**: Uses the `browser.*` namespace (but also supports `chrome.*` as an alias)
- By checking for `browser` first, we use the native API when available

This pattern is used in:

- `background.js`
- `content.js`
- `storage.js`

### 3. chrome.storage.local for Storage

**Why chrome.storage instead of localStorage?**

- Cross-browser compatibility (`chrome.storage` works in Firefox as an alias)
- Required for Manifest V3 service workers (no `localStorage` access)
- More reliable and persistent
- Async API prevents blocking UI
- No quota issues with reasonable data sizes

**How we share data:**

- Popup uses `chrome.storage.local` via `storage.js` abstraction layer
- Background service worker uses `chrome.storage.local` directly
- Content script can't access extension storage directly (runs in page context)
- Solution: Message passing between content script ↔ background service worker

## Architecture

```
┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│   Popup     │           │  Background │           │   Content   │
│   (HTML)    │           │   Service   │           │   Script    │
│             │           │   Worker    │           │  (GitHub    │
│             │           │ (Manifest   │           │   domain)   │
│             │           │    V3)      │           │             │
└─────────────┘           └─────────────┘           └─────────────┘
      │                          │                          │
      │ Write/Read               │                          │
      │ chrome.storage.local     │ Read                     │
      │ via storage.js           │ chrome.storage.local     │
      │                          │                          │
      │                          │<─────────────────────────│
      │                          │  "getRules" message      │
      │                          │                          │
      │                          │─────────────────────────>│
      │                          │  Response with rules     │
```

## Browser Support

✅ Chrome 88+ (Manifest V3 support)
✅ Firefox 109+ (Manifest V3 support)
✅ Edge (Chromium) 88+
✅ Opera 74+
✅ Brave (Chromium-based)

## Storage Abstraction Layer

The extension includes `storage.js` which provides a clean abstraction over `chrome.storage.local`:

- **getRules()**: Async function to retrieve all rules
- **setRules(rulesCollection)**: Async function to save rules
- **clearRules()**: Async function to clear all rules

This abstraction:

- Simplifies the codebase
- Handles cross-browser API differences automatically
- Provides consistent error handling
- Makes testing easier with fallback support
