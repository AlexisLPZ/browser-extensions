const { validateRule } = require("./rules_utils.js");
const { generateRuleId } = require("./rules_utils.js");
const { canAddRule } = require("./rules_utils.js");
const { createMergeRule } = require("./rules_utils.js");
const { checkDuplicateRuleIds } = require("./rules_utils.js");
const { checkDuplicateRules } = require("./rules_utils.js");

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
    let debugWarnSpy;

    beforeEach(() => {
      debugWarnSpy = jest.spyOn(debug, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      debugWarnSpy.mockRestore();
    });

    it("should log error when JSON parsing fails", async () => {
      localStorage.getItem.mockReturnValue("invalid json");

      await expect(async () => {
        await canAddRule("owner/repo", "main");
      }).rejects.toThrow();

      expect(debugWarnSpy).toHaveBeenCalledWith(
        "Error checking for rule conflicts:",
        expect.any(Error)
      );
    });
  });
});

describe("checkDuplicateRuleIds", () => {
  describe("when rules array is empty or has no duplicates", () => {
    it("should return empty array for empty rules array", () => {
      const rules = [];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors).toEqual([]);
      expect(errors.length).toBe(0);
    });

    it("should return empty array for single rule", () => {
      const rules = [
        {
          id: "rule_1234567890_abc123def",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors).toEqual([]);
    });

    it("should return empty array when all IDs are unique", () => {
      const rules = [
        {
          id: "rule_1234567890_abc123def",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_1234567891_def456ghi",
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: "rule_1234567892_ghi789jkl",
          repository: "owner/repo3",
          branch: "feature",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors).toEqual([]);
    });
  });

  describe("when duplicate IDs exist", () => {
    it("should detect duplicate IDs between two rules", () => {
      const duplicateId = "rule_1234567890_abc123def";
      const rules = [
        {
          id: duplicateId,
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: duplicateId,
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain("Duplicate ID detected");
      expect(errors[0]).toContain("Rules 1 and 2");
      expect(errors[0]).toContain(duplicateId);
    });

    it("should detect multiple instances of the same duplicate ID", () => {
      const duplicateId = "rule_1234567890_abc123def";
      const rules = [
        {
          id: duplicateId,
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: duplicateId,
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: duplicateId,
          repository: "owner/repo3",
          branch: "feature",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors.length).toBe(2);
      expect(errors[0]).toContain("Rules 1 and 2");
      expect(errors[1]).toContain("Rules 1 and 3");
    });

    it("should detect multiple different duplicate IDs", () => {
      const rules = [
        {
          id: "rule_1111111111_aaaaaaaaa",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2222222222_bbbbbbbbb",
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: "rule_1111111111_aaaaaaaaa", // Duplicate of rule 1
          repository: "owner/repo3",
          branch: "feature",
          mergeMethod: "rebase",
        },
        {
          id: "rule_2222222222_bbbbbbbbb", // Duplicate of rule 2
          repository: "owner/repo4",
          branch: "staging",
          mergeMethod: "squash",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors.length).toBe(2);
      expect(errors[0]).toContain("rule_1111111111_aaaaaaaaa");
      expect(errors[1]).toContain("rule_2222222222_bbbbbbbbb");
    });

    it("should provide informative error messages", () => {
      const duplicateId = "rule_test_duplicate";
      const rules = [
        {
          id: duplicateId,
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_unique",
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: duplicateId,
          repository: "owner/repo3",
          branch: "feature",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors[0]).toBe(
        `Duplicate ID detected: Rules 1 and 3 both have ID "${duplicateId}"`
      );
    });
  });

  describe("edge cases", () => {
    it("should skip rules without ID field", () => {
      const rules = [
        {
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_1234567890_abc123def",
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors).toEqual([]);
    });

    it("should handle rules with null or undefined ID", () => {
      const rules = [
        {
          id: null,
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: undefined,
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: "rule_1234567890_abc123def",
          repository: "owner/repo3",
          branch: "feature",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors).toEqual([]);
    });

    it("should handle rules with empty string ID", () => {
      const rules = [
        {
          id: "",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "",
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      // Empty strings are falsy, so they should be skipped
      expect(errors).toEqual([]);
    });

    it("should handle large number of rules efficiently", () => {
      const rules = [];
      for (let i = 0; i < 1000; i++) {
        rules.push({
          id: `rule_${i}_unique`,
          repository: `owner/repo${i}`,
          branch: "main",
          mergeMethod: "squash",
        });
      }

      const startTime = Date.now();
      const errors = checkDuplicateRuleIds(rules);
      const endTime = Date.now();

      expect(errors).toEqual([]);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should report correct positions for non-consecutive duplicates", () => {
      const duplicateId = "rule_duplicate";
      const rules = [
        {
          id: "rule_unique_1",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: duplicateId,
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: "rule_unique_2",
          repository: "owner/repo3",
          branch: "staging",
          mergeMethod: "rebase",
        },
        {
          id: "rule_unique_3",
          repository: "owner/repo4",
          branch: "prod",
          mergeMethod: "squash",
        },
        {
          id: duplicateId,
          repository: "owner/repo5",
          branch: "feature",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRuleIds(rules);

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain("Rules 2 and 5");
    });
  });
});

describe("checkDuplicateRules", () => {
  describe("when rules array is empty or has no duplicates", () => {
    it("should return empty array for empty rules array", () => {
      const rules = [];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
      expect(errors.length).toBe(0);
    });

    it("should return empty array for single rule", () => {
      const rules = [
        {
          id: "rule_1234567890_abc123def",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
    });

    it("should return empty array when all repo/branch combinations are unique", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo2",
          branch: "main",
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo1",
          branch: "develop",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
    });

    it("should allow same branch for different repositories", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo2",
          branch: "main",
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo3",
          branch: "main",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
    });

    it("should allow same repository for different branches", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo",
          branch: "feature",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
    });
  });

  describe("when duplicate repo/branch combinations exist", () => {
    it("should detect duplicate repo/branch between two rules", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain("Duplicate rule detected");
      expect(errors[0]).toContain("Rules 1 and 2");
      expect(errors[0]).toContain("owner/repo/main");
    });

    it("should detect multiple instances of the same duplicate repo/branch", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(2);
      expect(errors[0]).toContain("Rules 1 and 2");
      expect(errors[1]).toContain("Rules 1 and 3");
    });

    it("should detect multiple different duplicate repo/branch combinations", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo2",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo1",
          branch: "main", // Duplicate of rule 1
          mergeMethod: "rebase",
        },
        {
          id: "rule_4",
          repository: "owner/repo2",
          branch: "develop", // Duplicate of rule 2
          mergeMethod: "squash",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(2);
      expect(errors[0]).toContain("owner/repo1/main");
      expect(errors[1]).toContain("owner/repo2/develop");
    });

    it("should provide informative error messages", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "different/repo",
          branch: "develop",
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors[0]).toBe(
        "Duplicate rule detected: Rules 1 and 3 both target owner/repo/main"
      );
    });

    it("should detect duplicates even with different merge methods", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(1);
    });

    it("should detect duplicates even with different IDs", () => {
      const rules = [
        {
          id: "rule_completely_different_1",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_completely_different_2",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "squash",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should skip rules without repository field", () => {
      const rules = [
        {
          id: "rule_1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
    });

    it("should skip rules without branch field", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
    });

    it("should handle rules with null or undefined repository/branch", () => {
      const rules = [
        {
          id: "rule_1",
          repository: null,
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: undefined,
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "rebase",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors).toEqual([]);
    });

    it("should handle rules with empty string repository/branch", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      // Empty strings are falsy, so they should be skipped
      expect(errors).toEqual([]);
    });

    it("should handle special characters in repository and branch names", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo-name",
          branch: "feature/test",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo-name",
          branch: "feature/test",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain("owner/repo-name/feature/test");
    });

    it("should be case-sensitive", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "Owner/Repo",
          branch: "Main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "main",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      // Different cases should be treated as different rules
      expect(errors).toEqual([]);
    });

    it("should handle wildcard branches as literal strings", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo",
          branch: "*",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo",
          branch: "*",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(1);
    });

    it("should handle large number of rules efficiently", () => {
      const rules = [];
      for (let i = 0; i < 1000; i++) {
        rules.push({
          id: `rule_${i}`,
          repository: `owner/repo${i}`,
          branch: "main",
          mergeMethod: "squash",
        });
      }

      const startTime = Date.now();
      const errors = checkDuplicateRules(rules);
      const endTime = Date.now();

      expect(errors).toEqual([]);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should report correct positions for non-consecutive duplicates", () => {
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo1",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo2",
          branch: "main",
          mergeMethod: "merge",
        },
        {
          id: "rule_3",
          repository: "owner/repo3",
          branch: "develop",
          mergeMethod: "rebase",
        },
        {
          id: "rule_4",
          repository: "owner/repo4",
          branch: "staging",
          mergeMethod: "squash",
        },
        {
          id: "rule_5",
          repository: "owner/repo2",
          branch: "main",
          mergeMethod: "merge",
        }, // Duplicate of rule 2
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain("Rules 2 and 5");
    });

    it("should handle repository names containing separator characters", () => {
      // Using ||| as separator internally, make sure it doesn't break
      const rules = [
        {
          id: "rule_1",
          repository: "owner/repo|||special",
          branch: "main",
          mergeMethod: "squash",
        },
        {
          id: "rule_2",
          repository: "owner/repo|||special",
          branch: "main",
          mergeMethod: "merge",
        },
      ];
      const errors = checkDuplicateRules(rules);

      expect(errors.length).toBe(1);
    });
  });
});
