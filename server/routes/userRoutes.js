import express from "express";
import { getUser, createUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

// define middleware
// router.user(middleware) <- TTL for chat history //TODO

router.route("/").get(getUser).post(createUser);
router.route("/login").post(loginUser);
// router.route("/register").post(registerUser);

export default router;
