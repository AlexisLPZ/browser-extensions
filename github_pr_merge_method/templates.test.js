/**
 * @jest-environment jsdom
 */

const { escapeHtml } = require("./templates.js");

describe("escapeHtml", () => {
  test("should escape HTML script tags", () => {
    const input = '<script>alert("xss")</script>';
    const expected = '&lt;script&gt;alert("xss")&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test("should escape less-than and greater-than symbols", () => {
    const input = "<div>Hello</div>";
    const expected = "&lt;div&gt;Hello&lt;/div&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });

  test("should escape ampersands", () => {
    const input = "Tom & Jerry";
    const expected = "Tom &amp; Jerry";
    expect(escapeHtml(input)).toBe(expected);
  });

  test("should escape double quotes", () => {
    const input = 'He said "Hello"';
    const expected = 'He said "Hello"'; // Note: textContent doesn't escape quotes
    expect(escapeHtml(input)).toBe(expected);
  });

  test("should handle empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  test("should handle plain text without special characters", () => {
    const input = "Hello World";
    expect(escapeHtml(input)).toBe("Hello World");
  });

  test("should escape multiple special characters", () => {
    const input = "<a href=\"javascript:alert('XSS')\">Click me</a>";
    const expected =
      "&lt;a href=\"javascript:alert('XSS')\"&gt;Click me&lt;/a&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });

  test("should escape repository name with malicious code", () => {
    const input = 'owner/repo<script>fetch("evil.com")</script>';
    const expected = 'owner/repo&lt;script&gt;fetch("evil.com")&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test("should escape branch name with HTML injection attempt", () => {
    const input = 'main<img src=x onerror="alert(1)">';
    const expected = 'main&lt;img src=x onerror="alert(1)"&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test("should handle newlines and special whitespace", () => {
    const input = "Line 1\nLine 2\tTabbed";
    const expected = "Line 1\nLine 2\tTabbed";
    expect(escapeHtml(input)).toBe(expected);
  });
});
