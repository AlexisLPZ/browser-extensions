const { isMainPRPage } = require("./content_utils.js");

describe("isMainPRPage", () => {
  test("should return true for main PR page", () => {
    expect(isMainPRPage("/facebook/react/pull/12345")).toBe(true);
  });

  test("should return true for PR with numbers in repo name", () => {
    expect(isMainPRPage("/user/repo-123/pull/456")).toBe(true);
  });

  test("should return true for PR with dots in repo name", () => {
    expect(isMainPRPage("/user/repo.js/pull/789")).toBe(true);
  });

  test("should return false for PR files page", () => {
    expect(isMainPRPage("/facebook/react/pull/12345/files")).toBe(false);
  });

  test("should return false for PR commits page", () => {
    expect(isMainPRPage("/facebook/react/pull/12345/commits")).toBe(false);
  });

  test("should return false for PR checks page", () => {
    expect(isMainPRPage("/facebook/react/pull/12345/checks")).toBe(false);
  });

  test("should return false for non-PR page", () => {
    expect(isMainPRPage("/facebook/react/issues/12345")).toBe(false);
  });

  test("should return false for repository root", () => {
    expect(isMainPRPage("/facebook/react")).toBe(false);
  });

  test("should return false for empty path", () => {
    expect(isMainPRPage("")).toBe(false);
  });

  test("should return false for invalid PR format", () => {
    expect(isMainPRPage("/facebook/react/pull/abc")).toBe(false);
  });
});
