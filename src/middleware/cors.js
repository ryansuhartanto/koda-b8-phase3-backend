// oxlint-disable typescript/no-unsafe-assignment typescript/no-unsafe-argument typescript/no-unsafe-call
/**
 * @typedef RouterLayer
 * @property {(path: string) => boolean} match
 * @property {string} [path]
 * @property {{ methods: Record<string, boolean> }} [route]
 * @property {{ stack?: RouterLayer[] }} handle
 */

/**
 * @param {RouterLayer[]} stack
 * @param {string} path Path relative to the current stack's mount point.
 * @returns {string[]}
 */
const collectMethods = (stack, path) =>
	stack.flatMap((layer) => {
		// oxlint-disable-next-line unicorn/prefer-regexp-test
		if (!layer.match(path)) {
			return [];
		}
		if (layer.route) {
			return Object.keys(layer.route.methods)
				.filter((m) => !m.startsWith("_"))
				.map((m) => m.toUpperCase());
		}
		const prefix = layer.path ?? "";
		const nested = layer.handle?.stack;
		return nested
			? collectMethods(nested, path.slice(prefix.length) || "/")
			: [];
	});
// oxlint-enable typescript/no-unsafe-assignment typescript/no-unsafe-argument typescript/no-unsafe-call

/**
 * @type {import("express").RequestHandler}
 * @returns {any}
 */
const cors = (req, res, next) => {
	const headers = {
		// TODO: limit origin
		Origin: ["*"],
		Methods: ["OPTIONS"],
		Headers: ["Origin", "Content-Type"],
	};

	// @ts-ignore
	const methods = new Set(collectMethods(req.app.router.stack, req.path));
	if (methods.has("GET")) {
		methods.add("HEAD");
	}
	headers.Methods.push(...methods);

	for (const [field, value] of Object.entries(headers)) {
		res.header(`Access-Control-Allow-${field}`, value);
	}

	if (req.method === "OPTIONS") {
		return res.sendStatus(200);
	}

	next();
};

export default cors;
