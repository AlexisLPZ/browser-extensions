/**
 * Shared constants for GitHub PR Merge Method extension
 */

// For browser use - wrap in IIFE to avoid global scope pollution
if (typeof window !== "undefined") {
  (function () {
    "use strict";

    // Only execute once
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

    // Export to window
    window.MERGE_METHODS = MERGE_METHODS;
    window.SCHEMA_VERSION = SCHEMA_VERSION;
    window.DEFAULT_RULES_COLLECTION = DEFAULT_RULES_COLLECTION;
    window.STORAGE_KEY = STORAGE_KEY;
  })();
}

// Export for CommonJS (testing)
if (typeof module !== "undefined" && module.exports) {
  const MERGE_METHODS = {
    SQUASH: "squash",
    MERGE: "merge",
    REBASE: "rebase",
  };
  const SCHEMA_VERSION = "1.0.0";
  const DEFAULT_RULES_COLLECTION = `{"version":"${SCHEMA_VERSION}","rules":[]}`;
  const STORAGE_KEY = "mergeRules";

  module.exports = {
    MERGE_METHODS,
    SCHEMA_VERSION,
    DEFAULT_RULES_COLLECTION,
    STORAGE_KEY,
  };
}
