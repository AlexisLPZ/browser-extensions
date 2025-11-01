/**
 * Storage abstraction layer for GitHub PR Merge Method extension
 * Provides a cross-browser compatible wrapper around chrome.storage.local
 *
 * This replaces the previous localStorage implementation to support Manifest V3
 *
 * Cross-browser compatible: works with both chrome.* and browser.* APIs
 */

// Get the appropriate API namespace (chrome for Chrome/Edge, browser for Firefox)
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

/**
 * Storage key for merge rules
 */
const STORAGE_KEY = "mergeRules";

/**
 * Gets merge rules from chrome.storage.local
 * Note: Relies on DEFAULT_RULES_COLLECTION from utils.js when used in browser context
 * @returns {Promise<Object>} - Promise that resolves to rules collection object
 */
async function getRules() {
  try {
    const result = await browserAPI.storage.local.get(STORAGE_KEY);

    if (result[STORAGE_KEY]) {
      return result[STORAGE_KEY];
    }

    // Return default empty collection if nothing stored
    // DEFAULT_RULES_COLLECTION is provided by utils.js in browser context
    const defaultCollection =
      typeof DEFAULT_RULES_COLLECTION !== "undefined"
        ? DEFAULT_RULES_COLLECTION
        : '{"version":"1.0.0","rules":[]}';
    return JSON.parse(defaultCollection);
  } catch (error) {
    console.error("[Storage] Error getting rules:", error);
    const defaultCollection =
      typeof DEFAULT_RULES_COLLECTION !== "undefined"
        ? DEFAULT_RULES_COLLECTION
        : '{"version":"1.0.0","rules":[]}';
    return JSON.parse(defaultCollection);
  }
}

/**
 * Saves merge rules to chrome.storage.local
 * @param {Object} rulesCollection - The rules collection object to save
 * @returns {Promise<void>}
 */
async function setRules(rulesCollection) {
  try {
    await browserAPI.storage.local.set({
      [STORAGE_KEY]: rulesCollection,
    });
  } catch (error) {
    console.error("[Storage] Error saving rules:", error);
    throw error;
  }
}

/**
 * Clears all rules from storage
 * @returns {Promise<void>}
 */
async function clearRules() {
  try {
    await browserAPI.storage.local.remove(STORAGE_KEY);
  } catch (error) {
    console.error("[Storage] Error clearing rules:", error);
    throw error;
  }
}

// Export for browser use
if (typeof window !== "undefined") {
  window.getRules = getRules;
  window.setRules = setRules;
  window.clearRules = clearRules;
}

// Export for CommonJS (testing)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getRules,
    setRules,
    clearRules,
    STORAGE_KEY,
  };
}
