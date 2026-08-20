import { PostgresDialect } from "@sequelize/postgres";

const raw = process.env["POSTGRES_URL"];
const url = raw ? new URL(raw) : undefined;
const sslmode = url?.searchParams.get("sslmode") ?? "prefer";

/** @type {import("@sequelize/core").Options<PostgresDialect>} */
const options = {
	dialect: PostgresDialect,

	...(url && {
		host: url.hostname,
		port: Number(url.port || 5432),
		user: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
		database: url.pathname.slice(1),
		ssl:
			sslmode === "disable"
				? false
				: { rejectUnauthorized: sslmode.startsWith("verify") },
	}),
};

export default options;
