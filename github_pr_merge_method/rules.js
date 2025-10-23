/**
 * Adds a new merge rule to local storage
 * @param {string} repository - Repository in format "owner/repo"
 * @param {string} branch - Target branch name (use "*" for any branch)
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
    const validMergeMethods = ["squash", "merge", "rebase"];
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
    console.error("Error adding rule to storage:", error);
    return false;
  }
}

// Export for CommonJS (Node.js, Jest, etc.)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validateRule };
}

// Export for ES6 modules (modern browsers, bundlers)
if (typeof window !== "undefined") {
  window.validateRule = validateRule;
}
