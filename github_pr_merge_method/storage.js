/**
 * Removes data from localStorage
 * @param {string|string[]|null} keys - Key(s) to remove from localStorage. If null, removes all data.
 * @returns {boolean} - Returns true if removal was successful, false otherwise
 */
function removeStorageData(keys = null) {
  try {
    // If no keys specified, remove all data
    if (keys === null) {
      localStorage.clear();
      console.log("All localStorage data removed successfully");
      return true;
    }

    // Handle single key
    if (typeof keys === "string") {
      localStorage.removeItem(keys);
      console.log(`localStorage key "${keys}" removed successfully`);
      return true;
    }

    // Handle array of keys
    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
      console.log(
        `localStorage keys [${keys.join(", ")}] removed successfully`
      );
      return true;
    }

    console.error("Invalid keys parameter. Expected string, array, or null");
    return false;
  } catch (error) {
    console.error("Error removing localStorage data:", error);
    return false;
  }
}

// Export for CommonJS (Node.js, Jest, etc.)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { removeStorageData };
}

// Export for ES6 modules (modern browsers, bundlers)
if (typeof window !== "undefined") {
  window.removeStorageData = removeStorageData;
}
