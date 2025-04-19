import express from "express";
import { addVideo, createCourse } from "../controllers/course.controller";
import authMiddleware, { roleMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create", authMiddleware, roleMiddleware("tutor"), createCourse);
router.post(
  "/add-video/:courseId",
  authMiddleware,
  roleMiddleware("tutor"),
  addVideo
); // Assuming addVideo is imported from the controller

export default router;
