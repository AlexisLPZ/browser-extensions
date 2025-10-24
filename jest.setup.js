// Jest setup file for browser extension testing
/* global jest, beforeEach */

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

// Reset localStorage mock before each test
beforeEach(() => {
  localStorageMock.data = {};
  jest.clearAllMocks();
});
