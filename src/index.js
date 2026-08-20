import app from "#/app.js";

const { env } = process;
const port = Number(env["API_PORT"] ?? env["PORT"] ?? "3001");

if (import.meta.main) {
	app.listen(port);
}

export default app;
