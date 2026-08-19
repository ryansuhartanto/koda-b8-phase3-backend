import { Router } from "express";

import * as Controller from "#/controllers/urls.js";
import auth from "#/middleware/auth.js";

/** @type {Router} */
const router = Router();

router.get("/:code", Controller.resolve);

router.use(auth);

router.get("/", Controller.list);
router.post("/", Controller.shorten);
router.patch("/:code", Controller.update);
router.delete("/:code", Controller.remove);

export default router;
