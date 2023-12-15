const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  // Get the token from the request headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    try {
      const decoded = jwt.verify(token, config.secretKey);

      // Handle the decoded token here.
      if (!decoded.userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Invalid token, not decoded" });
      }

      const userId = decoded.userId;
      const user = await User.findByUserId(userId);

      if (!user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      req.user = user;
      next();
    } catch (error) {
      // Handle the error here.
      console.error("Decoding not working!");
    }
  } catch (error) {
    console.error("Decoding error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token here" });
  }
};
