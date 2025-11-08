# Browser Differences

This document explains the differences between Chrome and Firefox versions of the extension.

## Manifest Files

The extension uses separate manifests to accommodate browser-specific requirements:

- `manifest.json` - Chrome Web Store version
- `manifest.firefox.json` - Firefox Add-ons version

## Key Differences

### 1. Background Scripts

**Chrome (manifest.json):**
```json
"background": {
  "service_worker": "background.js"
}
```

**Firefox (manifest.firefox.json):**
```json
"background": {
  "scripts": ["background.js"]
}
```

**Why:** Firefox doesn't fully support service workers in Manifest V3 yet, so it still uses the traditional background scripts approach.

### 2. Browser-Specific Settings

**Chrome:** No browser-specific settings required.

**Firefox:** Requires an add-on ID:
```json
"browser_specific_settings": {
  "gecko": {
    "id": "{019a65a3-a3f7-7c29-8fe8-227a39339838}",
    "strict_min_version": "109.0"
  }
}
```

**Why:** Firefox requires a unique identifier for all Manifest V3 extensions. The UUID format is used here.

## Code Compatibility

The JavaScript code (`background.js`, `content.js`, `popup.js`, etc.) is **100% compatible** between both browsers because:

1. Both use the standard `chrome.storage` API (Firefox supports the `chrome.*` namespace)
2. No browser-specific APIs are used
3. The content scripts use standard DOM manipulation

## Build Process

The `build.sh` script automatically creates two separate packages:

1. **Chrome package**: Uses `manifest.json`
2. **Firefox package**: Uses `manifest.firefox.json` renamed to `manifest.json`

Both packages contain identical source code, just with different manifests.

## Testing

### Chrome
1. Load unpacked extension using `manifest.json`
2. Test on Chrome/Edge/Brave

### Firefox
1. Temporarily rename manifests:
   - `mv manifest.json manifest.chrome.json`
   - `mv manifest.firefox.json manifest.json`
2. Load temporary add-on in Firefox (`about:debugging`)
3. Restore manifests after testing

Or use `web-ext` for Firefox testing:
```bash
web-ext run --source-dir=. --start-url="https://github.com"
```

## Future Considerations

When Firefox adds full service worker support for Manifest V3:
- Both browsers can use the same manifest
- The `browser_specific_settings.gecko.id` should be kept for backward compatibility
- Update `strict_min_version` to the Firefox version that supports service workers

## Resources

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Firefox Extension Manifest V3](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/)
- [Firefox browser_specific_settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings)

