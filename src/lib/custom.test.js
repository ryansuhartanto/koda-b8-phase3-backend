import { describe, expect, it } from "vite-plus/test";

import { encode } from "#/lib/code.js";
import { reject } from "#/lib/custom.js";

describe("custom path rules", () => {
	it.each(["auth", "Docs", "openapi.json", "urls/mine"])(
		"reserves %s",
		(custom) => {
			expect(reject(custom)).toBe(
				"This custom path is reserved for our service",
			);
		},
	);

	it.each([encode(42n), encode(42n).toLowerCase(), "abcd-efghij"])(
		"refuses the generated code space: %s",
		(custom) => {
			expect(reject(custom)).toMatch(/^This custom path matches the format/);
		},
	);

	it.each([
		"my link",
		"a".repeat(256),
		"under_score",
		"café",
		"mailto:someone",
		"/leading",
		"trailing/",
		"go/../auth",
		"ask?q=1",
		"frag#ment",
		"https://example.com",
	])("refuses malformed %s", (custom) => {
		expect(reject(custom)).toBe("Invalid custom path");
	});

	it.each([
		"my-link",
		"sale2026",
		"a",
		"deep/nested/path",
		"v1.2/item:42$",
		"a+b%20c",
		"*star",
	])("accepts %s", (custom) => {
		expect(reject(custom)).toBeNull();
	});
});
