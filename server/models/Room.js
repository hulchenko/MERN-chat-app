import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: String,
  messages: [{ type: String }],
  expireAt: {
    type: Date,
    default: Date.now() + 60 * 60 * 24 * 1000, // 24 hours
    expires: 0,
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
