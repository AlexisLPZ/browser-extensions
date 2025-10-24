/**
 * Valid merge methods
 */
const MERGE_METHODS = {
  SQUASH: "squash",
  MERGE: "merge",
  REBASE: "rebase",
};

/**
 * Schema for a single merge rule
 * @typedef {Object} MergeRule
 * @property {string} id - Unique identifier for the rule (UUID format)
 * @property {string} repository - Repository in format "owner/repo"
 * @property {string} branch - Target branch name
 * @property {string} mergeMethod - Merge method: "squash", "merge", or "rebase"
 * @property {string} createdAt - ISO timestamp when rule was created
 * @property {string} updatedAt - ISO timestamp when rule was last modified
 */

/**
 * Schema for the complete rules collection
 * @typedef {Object} RulesCollection
 * @property {string} version - Schema version (for future compatibility)
 * @property {MergeRule[]} rules - Array of merge rules
 */

/**
 * Default schema version
 */
const SCHEMA_VERSION = "1.0.0";
/**
 * Default empty rules collection
 */
const DEFAULT_RULES_COLLECTION = `{"version":"${SCHEMA_VERSION}","rules":[]}`;

/**
 * Validates a rule against the schema
 * @param {string} repository - Repository in format "owner/repo"
 * @param {string} branch - Target branch name
 * @param {string} mergeMethod - Merge method: "squash", "merge", or "rebase"
 * @returns {boolean} - Returns true if rule was added successfully, false otherwise
 */
function validateRule(repository, branch, mergeMethod) {
  try {
    // Validate inputs
    if (!repository || !branch || !mergeMethod) {
      console.error(
        "All parameters are required: repository, branch, mergeMethod"
      );
      return false;
    }

    // Validate merge method
    const validMergeMethods = Object.values(MERGE_METHODS);
    if (!validMergeMethods.includes(mergeMethod)) {
      console.error("Invalid merge method. Must be one of:", validMergeMethods);
      return false;
    }

    // Validate repository format (basic check)
    if (!repository.includes("/") || repository.split("/").length !== 2) {
      console.error('Repository must be in format "owner/repo"');
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error with validating rule:", error);
    return false;
  }
}

/**
 * Generates a unique ID for a rule
 * @returns {string} - Unique identifier
 */
function generateRuleId() {
  return (
    "rule_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11)
  );
}

/**
 * Creates a new merge rule with generated ID and timestamps
 * @param {string} repository - Repository in format "owner/repo"
 * @param {string} branch - Target branch name
 * @param {string} mergeMethod - Merge method
 * @returns {MergeRule} - New merge rule object
 */
function createMergeRule(repository, branch, mergeMethod) {
  return {
    id: generateRuleId(),
    repository: repository,
    branch: branch,
    mergeMethod: mergeMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Only trigger on the main PR page (e.g., /owner/repo/pull/123)
const isMainPRPage = (path = location.pathname) => {
  // Matches: /owner/repo/pull/123 (no extra segments)
  return /^\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(path);
};

/**
 * Removes data from localStorage
 * @param {string|string[]|null} keys - Key(s) to remove from localStorage. If null, removes all data.
 * @returns {boolean} - Returns true if removal was successful, false otherwise
 */
function removeStorageData(keys = null) {
  try {
    // If no keys specified, remove all data
    if (keys === null) {
      localStorage.clear();
      console.log("All localStorage data removed successfully");
      return true;
    }

    // Handle single key
    if (typeof keys === "string") {
      localStorage.removeItem(keys);
      console.log(`localStorage key "${keys}" removed successfully`);
      return true;
    }

    // Handle array of keys
    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
      console.log(
        `localStorage keys [${keys.join(", ")}] removed successfully`
      );
      return true;
    }

    console.error("Invalid keys parameter. Expected string, array, or null");
    return false;
  } catch (error) {
    console.error("Error removing localStorage data:", error);
    return false;
  }
}

/**
 * Checks if a rule with the same repository and branch already exists in storage
 * @param {string} repository - Repository in format "owner/repo"
 * @param {string} branch - Target branch name
 * @returns {boolean} - true if rule can be added (no conflict), false if should edit instead
 */
function canAddRule(repository, branch) {
  try {
    // Get existing rules from storage
    const existingRules = JSON.parse(
      localStorage.getItem("mergeRules") || DEFAULT_RULES_COLLECTION
    );

    // Check if a rule with the same repository and branch already exists
    const conflictExists = existingRules.rules.some(
      (rule) => rule.repository === repository && rule.branch === branch
    );

    // Return true if no conflict (can add), false if conflict exists (should edit)
    return !conflictExists;
  } catch (error) {
    console.error("Error checking for rule conflicts:", error);
    throw error; // Let the caller handle it
  }
}

// Export for CommonJS (Node.js, Jest, etc.)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateRule,
    isMainPRPage,
    generateRuleId,
    createMergeRule,
    removeStorageData,
    canAddRule,
  };
}

// Export for ES6 modules (modern browsers, bundlers)
if (typeof window !== "undefined") {
  window.removeStorageData = removeStorageData;
  window.validateRule = validateRule;
  window.generateRuleId = generateRuleId;
  window.createMergeRule = createMergeRule;
  window.isMainPRPage = isMainPRPage;
  window.canAddRule = canAddRule;
}
