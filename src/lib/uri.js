import { createHash } from "node:crypto";

// RFC 3986 6.2.2 syntax-based normalization
const URI =
	/^(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/;

/**
 * @param {string} component
 */
function unreserved(component) {
	return component.replaceAll(
		/%([\dA-Fa-f]{2})/g,
		(/** @type {string} */ _, /** @type {string} */ hex) => {
			const character = String.fromCodePoint(Number.parseInt(hex, 16));
			return /[\w.~-]/.test(character) ? character : `%${hex.toUpperCase()}`;
		},
	);
}

/**
 * @param {string} path
 */
function dotless(path) {
	const segments = path.split("/");
	/** @type {string[]} */
	const output = [];

	for (const [index, segment] of segments.entries()) {
		if (segment === ".." && output.length > 1) {
			output.pop();
		} else if (segment !== "." && segment !== "..") {
			output.push(segment);
			continue;
		}

		if (index === segments.length - 1) {
			output.push("");
		}
	}

	return output.join("/");
}

/**
 * @param {string} url
 */
function normalize(url) {
	const [, scheme, authority, path = "", query, fragment] =
		/** @type {RegExpMatchArray} */ (URI.exec(url));

	let normalized = scheme === undefined ? "" : `${scheme.toLowerCase()}:`;

	if (authority !== undefined) {
		const at = authority.lastIndexOf("@") + 1;
		normalized += `//${unreserved(authority.slice(0, at))}${unreserved(authority.slice(at)).toLowerCase()}`;
	}

	normalized += dotless(unreserved(path));

	if (query !== undefined) {
		normalized += `?${unreserved(query)}`;
	}

	return fragment === undefined
		? normalized
		: `${normalized}#${unreserved(fragment)}`;
}

/**
 * @param {string} url
 */
export function digest(url) {
	return createHash("sha256").update(normalize(url)).digest();
}
