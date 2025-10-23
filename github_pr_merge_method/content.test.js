const { isMainPRPage } = require("./content.js");
const { validateRule } = require("./content.js");
const { generateRuleId } = require("./content.js");

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

describe("validateRule", () => {
  test("should return true for valid inputs", () => {
    expect(validateRule("owner/repo", "main", "squash")).toBe(true);
    expect(validateRule("user/project", "develop", "merge")).toBe(true);
    expect(validateRule("org/package", "feature/*", "rebase")).toBe(true);
  });

  test("should return false for missing parameters", () => {
    expect(validateRule("", "main", "squash")).toBe(false);
    expect(validateRule("owner/repo", "", "squash")).toBe(false);
    expect(validateRule("owner/repo", "main", "")).toBe(false);
    expect(validateRule(null, "main", "squash")).toBe(false);
  });

  test("should return false for invalid merge methods", () => {
    expect(validateRule("owner/repo", "main", "invalid")).toBe(false);
    expect(validateRule("owner/repo", "main", "fast-forward")).toBe(false);
    expect(validateRule("owner/repo", "main", "")).toBe(false);
  });

  test("should return false for invalid repository format", () => {
    expect(validateRule("invalid-repo", "main", "squash")).toBe(false);
    expect(validateRule("owner/repo/extra", "main", "squash")).toBe(false);
    expect(validateRule("owner", "main", "squash")).toBe(false);
  });
});

describe("generateRuleId", () => {
  test("should return a string", () => {
    const id = generateRuleId();
    expect(typeof id).toBe("string");
  });

  test('should start with "rule_" prefix', () => {
    const id = generateRuleId();
    expect(id).toMatch(/^rule_/);
  });

  test("should contain timestamp", () => {
    const id = generateRuleId();
    const parts = id.split("_");
    expect(parts).toHaveLength(3);
    expect(parts[1]).toMatch(/^\d+$/); // Should be numeric timestamp
  });

  test("should contain random string suffix", () => {
    const id = generateRuleId();
    const parts = id.split("_");
    expect(parts[2]).toMatch(/^[a-z0-9]{9}$/); // 9 alphanumeric characters
  });

  test("should generate unique IDs", () => {
    const ids = new Set();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      ids.add(generateRuleId());
    }

    expect(ids.size).toBe(iterations);
  });

  test("should have consistent format", () => {
    const id = generateRuleId();
    const expectedPattern = /^rule_\d+_[a-z0-9]{9}$/;
    expect(id).toMatch(expectedPattern);
  });

  test("should generate different IDs when called multiple times", () => {
    const id1 = generateRuleId();
    const id2 = generateRuleId();
    expect(id1).not.toBe(id2);
  });

  test("should have correct length", () => {
    const id = generateRuleId();
    // Format: "rule_" (5) + timestamp (13) + "_" (1) + random (9) = 28
    expect(id.length).toBeGreaterThan(20); // At least 20 chars
    expect(id.length).toBeLessThan(35); // Less than 35 chars
  });

  test("should handle rapid successive calls", () => {
    const ids = [];
    const startTime = Date.now();

    // Generate 100 IDs rapidly
    for (let i = 0; i < 100; i++) {
      ids.push(generateRuleId());
    }

    const endTime = Date.now();
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(100);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly
  });
});
