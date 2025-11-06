/* global getRules */

/**
 * ENVIRONMENT-SPECIFIC CONSTANT HANDLING
 *
 * This file needs to work in two different JavaScript environments:
 * 1. Browser (for the extension popup and content scripts)
 * 2. Node.js (for running Jest tests)
 *
 * Each environment loads modules differently, which requires this conditional setup.
 */

// Declare variables that will hold our constants
// Using 'let' (not 'const') because we'll assign values conditionally below
let MERGE_METHODS, DEFAULT_RULES_COLLECTION;

// ENVIRONMENT DETECTION & CONSTANT LOADING
if (typeof module !== "undefined" && typeof window === "undefined") {
  // ========== NODE.JS / JEST ENVIRONMENT ==========
  // In Node.js, 'module' exists but 'window' doesn't
  // We use CommonJS 'require()' to import constants from constants.js
  const constants = require("./constants.js");
  MERGE_METHODS = constants.MERGE_METHODS;
  DEFAULT_RULES_COLLECTION = constants.DEFAULT_RULES_COLLECTION;
} else if (typeof window !== "undefined") {
  // ========== BROWSER ENVIRONMENT ==========
  // In browsers, 'window' exists and scripts load via <script> tags in popup.html
  //
  // WHY NOT JUST IMPORT?: In the browser, constants.js loads BEFORE this file
  // (see popup.html script order). To avoid duplicate global variable declarations
  // (which causes "already declared" errors), constants.js wraps its code in an
  // IIFE (Immediately Invoked Function Expression) and only exports to window.
  //
  // So we reference the already-loaded window.MERGE_METHODS instead of declaring
  // our own constants, preventing naming conflicts.
  MERGE_METHODS = window.MERGE_METHODS;
  DEFAULT_RULES_COLLECTION = window.DEFAULT_RULES_COLLECTION;
}

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

/**
 * Checks for duplicate rules (same repository and branch) in an array of rules
 * @param {MergeRule[]} rules - Array of rules to check
 * @returns {string[]} - Array of error messages (empty if no duplicates found)
 */
function checkDuplicateRules(rules) {
  const duplicateErrors = [];
  const ruleKeys = new Map(); // Map to track repository/branch combinations

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.repository && rule.branch) {
      const key = `${rule.repository}|||${rule.branch}`;

      if (ruleKeys.has(key)) {
        const firstIndex = ruleKeys.get(key);
        duplicateErrors.push(
          `Duplicate rule detected: Rules ${firstIndex + 1} and ${i + 1} both target ${rule.repository}/${rule.branch}`
        );
      } else {
        ruleKeys.set(key, i);
      }
    }
  }

  return duplicateErrors;
}

/**
 * Checks if a rule with the same repository and branch already exists in storage
 * @param {string} repository - Repository in format "owner/repo"
 * @param {string} branch - Target branch name
 * @returns {Promise<boolean>} - true if rule can be added (no conflict), false if should edit instead
 */
async function canAddRule(repository, branch) {
  try {
    // Get existing rules from storage
    // Note: In browser context, getRules is provided by storage.js
    // In test context, we fall back to localStorage
    let existingRules;
    if (typeof getRules !== "undefined") {
      existingRules = await getRules();
    } else if (typeof localStorage !== "undefined") {
      // Fallback for test environment
      existingRules = JSON.parse(
        localStorage.getItem("mergeRules") || DEFAULT_RULES_COLLECTION
      );
    } else {
      throw new Error("No storage mechanism available");
    }

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
    generateRuleId,
    createMergeRule,
    canAddRule,
    checkDuplicateRules,
  };
}

// Export for ES6 modules (modern browsers, bundlers)
if (typeof window !== "undefined") {
  window.validateRule = validateRule;
  window.generateRuleId = generateRuleId;
  window.createMergeRule = createMergeRule;
  window.canAddRule = canAddRule;
  window.checkDuplicateRules = checkDuplicateRules;
}
