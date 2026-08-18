/** @type {import("express").RequestHandler} */
const cors = (req, res, next) => {
	const headers = {
		// TODO: limit origin
		Origin: ["*"],
		Methods: ["OPTIONS"],
		Headers: ["Origin", "Content-Type"],
	};

	// oxlint-disable typescript/no-unsafe-argument typescript/no-unsafe-call
	const methods = new Set(
		req.app.router.stack.flatMap((layer) =>
			// @ts-ignore
			layer.route && layer.match(req.path)
				? // @ts-ignore
					Object.keys(layer.route.methods).map((m) => m.toUpperCase())
				: [],
		),
	);
	// oxlint-enable typescript/no-unsafe-argument typescript/no-unsafe-call

	headers.Methods.push(...methods);

	for (const [field, value] of Object.entries(headers)) {
		res.header(`Access-Control-Allow-${field}`, value.join(","));
	}

	if (req.method === "OPTIONS") {
		return res.sendStatus(200);
	}

	next();
};

export default cors;
