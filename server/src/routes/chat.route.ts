import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { sendMessage } from "../controllers/chat.controller";

const router = express.Router();

router.post("/:courseId", authMiddleware, sendMessage); // Send a message in the chat room

export default router;
