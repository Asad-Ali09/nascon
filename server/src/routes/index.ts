import { Router } from "express";
import authRouter from "./auth.routes";
import courseRouter from "./course.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/course", courseRouter);

export default router;
