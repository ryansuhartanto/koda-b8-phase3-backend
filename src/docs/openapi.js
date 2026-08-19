import { writeFileSync } from "node:fs";

import swaggerJsdoc from "swagger-jsdoc";

const root = import.meta.dirname;

const spec = swaggerJsdoc({
	failOnErrors: true,
	apis: [`${root}/../**/*.js`],
	definition: {
		openapi: "3.1.0",
		info: {
			title: "ShortLink API",
			version: "1.0.0",
			license: { name: "MIT", identifier: "MIT" },
		},
		security: [{ bearerAuth: [] }],
	},
});

writeFileSync(`${root}/openapi.json`, `${JSON.stringify(spec, null, "\t")}\n`);
