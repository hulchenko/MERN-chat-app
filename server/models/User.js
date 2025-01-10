import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  // createdAt: { type: Date, default: Date.now, index: { expires: 10 } }, //TODO use for chats
  // friends: [friendSchema], // TODO come back to it later
});

const User = mongoose.model("User", userSchema);

export default User;
