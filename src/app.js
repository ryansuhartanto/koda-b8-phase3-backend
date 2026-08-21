import express from "express";

import cors from "#/middleware/cors.js";
import auth from "#/routers/auth.js";
import docs from "#/routers/docs.js";
import urls from "#/routers/urls.js";

const { env } = process;
const port = Number(env["API_PORT"] ?? env["PORT"] ?? "3001");
const baseUrl = env["API_BASE_URL"] ?? "/";

/** @type {import("express").Express} */
const app = express();

app.use(cors);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const api = express.Router();

api.use("/", docs);

api.use("/auth", auth);
api.use("/", auth);
api.use("/urls", urls);
api.use("/links", urls);

app.use(baseUrl, api);

if (import.meta.main) {
	app.listen(port);
}

export default app;
