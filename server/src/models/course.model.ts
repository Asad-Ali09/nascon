import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema({
  url: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  transcript: { type: String },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const EnrollmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  enrolledAt: { type: Date, default: Date.now },
});

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  // Reference to the parent message if this is a reply
  parentMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  createdAt: { type: Date, default: Date.now },
});

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 500,
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videos: [VideoSchema],
    enrollments: [EnrollmentSchema],
    chatRoom: [MessageSchema],
  },
  { timestamps: true }
);

export const CourseModel = mongoose.model("Course", CourseSchema);
export const MessageModel = mongoose.model("Message", MessageSchema);
export const EnrollmentModel = mongoose.model("Enrollment", EnrollmentSchema);
export const VideoModel = mongoose.model("Video", VideoSchema);
