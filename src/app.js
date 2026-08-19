import { apiReference } from "@scalar/express-api-reference";
import express from "express";

import openapi from "#/docs/openapi.json" with { type: "json" };
import cors from "#/middleware/cors.js";
import auth from "#/routers/auth.js";
import urls from "#/routers/urls.js";

/** @type {import("express").Express} */
const app = express();

app.use(cors);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/openapi.json", (req, res) => {
	res.json({
		...openapi,
		servers: [{ url: `${req.protocol}://${req.get("host")}` }],
	});
});

app.get("/", (_req, res) => {
	res.redirect(301, "/docs");
});
app.use(
	"/docs",
	apiReference({
		url: "/openapi.json",
	}),
);

app.use("/auth", auth);
app.use("/urls", urls);

export default app;
