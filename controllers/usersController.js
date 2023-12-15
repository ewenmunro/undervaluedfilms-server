const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

// Register a new user
async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findByUsername(username);

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    await User.create(username, email, hashedPassword);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user" });
  }
}

// User login
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const token = jwt.sign({ userId: user.user_id }, config.secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Authentication successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// Get user profile
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    // Retrieve user profile information based on user ID
    const user = await User.findByUserId(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ userProfile: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user profile" });
  }
}

// Update user profile
async function updateUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const updatedUserProfile = req.body;

    // Update the user profile based on the user ID
    const updatedUser = await User.update(userId, updatedUserProfile);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ userProfile: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
