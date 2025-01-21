import express from "express";
import { getUser, createUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

router.route("/").get(getUser).post(createUser);
router.route("/login").post(loginUser);

export default router;
