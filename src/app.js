import express from "express";

import cors from "#/middleware/cors.js";

/** @type {import("express").Express} */
const app = express();

app.use(cors);

app.get("/", (_req, res) => {
	res.send("Hello, World!");
});

app.use();

export default app;
