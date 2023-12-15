const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");
const authMiddleware = require("../middleware/authMiddleware");

// Route to verify the user's token
router.get("/verify", (req, res) => {
  // If the middleware passes, it means the token is valid
  res.status(200).json({ authorized: true });
});

// Route for handling refresh token storage
router.post("/store", authMiddleware, async (req, res) => {
  try {
    // Extract the user ID from the request or JWT access token
    const userId = req.user.user_id;

    // Check if a refresh token already exists in the database for the user
    const existingRefreshToken = await User.getRefreshTokenByUserId(userId);

    // Generate a new refresh token
    const refreshToken = jwt.sign({ userId }, config.refreshTokenSecret, {
      expiresIn: "30d",
    });

    if (existingRefreshToken) {
      // If a refresh token exists, update it
      await User.updateRefreshToken(userId, refreshToken);
    } else {
      // If no refresh token exists, insert a new one
      await User.insertRefreshToken(userId, refreshToken);
    }

    // Respond with the new token
    res.status(200).json({ refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Refresh token storage failed" });
  }
});

// Route for refreshing the access token with token rotation
router.post("/refresh", async (req, res) => {
  try {
    const { refresh } = req.body;

    // Check if the provided refresh token is valid
    if (!isValidRefreshToken(refresh)) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    try {
      // Attempt to verify the refresh token
      const { userId } = jwt.verify(refresh, config.refreshTokenSecret);

      // Generate a new access token
      const newAccessToken = jwt.sign({ userId }, config.secretKey, {
        expiresIn: "1h",
      });

      // Generate a new refresh token (rotate the token)
      const newRefreshToken = jwt.sign({ userId }, config.refreshTokenSecret, {
        expiresIn: "30d",
      });

      const newAccessTokenExpiration = new Date().getTime() + 3600 * 1000;
      const user = await User.findByUserId(userId);

      // Update the stored refresh token
      await User.updateRefreshToken(userId, newRefreshToken);

      // Return the new access token to the client
      res.status(200).json({
        message: "Authentication successful",
        newAccessToken,
        newRefreshToken,
        newAccessTokenExpiration,
        user,
      });
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ error: "Invalid refresh token" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

// Helper function to validate the refresh token
async function isValidRefreshToken(refreshToken) {
  try {
    // Search the database for the refresh token
    const user = await User.findByRefreshToken(refreshToken);

    // If no user is found or the user doesn't match the token's owner, it's invalid
    if (!user || user.userId !== decodedToken.userId) {
      return false;
    }

    // If the token is found and the user association is correct, consider it valid
    return true;
  } catch (error) {
    // If any error occurs, return false to indicate an invalid token
    return false;
  }
}

module.exports = router;
