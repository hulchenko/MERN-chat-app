import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // createdAt: { type: Date, default: Date.now, index: { expires: 10 } }, //TODO use for chats
});

const User = mongoose.model("User", userSchema);

export default User;
