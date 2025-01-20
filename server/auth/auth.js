import jwt from "jsonwebtoken";

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

export { generateJWT, verifyJWT };
