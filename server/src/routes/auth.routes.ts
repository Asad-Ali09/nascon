import express from "express";
import {
  signup,
  login,
  isLoggedIn,
  logout,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/isloggedin", isLoggedIn);
router.get("/logout", logout);

export default router;
