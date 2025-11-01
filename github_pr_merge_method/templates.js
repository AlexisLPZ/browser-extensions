/**
 * HTML Templates for the popup UI
 */

/**
 * Template for the "no rules" message
 * @returns {string} HTML string
 */
function getNoRulesTemplate() {
  return `
      <div class="no-rules" id="noRulesMessage">
        <p>No rules configured yet. Add your first rule above!</p>
      </div>
    `;
}

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

/**
 * Template for a single rule item
 * @param {Object} rule - The rule object
 * @param {string} rule.repository - Repository name
 * @param {string} rule.branch - Branch name
 * @param {string} rule.mergeMethod - Merge method
 * @param {Function} escapeHtml - Function to escape HTML
 * @returns {string} HTML string
 */
function getRuleItemTemplate(rule, escapeHtml) {
  const mergeMethodDisplay = {
    squash: "Squash and merge",
    merge: "Create a merge commit",
    rebase: "Rebase and merge",
  };

  return `
      <div class="rule-details">
        <div class="rule-repo">
          <strong>Repository:</strong> ${escapeHtml(rule.repository)}
        </div>
        <div class="rule-branch">
          <strong>Branch:</strong> ${escapeHtml(rule.branch)}
        </div>
        <div class="rule-method">
          <strong>Merge Method:</strong> ${mergeMethodDisplay[rule.mergeMethod]}
        </div>
      </div>
      <button class="btn btn-delete" data-rule-id="${escapeHtml(rule.id)}">Delete</button>
    `;
}

/**
 * CSS styles for toast notifications
 * @returns {string} CSS string
 */
function getToastStyles() {
  return `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
}

/**
 * Inline styles for toast element
 * @returns {string} CSS string
 */
function getToastInlineStyles() {
  return `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4caf50;
      color: white;
      padding: 16px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
}

// Export for browser use
if (typeof window !== "undefined") {
  window.getNoRulesTemplate = getNoRulesTemplate;
  window.getRuleItemTemplate = getRuleItemTemplate;
  window.getToastStyles = getToastStyles;
  window.getToastInlineStyles = getToastInlineStyles;
}

// Export for CommonJS (testing)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getNoRulesTemplate,
    escapeHtml,
    getRuleItemTemplate,
    getToastStyles,
    getToastInlineStyles,
  };
}
