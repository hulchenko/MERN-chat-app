import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

const generateJWT = ({ id, username }) => {
  return jwt.sign({ id, username }, SECRET, { expiresIn: "1d" });
};

const verifyJWT = (token) => {
  return jwt.verify(token, SECRET);
  // {
  //  id: '67856f3ac7292f0ec4cfe323',
  //  username: 'admin',
  //  iat: 1736969664,
  //  exp: 1737056064
  // }
};

export { generateJWT, verifyJWT };
