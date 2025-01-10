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
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: true, message: "Email is required to get user." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: true, message: "User is not found." });
    }

    return res.status(200).json({ error: false, data: user });
  } catch (error) {
    console.log("getUser error: ", error);
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: "All fields are required: name, email, password." });
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(400).json({ error: true, message: "User with this email already exists." });
    }

    const newUser = {
      name,
      email,
      password: password, // TODO this will need to be encrypted with salt()
    };

    const user = await User.create(newUser);
    return res.status(200).json({ error: false, data: user });
  } catch (error) {
    console.log("createUser error: ", error);
    next(error);
  }
};

export { getUser, createUser };
