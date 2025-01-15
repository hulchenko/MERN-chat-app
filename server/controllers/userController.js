import { generateJWT } from "../auth/auth.js";
import User from "../models/User.js";

// get user
// create user
// update user
// delete user
// register user
// user login
// user logout
// add friend
// remove friend

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
    throw Error("All fields are required: username, password.");
  }

  const newUser = {
    username,
    password: password, // TODO this will need to be encrypted with salt()
  };

  const user = await User.create(newUser);
  return user;
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      const user = await createUser(username, password);
      return res.status(201).json({ error: false, username: user.username });
    }
    if (password !== user.password) {
      return res.status(400).json({ error: true, message: "Incorrect password." });
    }
    const token = generateJWT(user);
    return res.status(200).json({ error: false, id: user.id, username: user.username, token });
  } catch (error) {
    console.log("loginUser error: ", error);
    next(error);
  }
};

export { createUser, getUser, loginUser };
