import { Request, Response } from "express";
import { CourseModel } from "../models/course.model";

export const sendMessage = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { text, parentMessage } = req.body;
  const userId = req.user._id; // Assuming user is authenticated and ID is available

  const newMessage = {
    user: userId,
    text,
    parentMessage: parentMessage || null,
    createdAt: new Date(),
  };

  const updatedCourse = await CourseModel.findByIdAndUpdate(
    courseId,
    { $push: { chatRoom: newMessage } },
    { new: true }
  ).populate({
    path: "chatRoom.user",
    select: "username avatar", // Include any user fields you want to return
  });

  if (!updatedCourse) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Get the newly added message (last one in the array)
  const addedMessage =
    updatedCourse.chatRoom[updatedCourse.chatRoom.length - 1];

  res.status(201).json({
    message: "Message sent successfully",
    data: addedMessage,
  });
};
