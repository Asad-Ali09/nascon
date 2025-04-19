import mongoose, { Schema } from "mongoose";
import { User } from "../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TokenType } from "../types/authTypes";
import { jwtConfig } from "../config";

const UserSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: [true, "Please provide a valid user name"],
      minlength: 3,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide a valid email"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["tutor", "student"],
      default: "tutor",
    },
  },
  { discriminatorKey: "role", collection: "users" }
);

const TutorSchema = new Schema({});

const StudentSchema = new Schema({});

UserSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

UserSchema.methods.createJWT = function () {
  const payload: TokenType = {
    userID: this._id,
    email: this.email,
  };
  return jwt.sign(payload, jwtConfig.secret!, {
    expiresIn: jwtConfig.expiresIn!,
  });
};

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<User>("User", UserSchema);
const TutorModel = UserModel.discriminator("tutor", TutorSchema);
const StudentModel = UserModel.discriminator("student", StudentSchema);

export { UserModel, TutorModel, StudentModel };
