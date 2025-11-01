const { isMainPRPage } = require("./utils.js");
const { validateRule } = require("./utils.js");
const { generateRuleId } = require("./utils.js");
const { canAddRule } = require("./utils.js");
const { createMergeRule } = require("./utils.js");

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

describe("createMergeRule", () => {
  test("should create a merge rule with correct structure", () => {
    const rule = createMergeRule("owner/repo", "main", "squash");

    expect(rule).toHaveProperty("id");
    expect(rule).toHaveProperty("repository");
    expect(rule).toHaveProperty("branch");
    expect(rule).toHaveProperty("mergeMethod");
    expect(rule).toHaveProperty("createdAt");
    expect(rule).toHaveProperty("updatedAt");
  });

  test("should return correct data for squash merge into main", () => {
    const rule = createMergeRule("owner/repo", "main", "squash");

    expect(rule.id).toMatch(/^rule_\d+_[a-z0-9]{9}$/);
    expect(rule.repository).toBe("owner/repo");
    expect(rule.branch).toBe("main");
    expect(rule.mergeMethod).toBe("squash");
  });

  test("should return correct data for merge merge into develop", () => {
    const rule = createMergeRule("organization/repo", "develop", "merge");

    expect(rule.id).toMatch(/^rule_\d+_[a-z0-9]{9}$/);
    expect(rule.repository).toBe("organization/repo");
    expect(rule.branch).toBe("develop");
    expect(rule.mergeMethod).toBe("merge");
  });
});

describe("canAddRule", () => {
  describe("when localStorage is empty", () => {
    it("should return true for any repository and branch", async () => {
      localStorage.getItem.mockReturnValue(null);

      const result = await canAddRule("owner/repo", "main");

      expect(result).toBe(true);
      expect(localStorage.getItem).toHaveBeenCalledWith("mergeRules");
    });

    it("should use DEFAULT_RULES_COLLECTION when no data exists", async () => {
      localStorage.getItem.mockReturnValue(null);

      await canAddRule("owner/repo", "main");

      expect(localStorage.getItem).toHaveBeenCalledWith("mergeRules");
    });
  });

  describe("when localStorage contains rules", () => {
    beforeEach(() => {
      // Create rules manually to avoid validateRule calls
      const existingRules = {
        version: "1.0.0",
        rules: [
          {
            id: "rule_1234567890_abc123def",
            repository: "owner/repo1",
            branch: "main",
            mergeMethod: "squash",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "rule_1234567891_def456ghi",
            repository: "owner/repo2",
            branch: "develop",
            mergeMethod: "merge",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "rule_1234567892_ghi789jkl",
            repository: "owner/repo1",
            branch: "develop",
            mergeMethod: "rebase",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
        ],
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(existingRules));
    });

    it("should return false when exact repository and branch match exists", async () => {
      const result = await canAddRule("owner/repo1", "main");

      expect(result).toBe(false);
    });

    it("should return false when exact repository and branch match exists (different case)", async () => {
      const result = await canAddRule("owner/repo2", "develop");

      expect(result).toBe(false);
    });

    it("should return true when repository matches but branch is different", async () => {
      const result = await canAddRule("owner/repo1", "feature-branch");

      expect(result).toBe(true);
    });

    it("should return true when branch matches but repository is different", async () => {
      const result = await canAddRule("owner/repo3", "main");

      expect(result).toBe(true);
    });

    it("should return true when both repository and branch are different", async () => {
      const result = await canAddRule("owner/repo3", "feature-branch");

      expect(result).toBe(true);
    });

    it("should return true when repository is similar but not exact match", async () => {
      const result = await canAddRule("owner/repo1-test", "main");

      expect(result).toBe(true);
    });
  });

  describe("when localStorage contains malformed JSON", () => {
    it("should throw an error when JSON is invalid", async () => {
      localStorage.getItem.mockReturnValue("invalid json");

      await expect(async () => {
        await canAddRule("owner/repo", "main");
      }).rejects.toThrow();
    });

    it("should throw an error when JSON structure is wrong", async () => {
      localStorage.getItem.mockReturnValue('{"invalid": "structure"}');

      await expect(async () => {
        await canAddRule("owner/repo", "main");
      }).rejects.toThrow();
    });
  });

  describe("when localStorage.getItem throws an error", () => {
    it("should propagate the error", async () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage access denied");
      });

      await expect(async () => {
        await canAddRule("owner/repo", "main");
      }).rejects.toThrow("localStorage access denied");
    });
  });

  describe("edge cases", () => {
    it("should handle empty rules array", async () => {
      const emptyRules = {
        version: "1.0.0",
        rules: [],
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(emptyRules));

      const result = await canAddRule("owner/repo", "main");

      expect(result).toBe(true);
    });

    it("should handle rules with asterisk branches as exact matches", async () => {
      const rulesWithAsterisk = {
        version: "1.0.0",
        rules: [
          {
            id: "rule_1234567890_abc123def",
            repository: "owner/repo",
            branch: "*",
            mergeMethod: "squash",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
        ],
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(rulesWithAsterisk));

      // Should return false only for exact match with "*" branch
      expect(await canAddRule("owner/repo", "*")).toBe(false);

      // Should return true for different branches (asterisk is treated as literal)
      expect(await canAddRule("owner/repo", "main")).toBe(true);
    });

    it("should handle special characters in repository and branch names", async () => {
      const specialCharRules = {
        version: "1.0.0",
        rules: [
          {
            id: "rule_1234567890_abc123def",
            repository: "owner/repo-name",
            branch: "feature/branch",
            mergeMethod: "squash",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
        ],
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(specialCharRules));

      // Should return false for exact match
      expect(await canAddRule("owner/repo-name", "feature/branch")).toBe(false);

      // Should return true for different special chars
      expect(await canAddRule("owner/repo_name", "feature-branch")).toBe(true);
    });

    it("should handle case sensitivity correctly", async () => {
      const caseSensitiveRules = {
        version: "1.0.0",
        rules: [
          {
            id: "rule_1234567890_abc123def",
            repository: "Owner/Repo",
            branch: "Main",
            mergeMethod: "squash",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
          },
        ],
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(caseSensitiveRules));

      // Should return false for exact case match
      expect(await canAddRule("Owner/Repo", "Main")).toBe(false);

      // Should return true for different case
      expect(await canAddRule("owner/repo", "main")).toBe(true);
    });
  });

  describe("parameter validation", () => {
    it("should handle undefined repository parameter", async () => {
      localStorage.getItem.mockReturnValue(null);

      await expect(async () => {
        await canAddRule(undefined, "main");
      }).not.toThrow();
    });

    it("should handle undefined branch parameter", async () => {
      localStorage.getItem.mockReturnValue(null);

      await expect(async () => {
        await canAddRule("owner/repo", undefined);
      }).not.toThrow();
    });

    it("should handle null parameters", async () => {
      localStorage.getItem.mockReturnValue(null);

      await expect(async () => {
        await canAddRule(null, null);
      }).not.toThrow();
    });
  });

  describe("console.error behavior", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should log error when JSON parsing fails", async () => {
      localStorage.getItem.mockReturnValue("invalid json");

      await expect(async () => {
        await canAddRule("owner/repo", "main");
      }).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error checking for rule conflicts:",
        expect.any(Error)
      );
    });
  });
});
