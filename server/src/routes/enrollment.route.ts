import express from "express";

import authMiddleware, { roleMiddleware } from "../middlewares/authMiddleware";
import {
  enrollCourse,
  getAvailableCourses,
  getCourseDetails,
} from "../controllers/enrollment.controller";

const router = express.Router();

router.get(
  "/avail-courses",
  authMiddleware,
  roleMiddleware("student"),
  getAvailableCourses
);

router.get(
  "/:courseId",
  authMiddleware,
  roleMiddleware("student"),
  getCourseDetails
);

router.post(
  "/:courseId",
  authMiddleware,
  roleMiddleware("student"),
  enrollCourse
);

export default router;
