/**
 * Shared constants for GitHub PR Merge Method extension
 *
 * IMPORTANT: This file uses different export strategies for browser vs Node.js:
 * - Browser: Uses IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
 * - Node.js: Uses standard CommonJS module.exports
 */

// ========== BROWSER ENVIRONMENT ==========
if (typeof window !== "undefined") {
  // IIFE Pattern: (function() { ... })()
  // This creates a private scope so our constants don't pollute the global namespace.
  // Without this wrapper, declaring 'const MERGE_METHODS = ...' at the top level
  // would create a global constant that conflicts if this script loads multiple times
  // or if other scripts try to declare the same variable name.
  (function () {
    "use strict";

    // Safety check: Only execute once (prevents re-initialization if script loads twice)
    if (window.MERGE_METHODS) {
      console.log("[constants.js] Already loaded, skipping");
      return;
    }

    /**
     * Valid merge methods
     */
    const MERGE_METHODS = {
      SQUASH: "squash",
      MERGE: "merge",
      REBASE: "rebase",
    };

    /**
     * Schema version
     */
    const SCHEMA_VERSION = "1.0.0";

    /**
     * Default empty rules collection
     */
    const DEFAULT_RULES_COLLECTION = `{"version":"${SCHEMA_VERSION}","rules":[]}`;

    /**
     * Storage key for merge rules
     */
    const STORAGE_KEY = "mergeRules";

    // Export to window object (the ONLY global variables we create)
    // Other scripts (like rules_utils.js) will access these via window.MERGE_METHODS, etc.
    window.MERGE_METHODS = MERGE_METHODS;
    window.SCHEMA_VERSION = SCHEMA_VERSION;
    window.DEFAULT_RULES_COLLECTION = DEFAULT_RULES_COLLECTION;
    window.STORAGE_KEY = STORAGE_KEY;
  })(); // <-- IIFE ends here and executes immediately
}

// ========== NODE.JS / JEST ENVIRONMENT ==========
// In Node.js, there's no 'window' object, and we use CommonJS modules.
// We need to redeclare the constants here because the browser IIFE above
// doesn't execute in Node.js (since window is undefined).
if (typeof module !== "undefined" && module.exports) {
  const MERGE_METHODS = {
    SQUASH: "squash",
    MERGE: "merge",
    REBASE: "rebase",
  };
  const SCHEMA_VERSION = "1.0.0";
  const DEFAULT_RULES_COLLECTION = `{"version":"${SCHEMA_VERSION}","rules":[]}`;
  const STORAGE_KEY = "mergeRules";

  // Export using CommonJS module.exports (used by require() in test files)
  module.exports = {
    MERGE_METHODS,
    SCHEMA_VERSION,
    DEFAULT_RULES_COLLECTION,
    STORAGE_KEY,
  };
}
