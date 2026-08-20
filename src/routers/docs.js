import { apiReference } from "@scalar/express-api-reference";
import express from "express";

import openapi from "#/docs/openapi.json" with { type: "json" };

const docs = express.Router();

docs.get("/openapi.json", (req, res) => {
	res.json({
		...openapi,
		servers: [{ url: `${req.protocol}://${req.get("host")}${req.baseUrl}` }],
	});
});
docs.get("/", (req, res) => {
	res.redirect(301, `${req.baseUrl}/docs`);
});
docs.get(
	"/docs",
	(req, res, next) =>
		/** @type {import("express").RequestHandler} */ (
			apiReference({
				url: `${req.baseUrl}/openapi.json`,
			})
		)(req, res, next),
);

export default docs;
