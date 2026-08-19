import express from "express";

import cors from "#/middleware/cors.js";
import auth from "#/routers/auth.js";
import urls from "#/routers/urls.js";

/** @type {import("express").Express} */
const app = express();

app.use(cors);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
	res.send("Hello, World!");
});

app.use("/auth", auth);
app.use("/urls", urls);

export default app;
