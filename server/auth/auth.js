import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET = process.env.JWT_SECRET;

const generateJWT = ({ id, username }) => {
  return jwt.sign({ id, username }, SECRET, { expiresIn: "1d" });
};

const verifyJWT = (token) => {
  try {
    const decodedToken = jwt.verify(token, SECRET);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid or expired token.");
  }
};

const encryptPwd = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const encrypted = await bcrypt.hash(password, salt);
  return encrypted;
};

const comparePwd = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export { generateJWT, verifyJWT, encryptPwd, comparePwd };
