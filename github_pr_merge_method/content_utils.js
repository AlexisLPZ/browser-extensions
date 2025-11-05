// Only trigger on the main PR page (e.g., /owner/repo/pull/123)
const isMainPRPage = (path = location.pathname) => {
  // Matches: /owner/repo/pull/123 (no extra segments)
  return /^\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(path);
};

/**
 * Extracts the repository (owner/repo) from a GitHub URL path
 * @param {string} path - URL pathname (e.g., "/owner/repo/pull/123")
 * @returns {string|null} - Repository in format "owner/repo" or null if not found
 */
function extractRepoFromPath(path = location.pathname) {
  const match = path.match(/^\/([^/]+)\/([^/]+)\//);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  return null;
}

// Export for CommonJS (Node.js, Jest, etc.)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    extractRepoFromPath,
    isMainPRPage,
  };
}

// Export for ES6 modules (modern browsers, bundlers)
if (typeof window !== "undefined") {
  window.isMainPRPage = isMainPRPage;
  window.extractRepoFromPath = extractRepoFromPath;
}
