import { createHash, hkdfSync } from "node:crypto";

import siphash13 from "siphash/lib/siphash13.js";

// 50-bit Feistel PRP (SipHash-1-3 PRF) -> 10-char Crockford's Base32
// oxlint-disable no-bitwise unicorn/number-literal-case
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 10;
const HALF_BITS = 25n;
const HALF_MASK = 0x1ffffff;
const ROUNDS = 8;

const MASTER = Buffer.from(
	/** @type {string} */ (process.env["LINK_KEY"]),
	"hex",
);
const KEY_MATERIAL = Buffer.from(
	hkdfSync("sha256", MASTER, "", "link-feistel", ROUNDS * 16),
);
const ROUND_KEYS = Array.from({ length: ROUNDS }, (_, i) => {
	const k = KEY_MATERIAL.subarray(i * 16, (i + 1) * 16);
	return Uint32Array.of(
		k.readUInt32LE(0),
		k.readUInt32LE(4),
		k.readUInt32LE(8),
		k.readUInt32LE(12),
	);
});
const SCRATCH = Buffer.allocUnsafe(4);

/**
 * @param {number} value
 * @param {Uint32Array} key
 */
function round(value, key) {
	SCRATCH.writeUInt32BE(value);
	return siphash13.hash(key, SCRATCH).l & HALF_MASK;
}

/**
 * @param {bigint} value
 */
function encipher(value) {
	let left = Number((value >> HALF_BITS) & BigInt(HALF_MASK));
	let right = Number(value & BigInt(HALF_MASK));

	for (const key of ROUND_KEYS) {
		[left, right] = [right, left ^ round(right, key)];
	}

	return (BigInt(left) << HALF_BITS) | BigInt(right);
}

/**
 * @param {bigint} value
 */
function decipher(value) {
	let left = Number((value >> HALF_BITS) & BigInt(HALF_MASK));
	let right = Number(value & BigInt(HALF_MASK));

	for (const key of ROUND_KEYS.toReversed()) {
		[left, right] = [right ^ round(left, key), left];
	}

	return (BigInt(left) << HALF_BITS) | BigInt(right);
}

/**
 * @param {bigint} value
 */
function block(value) {
	const buffer = Buffer.allocUnsafe(8);
	buffer.writeBigUInt64BE(encipher(value));
	return buffer;
}

// rekeying reassigns every issued code, so the key is pinned in the db
export const FINGERPRINT = createHash("sha256")
	.update(Buffer.concat([block(0n), block(1n), block(42n)]))
	.digest();

/**
 * @param {bigint} id
 */
export function encode(id) {
	if (id >> (HALF_BITS * 2n)) {
		throw new RangeError("id is outside the 50 bit short code space");
	}

	const value = encipher(id);
	let code = "";

	for (let i = CODE_LENGTH - 1; i >= 0; i--) {
		code += ALPHABET[Number((value >> BigInt(i * 5)) & 31n)];
	}

	return code;
}

/**
 * @param {string} code
 * @returns {string?}
 */
export function decode(code) {
	// Crockford: hyphens decorative, O is 0, I and L are 1
	const normalized = code
		.replaceAll("-", "")
		.toUpperCase()
		.replaceAll("O", "0")
		.replaceAll(/[IL]/g, "1");

	if (normalized.length !== CODE_LENGTH) {
		return null;
	}

	let value = 0n;

	for (const character of normalized) {
		const index = ALPHABET.indexOf(character);

		if (index === -1) {
			return null;
		}

		value = (value << 5n) | BigInt(index);
	}

	return String(decipher(value));
}
