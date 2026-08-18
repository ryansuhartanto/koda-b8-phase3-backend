import app from "#/app.js";

const { env } = process;
const port = Number.parseInt(env["API_PORT"] ?? env["PORT"] ?? "3001", 10);

app.listen(port);
