import { Router } from "express";
import authRouter from "./auth.routes";
import courseRouter from "./course.route";
import enrollRouter from "./enrollment.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/course", courseRouter);
router.use("/enroll", enrollRouter);

export default router;
