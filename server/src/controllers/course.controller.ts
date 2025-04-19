import { Request, Response } from "express";
import { CourseModel } from "../models/course.model";
import customError from "../utils/customError";
import { ASSEMBLYAI_API_KEY } from "../config";
import { AssemblyAI } from "assemblyai";

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

// const editCourse = async (req: Request, res: Response) => {
//   const { courseId } = req.params;
//   const {
//     title,
//     description,
//     thumbnail,
//     videos: updatedVideos = [],
//   } = req.body;
// };

export { createCourse, addVideo };
