import { describe, expect, it } from "vite-plus/test";

import { decode, encode, FINGERPRINT } from "#/lib/code.js";

// oxlint-disable no-bitwise
const MAX = (1n << 50n) - 1n;

describe("50-bit Feistel short code", () => {
	it.each([0n, 1n, 42n, 1n << 25n, MAX])("round trips %s", (id) => {
		expect(decode(encode(id))).toBe(String(id));
	});

	it("emits 10 Crockford characters", () => {
		expect(encode(42n)).toMatch(/^[\dA-HJKMNP-TV-Z]{10}$/);
	});

	it("is injective over a sample", () => {
		const codes = new Set();

		for (let id = 0n; id < 5000n; id++) {
			codes.add(encode(id));
		}

		expect(codes.size).toBe(5000);
	});

	it("rejects ids outside the code space", () => {
		expect(() => encode(1n << 50n)).toThrow(RangeError);
	});

	it("derives a sha256 fingerprint", () => {
		expect(FINGERPRINT).toHaveLength(32);
	});
});

describe("Crockford's Base32 leniency", () => {
	const code = encode(42n);

	it.each([
		["lowercase", code.toLowerCase()],
		["hyphenated", `${code.slice(0, 5)}-${code.slice(5)}`],
		["O for 0", code.replaceAll("0", "O")],
		["I for 1", code.replaceAll("1", "I")],
		["L for 1", code.replaceAll("1", "L")],
	])("accepts %s", (_, variant) => {
		expect(decode(variant)).toBe("42");
	});

	it.each([
		["too short", "ABC"],
		["too long", "ABCDEFGHJKM"],
		["non-alphabet", "UUUUUUUUUU"],
	])("rejects %s", (_, invalid) => {
		expect(decode(invalid)).toBeNull();
	});
});
