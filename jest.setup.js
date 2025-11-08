// Jest setup file for browser extension testing
/* global jest, beforeEach */

// Import debug utilities
// eslint-disable-next-line no-redeclare
const debug = require("./github_pr_merge_method/debug.js");

// Mock localStorage
const localStorageMock = {
  data: {},
  getItem: jest.fn((key) => localStorageMock.data[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.data[key] = value;
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock.data[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.data = {};
  }),
};

// Mock global objects
global.localStorage = localStorageMock;
global.location = {
  pathname: "/test/path",
};

// Add debug to global scope for tests
global.debug = debug;

// Reset localStorage mock before each test
beforeEach(() => {
  localStorageMock.data = {};
  jest.clearAllMocks();
});
