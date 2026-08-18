/**
 * @param {import("express").Router["stack"]} stack
 * @param {string} path Path relative to the current stack's mount point.
 * @returns {string[]}
 */
// oxlint-disable typescript/no-unsafe-assignment typescript/no-unsafe-argument typescript/no-unsafe-call
const collectMethods = (stack, path) =>
	stack.flatMap((layer) => {
		// @ts-ignore
		if (!path.test(layer)) {
			return [];
		}
		if (layer.route) {
			// @ts-ignore
			return Object.keys(layer.route.methods)
				.filter((m) => !m.startsWith("_"))
				.map((m) => m.toUpperCase());
		}
		// @ts-ignore
		const nested = layer.handle?.stack;
		return nested
			? // @ts-ignore
				collectMethods(nested, path.slice(layer.path.length) || "/")
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
