import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  expireAt: {
    type: Date,
    default: Date.now() + 60 * 60 * 24 * 1000, // 24 hours
    expires: 0,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
