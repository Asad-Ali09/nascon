import { Router } from "express";
import authRouter from "./auth.routes";
import courseRouter from "./course.route";
import enrollRouter from "./enrollment.route";
import chatRouter from "./chat.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/course", courseRouter);
router.use("/enroll", enrollRouter);
router.use("/chat", chatRouter);

export default router;
