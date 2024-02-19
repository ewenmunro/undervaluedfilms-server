const express = require("express");
const router = express.Router();
const WatchLinkClicks = require("../models/WatchLinkClicks");
const authMiddleware = require("../middleware/authMiddleware");

// Define a route to generate a temporary identifier for logged-out users
router.get("/generatetempid", (req, res) => {
  // Temporary user id
  const temporaryUserId = "000";

  res.json({ temporaryUserId });
});

// Define a route to record a click
router.post("/click", async (req, res) => {
  const { user_id, film_id } = req.body;

  // If user is not logged in, use temporary user ID
  if (!user_id) {
    user_id = "000";
  }

  try {
    // Insert a new record into the Watch Link Clicks table using the model
    const result = await WatchLinkClicks.create(user_id, film_id);

    res.json({
      success: true,
      message: "Click recorded successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Error recording click:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to record the click" });
  }
});

// Define a route to record a click
router.post("/authclick", authMiddleware, async (req, res) => {
  const { user_id, film_id } = req.body;

  try {
    // Insert a new record into the Watch Link Clicks table using the model
    const result = await WatchLinkClicks.create(user_id, film_id);

    res.json({
      success: true,
      message: "Click recorded successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Error recording click:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to record the click" });
  }
});

module.exports = router;
