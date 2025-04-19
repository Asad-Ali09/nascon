import { Document, Types } from "mongoose";

export interface User extends Document {
  _id: string;
  name: string;
  email: string;
  role: "tutor" | "student";
  password: string;
  createJWT: () => string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export type Student = User & {
  enrolledCourses: Types.ObjectId[];
};
