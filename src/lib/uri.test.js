import { describe, expect, it } from "vite-plus/test";

import { digest } from "#/lib/uri.js";

/**
 * @param {string} a
 * @param {string} b
 */
const same = (a, b) => digest(a).equals(digest(b));

describe("RFC 3986 6.2.2 syntax-based normalization", () => {
	it.each([
		["HTTP://www.EXAMPLE.com/x", "http://www.example.com/x"],
		["http://example.com/%7Efoo", "http://example.com/~foo"],
		["http://example.com/%7efoo", "http://example.com/~foo"],
		["http://example.com/a/b/c/./../../g", "http://example.com/a/g"],
		["http://example.com/x%2fy", "http://example.com/x%2Fy"],
	])("%s hashes as %s", (a, b) => {
		expect(same(a, b)).toBe(true);
	});

	it.each([
		["http://example.com:80/", "http://example.com/"],
		["http://example.com", "http://example.com/"],
		["http://example.com/?a=1&b=2", "http://example.com/?b=2&a=1"],
		["http://example.com/x", "http://example.com/x#f"],
		["http://example.com/X", "http://example.com/x"],
		["http://User@example.com/", "http://user@example.com/"],
		["https://example.com/", "http://example.com/"],
	])("%s differs from %s", (a, b) => {
		expect(same(a, b)).toBe(false);
	});
});
