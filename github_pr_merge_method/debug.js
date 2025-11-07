// debug.js
const IS_DEV = true; // Set to false before publishing

// Export debug logger
// eslint-disable-next-line no-redeclare
const debug = {
  log: IS_DEV ? console.log.bind(console) : () => {},
  info: IS_DEV ? console.info.bind(console) : () => {},
  warn: IS_DEV ? console.warn.bind(console) : () => {},
  // Always allow errors
  error: console.error.bind(console),
};

// Browser environment
if (typeof window !== "undefined") {
  window.debug = debug;
}

// Node.js environment (for tests)
if (typeof module !== "undefined" && module.exports) {
  module.exports = debug;
}
