const { validateRule } = require('./rules.js');

describe('validateRule', () => {
  test('should return true for valid inputs', () => {
    expect(validateRule('owner/repo', 'main', 'squash')).toBe(true);
    expect(validateRule('user/project', 'develop', 'merge')).toBe(true);
    expect(validateRule('org/package', 'feature/*', 'rebase')).toBe(true);
  });

  test('should return false for missing parameters', () => {
    expect(validateRule('', 'main', 'squash')).toBe(false);
    expect(validateRule('owner/repo', '', 'squash')).toBe(false);
    expect(validateRule('owner/repo', 'main', '')).toBe(false);
    expect(validateRule(null, 'main', 'squash')).toBe(false);
  });

  test('should return false for invalid merge methods', () => {
    expect(validateRule('owner/repo', 'main', 'invalid')).toBe(false);
    expect(validateRule('owner/repo', 'main', 'fast-forward')).toBe(false);
    expect(validateRule('owner/repo', 'main', '')).toBe(false);
  });

  test('should return false for invalid repository format', () => {
    expect(validateRule('invalid-repo', 'main', 'squash')).toBe(false);
    expect(validateRule('owner/repo/extra', 'main', 'squash')).toBe(false);
    expect(validateRule('owner', 'main', 'squash')).toBe(false);
  });
});
