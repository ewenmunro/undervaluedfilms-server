const express = require("express");
const router = express.Router();
const Film = require("../models/Film");
const authMiddleware = require("../middleware/authMiddleware");

// Route to check if a film already exists
router.get("/checkfilm", async (req, res) => {
  try {
    const { title, release_year } = req.query;

    // Find a film with the same title and release year in the database
    const existingFilm = await Film.findByTitleAndYear(title, release_year);

    if (existingFilm) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check if the film exists" });
  }
});

// Route to create a new film
router.post("/addfilm", authMiddleware, async (req, res) => {
  try {
    const { title, release_year, description } = req.body;

    // Create a new film in the database
    const film = await Film.create(title, release_year, description);

    res.status(201).json({ message: "Film created successfully", film });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create film" });
  }
});

// Route to get a list of films
router.get("/allfilms", async (req, res) => {
  try {
    // Fetch all films from the database
    const films = await Film.getAll();

    res.status(200).json({ films });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch films" });
  }
});

module.exports = router;
