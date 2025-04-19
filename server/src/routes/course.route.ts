import express from "express";
import {
  addVideo,
  createCourse,
  getCourse,
  getMyCourses,
  reorderVideos,
  updateCourseMetadata,
  updateVideo,
} from "../controllers/course.controller";
import authMiddleware, { roleMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create", authMiddleware, roleMiddleware("tutor"), createCourse);
router.post(
  "/add-video/:courseId",
  authMiddleware,
  roleMiddleware("tutor"),
  addVideo
); // Assuming addVideo is imported from the controller

router.put(
  "/:courseId/metadata",
  authMiddleware,
  roleMiddleware("tutor"),
  updateCourseMetadata
);

router.put(
  "/:courseId/video/:videoId",
  authMiddleware,
  roleMiddleware("tutor"),
  updateVideo
);

router.put(
  "/:courseId/videos/order",
  authMiddleware,
  roleMiddleware("tutor"),
  reorderVideos
);

router.get(
  "/my-courses",
  authMiddleware,
  roleMiddleware("tutor"),
  getMyCourses
);

router.get("/:courseId", authMiddleware, getCourse);

export default router;
