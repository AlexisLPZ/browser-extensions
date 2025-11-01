// Only trigger on the main PR page (e.g., /owner/repo/pull/123)
const isMainPRPage = (path = location.pathname) => {
  // Matches: /owner/repo/pull/123 (no extra segments)
  return /^\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(path);
};

// Export for CommonJS (Node.js, Jest, etc.)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isMainPRPage,
  };
}

// Export for ES6 modules (modern browsers, bundlers)
if (typeof window !== "undefined") {
  window.isMainPRPage = isMainPRPage;
}
