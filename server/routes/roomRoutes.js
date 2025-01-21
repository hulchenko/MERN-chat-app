import express from "express";
import { createRoom, getRooms } from "./../controllers/roomController.js";

const router = express.Router();

router.route("/").post(createRoom).get(getRooms);

export default router;
