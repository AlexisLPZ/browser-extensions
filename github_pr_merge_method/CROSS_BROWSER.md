# Cross-Browser Compatibility

This extension is designed to work across multiple browsers (Chrome, Firefox, Edge, Opera, etc.).

## Key Design Decisions

### 1. Manifest V2 (Not V3)

**Why?**

- Manifest V3 uses service workers for background scripts
- Service workers don't have access to `localStorage`
- Manifest V2 uses background pages (even event pages) which DO have `localStorage` access

**Trade-off**: Manifest V3 is the future, but we can migrate later if needed. For now, V2 gives us localStorage compatibility.

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

### 3. localStorage for Storage

**Why localStorage instead of chrome.storage?**

- True cross-browser compatibility (standard Web API)
- No need for special extension APIs
- Works the same way across all browsers
- No need to worry about API differences

**How we share data:**

- Popup uses localStorage directly (has DOM access)
- Background page uses localStorage directly (has DOM access in V2)
- Content script can't access extension localStorage (runs in page context)
- Solution: Message passing between content script ↔ background script

## Architecture

```
┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│   Popup     │           │  Background │           │   Content   │
│   (HTML)    │           │    Page     │           │   Script    │
│             │           │ (Manifest   │           │  (GitHub    │
│             │           │    V2)      │           │   domain)   │
└─────────────┘           └─────────────┘           └─────────────┘
      │                          │                          │
      │ Write/Read               │                          │
      │ localStorage             │ Read localStorage        │
      │ directly                 │ directly                 │
      │                          │                          │
      │                          │<─────────────────────────│
      │                          │  "getRules" message      │
      │                          │                          │
      │                          │─────────────────────────>│
      │                          │  Response with rules     │
```

## Browser Support

✅ Chrome 49+
✅ Firefox 48+
✅ Edge (Chromium) 79+
✅ Opera 36+
✅ Brave (Chromium-based)

## Future Migration Path

If we need to migrate to Manifest V3:

1. Replace localStorage with `chrome.storage.local` (which is actually cross-browser)
2. Update manifest to V3
3. Change background to service worker
4. Firefox: `chrome.storage` works as an alias for `browser.storage`
