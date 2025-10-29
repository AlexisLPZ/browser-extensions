/**
 * Popup script for GitHub PR Merge Method extension
 *
 * This file depends on globals defined in other scripts loaded before it:
 * - utils.js: Core utility functions for rule validation and management
 * - templates.js: HTML/CSS template functions for UI rendering
 *
 * These globals are available at runtime because the scripts are loaded
 * in order in popup.html. The eslint-disable-next-line comment below
 * tells ESLint about these expected globals to avoid false "no-undef" errors.
 */
/* global validateRule, canAddRule, createMergeRule, DEFAULT_RULES_COLLECTION, getNoRulesTemplate, getRuleItemTemplate, getToastInlineStyles, getToastStyles */

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text; // Browser auto-escapes when using textContent
  return div.innerHTML; // Returns the escaped version
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get references to DOM elements
  const addRuleForm = document.getElementById("addRuleForm");
  const rulesList = document.getElementById("rulesList");

  // Initialize the popup by loading and displaying existing rules
  loadAndDisplayRules();

  // Handle form submission for adding a new rule
  addRuleForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form values
    const repository = document.getElementById("repoInput").value.trim();
    const branch = document.getElementById("branchInput").value.trim();
    const mergeMethod = document.getElementById("mergeMethodSelect").value;

    // Validate the rule
    if (!validateRule(repository, branch, mergeMethod)) {
      alert("Invalid rule. Please check your inputs and try again.");
      return;
    }

    // Check if rule already exists (no conflicts)
    if (!canAddRule(repository, branch)) {
      alert(
        `A rule for repository "${repository}" and branch "${branch}" already exists. Please edit the existing rule instead.`
      );
      return;
    }

    // Create the new rule
    const newRule = createMergeRule(repository, branch, mergeMethod);

    // Get existing rules from storage
    const rulesCollection = JSON.parse(
      localStorage.getItem("mergeRules") || DEFAULT_RULES_COLLECTION
    );

    // Add the new rule
    rulesCollection.rules.push(newRule);

    // Save back to storage
    localStorage.setItem("mergeRules", JSON.stringify(rulesCollection));

    // Reset the form
    addRuleForm.reset();

    // Reload and display the updated rules list
    loadAndDisplayRules();

    // Show success message (optional)
    showSuccessMessage("Rule added successfully!");
  });

  /**
   * Loads rules from storage and displays them in the UI
   */
  function loadAndDisplayRules() {
    // Get rules from storage
    const rulesCollection = JSON.parse(
      localStorage.getItem("mergeRules") || DEFAULT_RULES_COLLECTION
    );

    const rules = rulesCollection.rules || [];

    // Clear the rules list
    rulesList.innerHTML = "";

    // If no rules, show the "no rules" message
    if (rules.length === 0) {
      rulesList.innerHTML = getNoRulesTemplate();
      return;
    }

    // Display each rule
    rules.forEach((rule) => {
      const ruleElement = createRuleElement(rule);
      rulesList.appendChild(ruleElement);
    });
  }

  /**
   * Creates a DOM element for displaying a rule
   * @param {Object} rule - The rule object
   * @returns {HTMLElement} - The rule element
   */
  function createRuleElement(rule) {
    const ruleDiv = document.createElement("div");
    ruleDiv.className = "rule-item";
    ruleDiv.dataset.ruleId = rule.id;

    ruleDiv.innerHTML = getRuleItemTemplate(rule, escapeHtml);

    return ruleDiv;
  }

  /**
   * Shows a success message to the user
   * @param {string} message - The message to show
   */
  function showSuccessMessage(message) {
    // Create a simple toast notification
    const toast = document.createElement("div");
    toast.className = "toast success";
    toast.textContent = message;
    toast.style.cssText = getToastInlineStyles();

    document.body.appendChild(toast);

    // Remove the toast after 3 seconds
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
});

// Add CSS for toast animations (only in browser, not in test environment)
if (typeof window !== "undefined" && typeof getToastStyles === "function") {
  const style = document.createElement("style");
  style.textContent = getToastStyles();
  document.head.appendChild(style);
}

// Export for CommonJS (Node.js, Jest, etc.)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    escapeHtml,
  };
}
