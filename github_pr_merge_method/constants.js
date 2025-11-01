/**
 * Shared constants for GitHub PR Merge Method extension
 */

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

// Export for browser use
if (typeof window !== "undefined") {
  window.MERGE_METHODS = MERGE_METHODS;
  window.SCHEMA_VERSION = SCHEMA_VERSION;
  window.DEFAULT_RULES_COLLECTION = DEFAULT_RULES_COLLECTION;
  window.STORAGE_KEY = STORAGE_KEY;
}

// Export for CommonJS (testing)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    MERGE_METHODS,
    SCHEMA_VERSION,
    DEFAULT_RULES_COLLECTION,
    STORAGE_KEY,
  };
}
