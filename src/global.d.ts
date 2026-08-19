import * as express from "express";
import type { JwtPayload } from "jsonwebtoken";

declare global {
	interface RequestAuth extends JwtPayload {
		sub: string;
		email: string;
	}
	namespace Express {
		interface Request {
			auth?: RequestAuth;
		}
	}
}
