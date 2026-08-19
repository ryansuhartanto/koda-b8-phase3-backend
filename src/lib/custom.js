import { decode } from "#/lib/code.js";

const RESERVED = /^(auth|docs|openapi\.json|urls)(\/|$)/i;
// QR alphanumeric mode
const ALLOWED = /^[\d$%*+./:A-Za-z-]+$/;
const LIMIT = 255;
const BASE = "https://x/";

/**
 * @param {string} path
 */
function canonical(path) {
	if (
		path.length > LIMIT ||
		!ALLOWED.test(path) ||
		path.startsWith("/") ||
		path.endsWith("/") ||
		!URL.canParse(path, BASE)
	) {
		return false;
	}

	const { pathname, search, hash } = new URL(path, BASE);

	return pathname === `/${path}` && !search && !hash;
}

/**
 * @param {string} custom
 * @returns {string?}
 */
export function reject(custom) {
	if (RESERVED.test(custom)) {
		return "This custom path is reserved for our service";
	}

	if (!canonical(custom)) {
		return "Invalid custom path";
	}

	if (decode(custom) !== null) {
		return "This custom path matches the format of an auto-generated code of 10 characters made only of Crockford's Base32";
	}

	return null;
}
