import { Document, Types } from "mongoose";

// Base User type (should match your existing User type)
type User = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: "tutor" | "student";
};

// Video Subdocument
export type Video = {
  _id?: Types.ObjectId;
  url: string;
  title: string;
  transcript?: string;
  order: number;
  createdAt?: Date;
};

// Enrollment Subdocument
export type Enrollment = {
  _id?: Types.ObjectId;
  student: Types.ObjectId | User;
  enrolledAt?: Date;
};

// Message Reply Subdocument
export type MessageReply = {
  _id?: Types.ObjectId;
  user: Types.ObjectId | User;
  text: string;
  createdAt?: Date;
};

// Message Subdocument
export type Message = {
  _id?: Types.ObjectId;
  user: Types.ObjectId | User;
  text: string;
  replies: MessageReply[];
  createdAt?: Date;
};

// Main Course Document
export type Course = Document & {
  title: string;
  description: string;
  thumbnail: string;
  tutor: Types.ObjectId | User;
  videos: Video[];
  enrollments: Enrollment[];
  chatRoom: Message[];
  createdAt?: Date;
  updatedAt?: Date;
};

// For creating new courses
export type CreateCourseInput = {
  title: string;
  description: string;
  thumbnail: string;
  tutor: Types.ObjectId;
};

// For adding videos
export type AddVideoInput = {
  url: string;
  title: string;
  transcript?: string;
};
