// content.js
(function () {
  // Only trigger on the main PR page (e.g., /owner/repo/pull/123)
  const isMainPRPage = () => {
    const path = location.pathname;
    // Matches: /owner/repo/pull/123 (no extra segments)
    return /^\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(path);
  };

  const maybeAlert = () => {
    if (isMainPRPage()) {
      alert("You are on the main page of a GitHub Pull Request.");
    }
  };

  // Initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", maybeAlert, { once: true });
  } else {
    maybeAlert();
  }

  // Optional: handle SPA navigations (GitHub uses PJAX/history)
  // This keeps it simple while avoiding extra dependencies.
  // If the page changes via client-side routing, we re-check.
  let lastPath = location.pathname;
  const observer = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      maybeAlert();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
