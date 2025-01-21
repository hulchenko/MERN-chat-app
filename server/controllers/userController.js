import { generateJWT, encryptPwd, comparePwd } from "../auth/auth.js";
import User from "../models/User.js";

const getUser = async (req, res, next) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: true, message: "Username is required to get user." });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: true, message: "User is not found." });
    }

    return res.status(200).json({ error: false, data: user });
  } catch (error) {
    console.log("getUser error: ", error);
    next(error);
  }
};

const createUser = async (username, password) => {
  if (!username || !password) {
    throw new Error("All fields are required: username, password.");
  }

  const newUser = {
    username,
    password: await encryptPwd(password),
  };

  const user = await User.create(newUser);
  return user;
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
      user = await createUser(username, password);
    }
    const isValidPwd = await comparePwd(password, user.password);
    if (!isValidPwd) {
      return res.status(400).json({ error: true, message: "Incorrect password." });
    }
    const token = generateJWT(user);
    return res.status(200).json({ error: false, id: user.id, username: user.username, token });
  } catch (error) {
    console.log("loginUser error: ", error);
    next(error);
  }
};

// WebSocket methods

const getAllDBUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    console.log("getAllDBUsers error: ", error);
    next(error);
  }
};

export { createUser, getUser, loginUser, getAllDBUsers };
