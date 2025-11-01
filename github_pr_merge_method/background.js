/**
 * Background service worker for GitHub PR Merge Method extension (Manifest V3)
 * Handles message passing between content scripts and extension storage
 *
 * Cross-browser compatible: works with both chrome.* and browser.* APIs
 */
/* global browser */

// Get the appropriate API namespace (chrome for Chrome/Edge, browser for Firefox)
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

/**
 * Schema version
 */
const SCHEMA_VERSION = "1.0.0";

/**
 * Default empty rules collection
 */
const DEFAULT_RULES_COLLECTION = `{"version":"${SCHEMA_VERSION}","rules":[]}`;

/**
 * Gets merge rules from chrome.storage.local
 * @returns {Promise<Object>} - Promise that resolves to rules collection object
 */
async function getRules() {
  try {
    const result = await browserAPI.storage.local.get("mergeRules");

    if (result.mergeRules) {
      return result.mergeRules;
    }

    // Return default empty collection if nothing stored
    return JSON.parse(DEFAULT_RULES_COLLECTION);
  } catch (error) {
    console.error("[Background] Error getting rules:", error);
    return JSON.parse(DEFAULT_RULES_COLLECTION);
  }
}

// Listen for messages from content scripts
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Background] Received message:", request);

  // Handle request for merge rules
  if (request.action === "getRules") {
    // Use async/await with chrome.storage
    getRules()
      .then((rulesCollection) => {
        console.log("[Background] Sending rules:", rulesCollection.rules);
        sendResponse({ success: true, rules: rulesCollection.rules || [] });
      })
      .catch((error) => {
        console.error("[Background] Error loading rules:", error);
        sendResponse({ success: false, error: error.message, rules: [] });
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  }

  // Unknown action
  console.warn("[Background] Unknown action:", request.action);
  sendResponse({ success: false, error: "Unknown action" });
  return true;
});

console.log(
  "[Background] GitHub PR Merge Method background service worker loaded"
);
