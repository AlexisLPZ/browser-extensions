/**
 * Popup script for GitHub PR Merge Method extension
 *
 * This file depends on globals defined in other scripts loaded before it:
 * - constants.js: Shared constants
 * - rules_utils.js: Core utility functions for rule validation and management
 * - storage.js: Storage abstraction layer
 * - templates.js: HTML/CSS template functions for UI rendering
 *
 * These globals are available at runtime because the scripts are loaded
 * in order in popup.html. The eslint-disable-next-line comment below
 * tells ESLint about these expected globals to avoid false "no-undef" errors.
 */
/* global 
   validateRule, canAddRule, createMergeRule, checkDuplicateRuleIds, checkDuplicateRules,
   DEFAULT_RULES_COLLECTION, getNoRulesTemplate, 
   getRuleItemTemplate, getToastInlineStyles, 
   getToastStyles, getRules, setRules, escapeHtml 
*/

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get references to DOM elements
  const addRuleForm = document.getElementById("addRuleForm");
  const rulesList = document.getElementById("rulesList");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const exportRulesBtn = document.getElementById("exportRulesBtn");
  const importRulesBtn = document.getElementById("importRulesBtn");
  const importFileInput = document.getElementById("importFileInput");

  // Initialize the popup by loading and displaying existing rules
  loadAndDisplayRules();

  // Handle form submission for adding a new rule
  addRuleForm.addEventListener("submit", async (e) => {
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
    const canAdd = await canAddRule(repository, branch);
    if (!canAdd) {
      alert(
        `A rule for repository "${repository}" and branch "${branch}" already exists. Please edit the existing rule instead.`
      );
      return;
    }

    // Create the new rule
    const newRule = createMergeRule(repository, branch, mergeMethod);

    // Get existing rules from storage
    const rulesCollection = await getRules();

    // Add the new rule
    rulesCollection.rules.push(newRule);

    // Save back to storage
    await setRules(rulesCollection);

    // Reset the form
    addRuleForm.reset();

    // Reload and display the updated rules list
    await loadAndDisplayRules();

    // Show success message (optional)
    showSuccessMessage("Rule added successfully!");
  });

  // Handle "Clear All Rules" button click
  clearAllBtn.addEventListener("click", async () => {
    if (
      confirm(
        "Are you sure you want to delete all rules? This cannot be undone."
      )
    ) {
      // Clear all rules from storage
      await setRules(JSON.parse(DEFAULT_RULES_COLLECTION));

      // Reload the display
      await loadAndDisplayRules();

      // Show success message
      showSuccessMessage("All rules cleared successfully!");
    }
  });

  // Handle "Export Rules" button click
  exportRulesBtn.addEventListener("click", () => {
    exportRules();
  });

  // Handle "Import Rules" button click
  importRulesBtn.addEventListener("click", () => {
    importFileInput.click();
  });

  // Handle file selection for import
  importFileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      await importRules(file);
      // Reset the input so the same file can be imported again if needed
      importFileInput.value = "";
    }
  });

  // Handle delete button clicks using event delegation
  rulesList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const ruleId = e.target.dataset.ruleId;
      if (confirm("Are you sure you want to delete this rule?")) {
        await deleteRule(ruleId);
      }
    }
  });

  /**
   * Loads rules from storage and displays them in the UI
   */
  async function loadAndDisplayRules() {
    // Get rules from storage
    const rulesCollection = await getRules();

    const rules = rulesCollection.rules || [];

    // Clear the rules list
    rulesList.innerHTML = "";

    // Show/hide the "Clear All", "Export", and "Import" buttons based on whether rules exist
    // Import button is always visible to allow importing rules even when list is empty
    importRulesBtn.style.display = "block";

    if (rules.length === 0) {
      clearAllBtn.style.display = "none";
      exportRulesBtn.style.display = "none";
    } else {
      clearAllBtn.style.display = "block";
      exportRulesBtn.style.display = "block";
    }

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
   * Deletes a specific rule by ID
   * @param {string} ruleId - The ID of the rule to delete
   */

  async function deleteRule(ruleId) {
    // Get existing rules from storage
    const rulesCollection = await getRules();

    // Filter out the rule to delete
    rulesCollection.rules = rulesCollection.rules.filter(
      (rule) => rule.id !== ruleId
    );
    // Save back to storage
    await setRules(rulesCollection);

    // Reload and display the updated rules list
    await loadAndDisplayRules();

    // Show success message
    showSuccessMessage("Rule deleted successfully!");
  }

  /**
   * Exports rules as a JSON file
   */
  async function exportRules() {
    // Get rules from storage
    const rulesCollection = await getRules();

    // Create a blob with the JSON data
    const jsonString = JSON.stringify(rulesCollection, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Generate filename with current date
    const timestamp = new Date().toISOString().split("T")[0];
    link.download = `github-merge-rules-${timestamp}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    showSuccessMessage("Rules exported successfully!");
  }

  /**
   * Imports rules from a JSON file
   * @param {File} file - The file to import
   */
  async function importRules(file) {
    try {
      // Read the file
      const fileContent = await file.text();

      // Parse JSON
      let importedData;
      try {
        importedData = JSON.parse(fileContent);
      } catch {
        showErrorMessage("Invalid JSON file. Please check the file format.");
        return;
      }

      // Validate the structure
      if (!importedData || typeof importedData !== "object") {
        showErrorMessage("Invalid rules file structure.");
        return;
      }

      if (!importedData.version) {
        showErrorMessage("Missing version field in rules file.");
        return;
      }

      if (!Array.isArray(importedData.rules)) {
        showErrorMessage("Invalid rules format. Expected an array of rules.");
        return;
      }

      // Check for duplicate rule IDs
      const duplicateIdErrors = checkDuplicateRuleIds(importedData.rules);

      // If there are duplicate IDs, show errors and abort import
      if (duplicateIdErrors.length > 0) {
        const errorMessage =
          "Import failed. Duplicate IDs detected:\n\n" +
          duplicateIdErrors.join("\n");
        showErrorMessage(errorMessage);
        return;
      }

      // Check for duplicate rules (same repository and branch)
      const duplicateRuleErrors = checkDuplicateRules(importedData.rules);

      // If there are duplicate rules, show errors and abort import
      if (duplicateRuleErrors.length > 0) {
        const errorMessage =
          "Import failed. Duplicate rules detected:\n\n" +
          duplicateRuleErrors.join("\n");
        showErrorMessage(errorMessage);
        return;
      }

      // Validate each rule
      const validationErrors = [];
      for (let i = 0; i < importedData.rules.length; i++) {
        const rule = importedData.rules[i];

        // Check required fields
        if (!rule.repository || !rule.branch || !rule.mergeMethod) {
          validationErrors.push(
            `Rule ${i + 1}: Missing required fields (repository, branch, or mergeMethod)`
          );
          continue;
        }

        // Validate using the validateRule function
        if (!validateRule(rule.repository, rule.branch, rule.mergeMethod)) {
          validationErrors.push(
            `Rule ${i + 1}: Invalid rule for ${rule.repository}/${rule.branch}`
          );
        }
      }

      // If there are validation errors, show them and abort import
      if (validationErrors.length > 0) {
        const errorMessage =
          "Import failed. Invalid rules detected:\n\n" +
          validationErrors.join("\n");
        showErrorMessage(errorMessage);
        return;
      }

      // All rules are valid, proceed with import
      // Override existing rules in storage
      await setRules(importedData);

      // Reload and display the updated rules list
      await loadAndDisplayRules();

      // Show success message
      showSuccessMessage(
        `Successfully imported ${importedData.rules.length} rule(s)!`
      );
    } catch (error) {
      debug.warn("Error importing rules:", error);
      showErrorMessage(
        "An error occurred while importing rules. Please try again."
      );
    }
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

  /**
   * Shows an error message to the user
   * @param {string} message - The message to show
   */
  function showErrorMessage(message) {
    // Create a simple toast notification for errors
    const toast = document.createElement("div");
    toast.className = "toast error";
    toast.style.cssText =
      getToastInlineStyles() +
      "background-color: #ef4444; white-space: pre-line;";

    document.body.appendChild(toast);

    // For multi-line error messages, use a pre element
    if (message.includes("\n")) {
      const pre = document.createElement("pre");
      pre.textContent = message;
      pre.style.cssText =
        "margin: 0; font-family: inherit; white-space: pre-wrap; word-wrap: break-word;";
      toast.appendChild(pre);
    } else {
      toast.textContent = message;
    }

    // Remove the toast after 5 seconds (longer for error messages)
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);
  }
});

// Add CSS for toast animations (only in browser, not in test environment)
if (typeof window !== "undefined" && typeof getToastStyles === "function") {
  const style = document.createElement("style");
  style.textContent = getToastStyles();
  document.head.appendChild(style);
}
