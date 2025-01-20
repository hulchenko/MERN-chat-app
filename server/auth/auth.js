import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

const generateJWT = ({ id, username }) => {
  return jwt.sign({ id, username }, SECRET, { expiresIn: "1d" });
};

const verifyJWT = (token) => {
  // {
  //  id: '67856f3ac7292f0ec4cfe323',
  //  username: 'admin',
  //  iat: 1736969664,
  //  exp: 1737056064
  // }
  try {
    const decodedToken = jwt.verify(token, SECRET);
    return decodedToken;
  } catch (error) {
    throw new Error("Token verification failed. Please log out and log in again.");
  }
};

export { generateJWT, verifyJWT };
