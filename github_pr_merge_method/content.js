/**
 * Content script for GitHub PR Merge Method extension
 * Runs on GitHub PR pages and automatically selects the merge method based on configured rules
 *
 * This file depends on globals defined in utils.js which is loaded before it:
 * - isMainPRPage: Function to check if current page is a main PR page
 *
 * Cross-browser compatible: works with both chrome.* and browser.* APIs
 */
/* global isMainPRPage, browser, extractRepoFromPath */

// Get the appropriate API namespace (chrome for Chrome/Edge, browser for Firefox)
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

/**
 * Gets the target branch name from the PR page DOM
 * @returns {string|null} - Branch name or null if not found
 */
function getBranchFromPRPage() {
  // GitHub shows the target branch in the PR header
  // Look for the element with class "base-ref" or similar
  const branchElement = document.querySelector(".base-ref");
  if (branchElement) {
    return branchElement.textContent.trim();
  }

  // Alternative: Check for branch name in the PR title section
  const branchSpan = document.querySelector(
    'span[data-hovercard-type="branch"]'
  );
  if (branchSpan) {
    return branchSpan.textContent.trim();
  }

  // Fallback: Try to extract from the merge message area
  const mergeMessage = document.querySelector(".merge-pr");
  if (mergeMessage) {
    const text = mergeMessage.textContent;
    const match = text.match(/into\s+(\S+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Finds a matching rule for the given repository and branch
 * Supports wildcard matching with "*" for branch name
 * @param {string} repository - Repository in format "owner/repo"
 * @param {string} branch - Target branch name
 * @param {Array} rules - Array of merge rules
 * @returns {Object|null} - Matching rule or null if not found
 */
function findMatchingRule(repository, branch, rules) {
  if (!repository || !branch || !rules || !Array.isArray(rules)) {
    return null;
  }

  // First, try to find an exact match
  const exactMatch = rules.find(
    (rule) => rule.repository === repository && rule.branch === branch
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Then, try to find a wildcard match (branch = "*")
  const wildcardMatch = rules.find(
    (rule) => rule.repository === repository && rule.branch === "*"
  );
  if (wildcardMatch) {
    return wildcardMatch;
  }

  return null;
}

/**
 * Gets the merge button element from the DOM
 * @returns {HTMLElement|null} - Merge button element or null if not found
 */
function getMergeButton() {
  // GitHub's merge button typically has these characteristics
  // Try multiple selectors to be more robust
  const selectors = [
    'button[data-details-container=".js-merge-pr"]',
    "button.merge-pr-button",
    'button[name="commit_action"]',
    '.merge-box button[type="submit"]',
  ];

  for (const selector of selectors) {
    const button = document.querySelector(selector);
    if (button) {
      return button;
    }
  }

  return null;
}

/**
 * Gets the merge method dropdown/details element
 * @returns {HTMLElement|null} - Dropdown element or null if not found
 */
function getMergeMethodDropdown() {
  const selectors = [
    "details.merge-method-select",
    "details.select-menu",
    ".merge-select-menu",
  ];

  for (const selector of selectors) {
    const dropdown = document.querySelector(selector);
    if (dropdown) {
      return dropdown;
    }
  }

  return null;
}

/**
 * Gets the main merge button (shows current merge method)
 * @returns {HTMLElement|null} - Main merge button or null if not found
 */
function getMainMergeButton() {
  // New GitHub UI: button with text like "Squash and merge", "Create a merge commit", "Rebase and merge"
  const textElements = document.querySelectorAll(
    'button span[data-component="text"]'
  );

  for (const textEl of textElements) {
    const text = textEl.textContent.toLowerCase();
    if (
      text.includes("merge") ||
      text.includes("squash") ||
      text.includes("rebase")
    ) {
      return textEl.closest("button");
    }
  }

  return null;
}

/**
 * Gets the dropdown toggle button (triangle icon to open merge method menu)
 * @returns {HTMLElement|null} - Dropdown button or null if not found
 */
function getMergeMethodDropdownButton() {
  // First, find the main merge button (shows current method like "Squash and merge")
  const mainButton = getMainMergeButton();
  if (!mainButton) {
    console.log("[GitHub PR Merge Method] Main merge button not found");
    return null;
  }

  // Find the ButtonGroup container that holds both the main button and dropdown
  const buttonGroup = mainButton.closest('[class*="ButtonGroup"]');
  if (!buttonGroup) {
    console.log("[GitHub PR Merge Method] ButtonGroup not found");
    return null;
  }

  console.log("[GitHub PR Merge Method] Found ButtonGroup:", buttonGroup);

  // Look for the IconButton with triangle-down within the same ButtonGroup
  const dropdownButtons = buttonGroup.querySelectorAll(
    'button[data-component="IconButton"]'
  );

  for (const button of dropdownButtons) {
    const svg = button.querySelector(".octicon-triangle-down");
    if (svg) {
      console.log(
        "[GitHub PR Merge Method] Found merge dropdown button:",
        button
      );
      return button;
    }
  }

  console.log(
    "[GitHub PR Merge Method] Dropdown button not found in ButtonGroup"
  );
  return null;
}

/**
 * Opens the merge method dropdown menu
 * @returns {Promise<boolean>} - True if dropdown was opened successfully
 */
async function openMergeMethodDropdown() {
  const dropdownButton = getMergeMethodDropdownButton();

  if (!dropdownButton) {
    console.log("[GitHub PR Merge Method] Dropdown button not found");
    return false;
  }

  console.log("[GitHub PR Merge Method] Clicking dropdown button...");
  dropdownButton.click();

  // Wait a bit for the menu to appear
  await new Promise((resolve) => setTimeout(resolve, 300));

  return true;
}

/**
 * Gets all available merge method menu items from the dropdown
 * @returns {Object} - Object with merge method names as keys and menu item elements as values
 */
function getMergeMethodMenuItems() {
  const items = {};

  console.log(
    "[GitHub PR Merge Method] Looking for merge method menu items..."
  );

  // Find the specific menu that contains merge methods
  // The menu has aria-labelledby matching the dropdown button's aria-labelledby
  const dropdownButton = getMergeMethodDropdownButton();
  if (!dropdownButton) {
    console.log("[GitHub PR Merge Method] Dropdown button not found");
    return items;
  }

  const ariaLabelledBy = dropdownButton.getAttribute("aria-labelledby");
  console.log(
    "[GitHub PR Merge Method] Dropdown button aria-labelledby:",
    ariaLabelledBy
  );

  // Find the menu associated with this dropdown button
  // Both the button and menu share the same aria-labelledby value
  let mergeMethodMenu = null;
  if (ariaLabelledBy) {
    mergeMethodMenu = document.querySelector(
      `ul[role="menu"][aria-labelledby="${ariaLabelledBy}"]`
    );
  }

  if (!mergeMethodMenu) {
    console.log(
      "[GitHub PR Merge Method] Could not find merge method menu, searching all visible items..."
    );
  } else {
    console.log(
      "[GitHub PR Merge Method] Found merge method menu:",
      mergeMethodMenu
    );
  }

  // Get menuitemradio elements from within the specific menu, or all if not found
  const menuItems = mergeMethodMenu
    ? mergeMethodMenu.querySelectorAll('li[role="menuitemradio"]')
    : document.querySelectorAll('li[role="menuitemradio"]');

  console.log(
    "[GitHub PR Merge Method] Found menuitemradio elements:",
    menuItems.length
  );

  // Filter to only visible items with merge-related text
  const visibleMergeItems = Array.from(menuItems).filter((item) => {
    const rect = item.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;

    // Get the label text from the span with ItemLabel class
    const labelSpan = item.querySelector('[class*="ItemLabel"]');
    const labelText = labelSpan
      ? labelSpan.textContent.toLowerCase()
      : item.textContent.toLowerCase();

    // Must match one of the three exact merge method patterns
    const isSquash = labelText.includes("squash and merge");
    const isRebase = labelText.includes("rebase and merge");
    const isMergeCommit =
      labelText.includes("merge commit") ||
      labelText.includes("create a merge");

    return isVisible && (isSquash || isRebase || isMergeCommit);
  });

  console.log(
    "[GitHub PR Merge Method] Visible merge method items:",
    visibleMergeItems.length
  );

  visibleMergeItems.forEach((item, idx) => {
    // Get the label text from the span with ItemLabel class
    const labelSpan = item.querySelector('[class*="ItemLabel"]');
    const labelText = labelSpan
      ? labelSpan.textContent.toLowerCase()
      : item.textContent.toLowerCase();

    const ariaChecked = item.getAttribute("aria-checked");
    console.log(
      `[GitHub PR Merge Method] Item ${idx}: "${labelText}" (aria-checked: ${ariaChecked})`
    );

    if (labelText.includes("squash and merge")) {
      items.squash = item;
      console.log("[GitHub PR Merge Method] ✓ Found squash menu item");
    } else if (labelText.includes("rebase and merge")) {
      items.rebase = item;
      console.log("[GitHub PR Merge Method] ✓ Found rebase menu item");
    } else if (
      labelText.includes("merge commit") ||
      labelText.includes("create a merge")
    ) {
      items.merge = item;
      console.log("[GitHub PR Merge Method] ✓ Found merge menu item");
    }
  });

  return items;
}

/**
 * Gets all available merge method option buttons (DEPRECATED - kept for compatibility)
 * @returns {Object} - Object with merge method names as keys and button elements as values
 */
function getMergeMethodButtons() {
  // This function is deprecated but kept for backward compatibility
  // The new GitHub UI doesn't use radio buttons
  return {};
}

/**
 * Debug function to log the merge box structure
 */
function debugMergeBox() {
  const mergeBox = document.querySelector(".merge-box");
  if (!mergeBox) {
    console.log("[GitHub PR Merge Method] No merge box found on page");
    return;
  }

  console.log("[GitHub PR Merge Method] Merge box found:", mergeBox);
  console.log("[GitHub PR Merge Method] Merge box HTML (first 500 chars):");
  console.log(mergeBox.innerHTML.substring(0, 500));

  // Find all input elements
  const inputs = mergeBox.querySelectorAll("input");
  console.log(
    "[GitHub PR Merge Method] All inputs in merge box:",
    inputs.length
  );
  inputs.forEach((input, idx) => {
    console.log(`[GitHub PR Merge Method] Input ${idx}:`, {
      type: input.type,
      name: input.name,
      value: input.value,
      id: input.id,
      checked: input.checked,
      disabled: input.disabled,
    });
  });

  // Find all buttons
  const buttons = mergeBox.querySelectorAll("button");
  console.log(
    "[GitHub PR Merge Method] All buttons in merge box:",
    buttons.length
  );
  buttons.forEach((button, idx) => {
    console.log(`[GitHub PR Merge Method] Button ${idx}:`, {
      textContent: button.textContent.trim().substring(0, 50),
      classList: Array.from(button.classList),
      disabled: button.disabled,
    });
  });
}

/**
 * Checks if a merge method option is available/enabled
 * @param {string} mergeMethod - Merge method: "squash", "merge", or "rebase"
 * @returns {Promise<boolean>} - True if the method is available and not disabled
 */
async function isMergeMethodAvailable(mergeMethod) {
  // Open the dropdown to see available options
  const opened = await openMergeMethodDropdown();
  if (!opened) {
    console.log(
      `[GitHub PR Merge Method] Cannot check availability - dropdown won't open`
    );
    return false;
  }

  // Get menu items
  const menuItems = getMergeMethodMenuItems();
  const menuItem = menuItems[mergeMethod];

  // Close the dropdown (click it again)
  const dropdownButton = getMergeMethodDropdownButton();
  if (dropdownButton) {
    dropdownButton.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!menuItem) {
    console.log(
      `[GitHub PR Merge Method] Menu item for "${mergeMethod}" not found`
    );
    return false;
  }

  // Check if disabled
  const isDisabled =
    menuItem.hasAttribute("aria-disabled") &&
    menuItem.getAttribute("aria-disabled") === "true";

  if (isDisabled) {
    console.log(
      `[GitHub PR Merge Method] Menu item for "${mergeMethod}" is disabled`
    );
    return false;
  }

  console.log(
    `[GitHub PR Merge Method] Menu item for "${mergeMethod}" is available`
  );
  return true;
}

/**
 * Selects a specific merge method by clicking the menu item
 * @param {string} mergeMethod - Merge method: "squash", "merge", or "rebase"
 * @returns {Promise<boolean>} - True if successfully selected, false otherwise
 */
async function selectMergeMethod(mergeMethod) {
  if (!mergeMethod) {
    console.error("[GitHub PR Merge Method] No merge method specified");
    return false;
  }

  console.log(
    `[GitHub PR Merge Method] Attempting to select merge method: ${mergeMethod}`
  );

  // Check if already selected (by looking at the main button text)
  const mainButton = getMainMergeButton();
  if (mainButton) {
    const currentMethod = mainButton.textContent.toLowerCase();
    console.log(
      `[GitHub PR Merge Method] Current button text: "${currentMethod}"`
    );

    if (
      (mergeMethod === "squash" && currentMethod.includes("squash")) ||
      (mergeMethod === "rebase" && currentMethod.includes("rebase")) ||
      (mergeMethod === "merge" && currentMethod.includes("merge commit"))
    ) {
      console.log(
        `[GitHub PR Merge Method] Merge method "${mergeMethod}" is already selected`
      );
      return true;
    }
  }

  // Open dropdown
  const opened = await openMergeMethodDropdown();
  if (!opened) {
    console.error("[GitHub PR Merge Method] Failed to open dropdown");
    return false;
  }

  // Get menu items
  const menuItems = getMergeMethodMenuItems();
  const menuItem = menuItems[mergeMethod];

  if (!menuItem) {
    console.error(
      `[GitHub PR Merge Method] Menu item for "${mergeMethod}" not found`
    );
    // Close dropdown
    const dropdownButton = getMergeMethodDropdownButton();
    if (dropdownButton) {
      dropdownButton.click();
    }
    return false;
  }

  // Check if disabled
  const isDisabled =
    menuItem.hasAttribute("aria-disabled") &&
    menuItem.getAttribute("aria-disabled") === "true";

  if (isDisabled) {
    console.warn(
      `[GitHub PR Merge Method] Merge method "${mergeMethod}" is not available or disabled for this PR`
    );
    // Close dropdown
    const dropdownButton = getMergeMethodDropdownButton();
    if (dropdownButton) {
      dropdownButton.click();
    }
    return false;
  }

  // Click the menu item (the <li role="menuitemradio"> element)
  console.log(
    `[GitHub PR Merge Method] Clicking menu item for "${mergeMethod}"`
  );
  console.log(`[GitHub PR Merge Method] Menu item element:`, menuItem);
  console.log(`[GitHub PR Merge Method] Menu item tag:`, menuItem.tagName);
  console.log(
    `[GitHub PR Merge Method] Menu item role:`,
    menuItem.getAttribute("role")
  );
  console.log(
    `[GitHub PR Merge Method] Current aria-checked:`,
    menuItem.getAttribute("aria-checked")
  );

  // Click the <li> element directly - it's the interactive radio button
  console.log(`[GitHub PR Merge Method] Clicking <li> element...`);
  menuItem.click();

  // Wait for the UI to update
  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log(`[GitHub PR Merge Method] Selected merge method: ${mergeMethod}`);

  // Verify the selection by checking the main button text
  await new Promise((resolve) => setTimeout(resolve, 100));
  const verifyButton = getMainMergeButton();
  if (verifyButton) {
    const newText = verifyButton.textContent.toLowerCase();
    console.log(`[GitHub PR Merge Method] New button text: "${newText}"`);

    const isCorrect =
      (mergeMethod === "squash" && newText.includes("squash")) ||
      (mergeMethod === "rebase" && newText.includes("rebase")) ||
      (mergeMethod === "merge" && newText.includes("merge commit"));

    if (isCorrect) {
      console.log(
        `[GitHub PR Merge Method] ✓ Merge method successfully changed!`
      );
    } else {
      console.warn(
        `[GitHub PR Merge Method] ⚠ Button text didn't change as expected`
      );
    }
  }

  return true;
}

/**
 * Loads rules from storage via messaging with background script
 * @returns {Promise<Array>} - Promise that resolves to array of rules
 */
async function loadRulesFromStorage() {
  try {
    console.log("[GitHub PR Merge Method] Requesting rules from background...");

    // Send message to background script to get rules
    return new Promise((resolve) => {
      browserAPI.runtime.sendMessage({ action: "getRules" }, (response) => {
        if (browserAPI.runtime.lastError) {
          console.error(
            "[GitHub PR Merge Method] Error communicating with background:",
            browserAPI.runtime.lastError
          );
          resolve([]);
          return;
        }

        if (response && response.success) {
          console.log(
            "[GitHub PR Merge Method] Received rules from background:",
            response.rules
          );
          resolve(response.rules || []);
        } else {
          console.error(
            "[GitHub PR Merge Method] Failed to get rules:",
            response?.error
          );
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error("[GitHub PR Merge Method] Error loading rules:", error);
    return [];
  }
}

/**
 * Applies the merge method based on configured rules
 * @returns {Promise<boolean>} - True if a rule was applied, false otherwise
 */
async function applyMergeMethod() {
  try {
    console.log("[GitHub PR Merge Method] Starting applyMergeMethod...");

    // Check if we're on a PR page
    if (!isMainPRPage()) {
      console.log(
        "[GitHub PR Merge Method] Not on a main PR page, skipping merge method application"
      );
      return false;
    }

    // Extract repository and PR number
    const repository = extractRepoFromPath();
    console.log("[GitHub PR Merge Method] Extracted repository:", repository);
    if (!repository) {
      console.error(
        "[GitHub PR Merge Method] Could not extract repository from URL"
      );
      return false;
    }

    // Get target branch from page
    const branch = getBranchFromPRPage();
    console.log("[GitHub PR Merge Method] Extracted branch:", branch);
    if (!branch) {
      console.error(
        "[GitHub PR Merge Method] Could not extract target branch from page"
      );
      return false;
    }

    console.log(
      `[GitHub PR Merge Method] Processing PR for ${repository} targeting ${branch}`
    );

    // Debug: Show merge box structure
    debugMergeBox();

    // Load rules
    const rules = await loadRulesFromStorage();
    console.log("[GitHub PR Merge Method] Loaded rules:", rules);
    if (!rules || rules.length === 0) {
      console.log("[GitHub PR Merge Method] No rules configured");
      return false;
    }

    // Find matching rule
    const matchingRule = findMatchingRule(repository, branch, rules);
    console.log("[GitHub PR Merge Method] Matching rule:", matchingRule);
    if (!matchingRule) {
      console.log(
        `[GitHub PR Merge Method] No matching rule found for ${repository}:${branch}`
      );
      return false;
    }

    console.log(
      `[GitHub PR Merge Method] Found matching rule: ${matchingRule.mergeMethod} for ${repository}:${branch}`
    );

    // Apply the merge method
    const success = selectMergeMethod(matchingRule.mergeMethod);
    if (success) {
      console.log(
        `[GitHub PR Merge Method] Successfully applied merge method: ${matchingRule.mergeMethod}`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      "[GitHub PR Merge Method] Error applying merge method:",
      error
    );
    return false;
  }
}

/**
 * Waits for an element to appear in the DOM
 * @param {string} selector - CSS selector to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<HTMLElement|null>} - Promise that resolves to the element or null
 */
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Main entry point - runs when the content script loads
 */
async function main() {
  console.log("[GitHub PR Merge Method] Content script loaded");
  console.log("[GitHub PR Merge Method] Current URL:", location.href);
  console.log("[GitHub PR Merge Method] Pathname:", location.pathname);

  // Check if we're on a PR page
  if (!isMainPRPage()) {
    console.log(
      "[GitHub PR Merge Method] Not on a PR page, extension will not run"
    );
    return;
  }

  console.log("[GitHub PR Merge Method] On PR page, starting extension...");

  // Wait for the merge box to be present
  await waitForElement(".merge-box", 10000);

  // Small delay to ensure all elements are loaded
  setTimeout(async () => {
    await applyMergeMethod();
  }, 500);

  // Set up mutation observer to handle dynamic content changes
  // (e.g., when PR status changes from draft to ready)
  const observer = new MutationObserver(async (mutations) => {
    // Check if any mutation affected the merge box
    const mergeBoxChanged = mutations.some(
      (mutation) =>
        mutation.target.classList?.contains("merge-box") ||
        mutation.target.closest?.(".merge-box")
    );

    if (mergeBoxChanged) {
      console.log("Merge box changed, reapplying merge method...");
      await applyMergeMethod();
    }
  });

  const mergeBox = document.querySelector(".merge-box");
  if (mergeBox) {
    observer.observe(mergeBox, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }
}

// Run the main function when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getBranchFromPRPage,
    findMatchingRule,
    getMergeButton,
    getMergeMethodDropdown,
    getMergeMethodButtons,
    getMainMergeButton,
    getMergeMethodDropdownButton,
    openMergeMethodDropdown,
    getMergeMethodMenuItems,
    debugMergeBox,
    isMergeMethodAvailable,
    selectMergeMethod,
    loadRulesFromStorage,
    applyMergeMethod,
    waitForElement,
  };
}
