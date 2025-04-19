import { Request, Response } from "express";
import { CourseModel } from "../models/course.model";
import { StudentModel } from "../models/user.model";
import withTransaction from "../middlewares/transactionWrapper";
import { ClientSession } from "mongoose";

const getAvailableCourses = async (req: Request, res: Response) => {
  const userId = req.user._id;

  // 1. Get enrolled course IDs
  const user = await StudentModel.findById(userId).select("enrolledCourses");
  const enrolledCourseIds =
    user?.enrolledCourses?.map((c: any) => c.toString()) || [];

  // 2. Find available courses
  const availableCourses = await CourseModel.find({
    _id: { $nin: enrolledCourseIds },
  })
    .populate({
      path: "tutor",
      select: "name email", // Optimized tutor data
    })
    .select("title description thumbnail tutor createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: availableCourses.length,
    courses: availableCourses.map((course) => ({
      ...course,
      isEnrolled: false, // Explicitly flag as not enrolled
    })),
  });
};

const getCourseDetails = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const course = await CourseModel.findById(courseId)
    .populate({
      path: "tutor",
      select: "name email", // Only essential tutor info
    })
    .populate({
      path: "videos",
      select: "_id title order", // Only video metadata
    })
    .lean();

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Format response
  const response = {
    _id: course._id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    createdAt: course.createdAt,
    enrollments: course.enrollments.length,
    tutor: {
      _id: course.tutor._id,
      // @ts-ignore
      name: course.tutor?.name,
    },
    videos: course.videos
      ? course.videos.map((video) => ({
          _id: video._id,
          title: video.title,
          order: video.order,
        }))
      : [],
  };

  res.status(200).json({
    success: true,
    course: response,
  });
};

const enrollCourse = withTransaction(
  async (req: Request, res: Response, session: ClientSession) => {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // 1. Check if course exists
    const course = await CourseModel.findById(courseId).session(session);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isEnrolled = course.enrollments.some(
      (enrollment) => enrollment.student.toString() === studentId.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // 2. Check if student is already enrolled
    const student = await StudentModel.findById(studentId).session(session);
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // 3. Perform atomic updates
    await StudentModel.findByIdAndUpdate(
      studentId,
      { $addToSet: { enrolledCourses: courseId } },
      { session }
    );

    await CourseModel.findByIdAndUpdate(
      courseId,
      {
        $push: {
          enrollments: {
            student: studentId,
            enrolledAt: new Date(),
          },
        },
      },
      { session }
    );

    // 4. Commit happens automatically if no errors
    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      course,
    });
  }
);

export { getAvailableCourses, getCourseDetails, enrollCourse };
