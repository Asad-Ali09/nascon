import { AssemblyAI } from "assemblyai";
import { Request, Response } from "express";
import { ASSEMBLYAI_API_KEY } from "../config";
import { CourseModel } from "../models/course.model";
import customError from "../utils/customError";
import { AnyArray, ClientSession, Types } from "mongoose";
import { Video } from "../types/courseTypes";
import withTransaction from "../middlewares/transactionWrapper";

const client = new AssemblyAI({
  apiKey: ASSEMBLYAI_API_KEY!,
});

const createCourse = async (req: Request, res: Response) => {
  const { title, description, thumbnail } = req.body;
  const tutorId = req.user._id;

  if (!title || !description || !thumbnail) {
    throw new customError(400, "All fields are required");
  }

  const course = await CourseModel.create({
    title,
    description,
    thumbnail,
    tutor: tutorId,
    videos: [], // Added later
  });

  res.status(201).json({ success: true, course });
};

const addVideo = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { url, title } = req.body;

  const course = await CourseModel.findById(courseId);
  if (!course) throw new customError(404, "Course not found");

  const transcript = await generateTranscript(url);

  course.videos.push({
    url,
    title,
    order: course.videos.length + 1, // Auto-increment order
    transcript,
  });

  await course.save();
  res.status(200).json({ success: true, course });
};

async function generateTranscript(audioUrl: string): Promise<string> {
  console.log("Generating transcript for:", audioUrl);

  try {
    // Option 1: Using AssemblyAI SDK
    const transcript = await client.transcripts.create({
      audio_url: audioUrl,
    });
    return transcript.text || "";
  } catch (error) {
    console.error("AssemblyAI error:", error);
    return ""; // Return empty if transcription fails
  }
}

const updateCourseMetadata = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { title, description, thumbnail } = req.body;

  const updatedCourse = await CourseModel.findByIdAndUpdate(
    courseId,
    { title, description, thumbnail },
    { new: true, runValidators: true }
  );

  if (!updatedCourse) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
  }

  res.status(200).json({
    success: true,
    course: updatedCourse,
  });
};

const updateVideo = async (req: Request, res: Response) => {
  const { courseId, videoId } = req.params;
  const { title, url } = req.body;

  const course = await CourseModel.findById(courseId);
  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
  }

  const videoIndex = course.videos.findIndex(
    (v) => v._id.toString() === videoId
  );
  if (videoIndex === -1) {
    return res.status(404).json({ success: false, message: "Video not found" });
  }

  // Store previous URL for transcript check
  const previousUrl = course.videos[videoIndex].url;
  const urlChanged = url && url !== previousUrl;

  // Update video data
  if (title) course.videos[videoIndex].title = title;
  if (url) course.videos[videoIndex].url = url;
  if (urlChanged)
    course.videos[videoIndex].transcript = await generateTranscript(url);

  await course.save();

  res.status(200).json({
    success: true,
    course,
  });
};
const reorderVideos = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { videos: submittedVideos } = req.body; // Array of complete video objects

  // 1. Find the course
  const course = await CourseModel.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // 2. Validate all submitted videos exist in course
  const existingVideoIds = course.videos.map((v) => v._id.toString());
  const invalidVideos = submittedVideos.filter(
    (v: any) => !existingVideoIds.includes(v._id)
  );

  if (invalidVideos.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Contains invalid videos",
      invalidVideoIds: invalidVideos.map((v: any) => v._id),
    });
  }

  // 3. Create lookup map for existing videos
  const videoMap = new Map(
    course.videos.map((video) => [video._id.toString(), video])
  );

  // 4. Rebuild videos array in new order (preserving all original data)
  const reorderedVideos = submittedVideos.map(
    (submittedVideo: any, index: number) => {
      const originalVideo = videoMap.get(submittedVideo._id)!;
      return {
        ...originalVideo.toObject(), // Keep all original fields
        order: index + 1, // Only update the order
      };
    }
  );

  // 5. Save the new order
  course.videos = reorderedVideos;
  await course.save();

  res.status(200).json({
    success: true,
    course,
  });
};

const getMyCourses = async (req: Request, res: Response) => {
  // Get tutor ID from authenticated user
  const tutorId = req.user._id;

  // Find courses where tutor matches, with basic video info
  const courses = await CourseModel.find(
    { tutor: tutorId },
    {
      title: 1,
      description: 1,
      thumbnail: 1,
      createdAt: 1,
      "videos._id": 1,
      "videos.title": 1,
      "videos.url": 1,
      "videos.order": 1,
      "videos.createdAt": 1,
    }
  ).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    courses,
  });
};

export {
  addVideo,
  createCourse,
  updateCourseMetadata,
  updateVideo,
  reorderVideos,
  getMyCourses,
};
