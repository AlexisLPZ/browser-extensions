/**
 * Background script for GitHub PR Merge Method extension
 * Handles message passing between content scripts and extension storage
 *
 * Cross-browser compatible: works with both chrome.* and browser.* APIs
 */

// Get the appropriate API namespace (chrome for Chrome/Edge, browser for Firefox)
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Listen for messages from content scripts
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Background] Received message:", request);

  // Handle request for merge rules
  if (request.action === "getRules") {
    try {
      // Get rules from localStorage
      const rulesJson = localStorage.getItem("mergeRules");

      if (rulesJson) {
        const rulesCollection = JSON.parse(rulesJson);
        console.log("[Background] Sending rules:", rulesCollection.rules);
        sendResponse({ success: true, rules: rulesCollection.rules || [] });
      } else {
        console.log("[Background] No rules found, sending empty array");
        sendResponse({ success: true, rules: [] });
      }
    } catch (error) {
      console.error("[Background] Error loading rules:", error);
      sendResponse({ success: false, error: error.message, rules: [] });
    }

    // Return true to indicate we will send a response asynchronously
    return true;
  }

  // Unknown action
  console.warn("[Background] Unknown action:", request.action);
  sendResponse({ success: false, error: "Unknown action" });
  return true;
});

console.log("[Background] GitHub PR Merge Method background script loaded");
