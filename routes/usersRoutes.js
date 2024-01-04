const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");
const authMiddleware = require("../middleware/authMiddleware");
const cron = require("node-cron");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
});

// Helper function to send verification email
const sendVerificationEmail = async (user) => {
  try {
    const verificationToken = crypto.randomBytes(20).toString("hex");

    // Update the user's verification token in the database
    await User.updateVerificationToken(user.user_id, verificationToken);

    const mailOptions = {
      from: config.email,
      to: user.email,
      subject: "Undervalued Films - Email Verification",
      html: `<p>Almost there!</p>
      
      <p>Click <a href="https://undervaluedfilms.com/verification/${verificationToken}">here</a> to verify your email.</p>`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error(error);
        // Handle error
      } else {
        // Email sent successfully
      }
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Handle error
  }
};

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findByUsername(username);

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create a new user
    const newUser = await User.create(username, email, password);

    // Send verification email
    sendVerificationEmail(newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Check if a username and/or email already exist for registration form
router.post("/check", async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if the username already exists
    const usernameExists = await User.findByUsername(username);
    // Check if the email already exists
    const emailExists = await User.findByEmail(email);

    res.status(200).json({ usernameExists, emailExists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check username/email existence" });
  }
});

// Verification page route
router.get("/verification/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Find the user by the verification token
    const user = await User.findByVerificationToken(token);

    if (!user) {
      return res.status(401).json({ success: false });
    }

    // Mark the user as verified
    await User.markUserAsVerified(user.user_id);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// Scheduled job to delete unverified users older than 48 hours
cron.schedule("0 0 * * *", async () => {
  try {
    // 48hr cut off timestamp
    const cutoffTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Delete unverified users older than 48hrs
    await User.deleteUnverifiedUsersOlderThan48Hours(cutoffTimestamp);
  } catch (error) {
    console.error(error);
  }
});

// Log in user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Check if the user is verified
    if (user.verified === false) {
      return res.status(401).json({
        error:
          "User not verified. Please check your email for verification instructions.",
      });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const accessToken = jwt.sign({ userId: user.user_id }, config.secretKey, {
      expiresIn: "1h",
    });

    // Generate a refresh token
    const refreshToken = jwt.sign(
      { userId: user.user_id },
      config.refreshTokenSecret,
      {
        expiresIn: "30d",
      }
    );

    // Calculate the expiration time for the access token in milliseconds
    const accessTokenExpiration = new Date().getTime() + 3600 * 1000;

    // Send both tokens to the client
    res.status(200).json({
      message: "Authentication successful",
      accessToken,
      refreshToken,
      accessTokenExpiration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Get user profile by username
router.get("/profile/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Fetch the user's profile data using the username
    const userProfile = await User.findUserProfileByUsername(username);

    if (userProfile) {
      res.status(200).json({ user: userProfile });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// Update user profile by userId
router.put("/profile/:userId", authMiddleware, async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = parseInt(req.params.userId, 10);

    // Get the updated user profile data from the request body
    const updatedUserProfile = req.body;

    // Ensure that only the authenticated user can update their own profile
    if (userId !== req.user.user_id) {
      return res
        .status(403)
        .json({ error: "Forbidden: You can only update your own profile." });
    }

    // Perform the update operation
    const updatedUser = await User.update(userId, updatedUserProfile);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      userProfile: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

module.exports = router;
