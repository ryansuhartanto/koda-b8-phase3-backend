import express from "express";

/** @type {import("express").Express} */
const app = express();

app.get("/", (_req, res) => {
	res.send("Hello, World!");
});

export default app;
