import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  // Support both Authorization: Bearer <token> and legacy x-auth-token header
  let token = null;

  const authHeader = req.header("authorization") || req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    token = req.header("x-auth-token");
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

export default auth;
