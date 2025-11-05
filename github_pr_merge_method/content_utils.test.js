const { isMainPRPage } = require("./content_utils.js");
const { extractRepoFromPath } = require("./content_utils.js");

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

describe("extractRepoFromPath", () => {
  test("should extract repo from main PR page", () => {
    expect(extractRepoFromPath("/facebook/react/pull/12345")).toBe(
      "facebook/react"
    );
  });

  test("should extract repo from PR files page", () => {
    expect(extractRepoFromPath("/facebook/react/pull/12345/files")).toBe(
      "facebook/react"
    );
  });

  test("should extract repo from PR commits page", () => {
    expect(extractRepoFromPath("/facebook/react/pull/12345/commits")).toBe(
      "facebook/react"
    );
  });

  test("should extract repo with numbers in name", () => {
    expect(extractRepoFromPath("/user/repo-123/pull/456")).toBe(
      "user/repo-123"
    );
  });

  test("should extract repo with dots in name", () => {
    expect(extractRepoFromPath("/user/repo.js/issues/789")).toBe(
      "user/repo.js"
    );
  });

  test("should extract repo from issues page", () => {
    expect(extractRepoFromPath("/owner/repo/issues/123")).toBe("owner/repo");
  });

  test("should extract repo from any path with owner/repo pattern", () => {
    expect(extractRepoFromPath("/owner/repo/actions/runs/123")).toBe(
      "owner/repo"
    );
  });

  test("should return null for repository root without trailing slash", () => {
    expect(extractRepoFromPath("/facebook/react")).toBe(null);
  });

  test("should extract repo from repository root with trailing slash", () => {
    expect(extractRepoFromPath("/facebook/react/")).toBe("facebook/react");
  });

  test("should return null for empty path", () => {
    expect(extractRepoFromPath("")).toBe(null);
  });

  test("should return null for single segment path", () => {
    expect(extractRepoFromPath("/facebook")).toBe(null);
  });

  test("should return null for root path", () => {
    expect(extractRepoFromPath("/")).toBe(null);
  });

  test("should return null for invalid path format", () => {
    expect(extractRepoFromPath("/invalid")).toBe(null);
  });

  test("should handle hyphens and underscores in owner/repo names", () => {
    expect(extractRepoFromPath("/my-org_name/my-repo_name/pull/1")).toBe(
      "my-org_name/my-repo_name"
    );
  });
});
