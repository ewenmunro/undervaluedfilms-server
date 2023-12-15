const Film = require("../models/Film");

// Create a new film
async function createFilm(req, res) {
  try {
    const { title, rating, heardOfBefore } = req.body;

    const film = new Film({
      title,
      rating,
      heardOfBefore,
    });

    await film.save();

    res.status(201).json({ message: "Film created successfully", film });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create film" });
  }
}

// Get a list of films
async function getFilms(req, res) {
  try {
    const films = await Film.find().sort({ rating: -1, heardOfBefore: -1 });

    res.status(200).json({ films });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch films" });
  }
}

// Rate a film
async function rateFilm(req, res) {
  try {
    const { filmId } = req.params;
    const { rating } = req.body;

    const updatedFilm = await Film.findByIdAndUpdate(
      filmId,
      { $set: { rating } },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Film rating updated successfully", film: updatedFilm });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update film rating" });
  }
}

module.exports = {
  createFilm,
  getFilms,
  rateFilm,
};
