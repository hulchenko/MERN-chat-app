import express from "express";
import { getUser, createUser } from "../controllers/userController.js";

const router = express.Router();

// define middleware
// router.user(middleware) <- TTL for chat history //TODO

router.route("/").get(getUser).post(createUser);

export default router;
