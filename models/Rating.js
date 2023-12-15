const db = require("../db"); // Import your database connection

class Rating {
  // Check if a user has already rated a film
  static async findByUserAndFilm(user_id, film_id) {
    try {
      const query = "SELECT * FROM Ratings WHERE user_id = $1 AND film_id = $2";
      const values = [user_id, film_id];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error checking rating: ${error.message}`);
    }
  }

  // Create a new rating
  static async create(user_id, film_id, rating) {
    try {
      const query =
        "INSERT INTO Ratings (user_id, film_id, rating) VALUES ($1, $2, $3) RETURNING *";
      const values = [user_id, film_id, rating];
      const result = await db.query(query, values);

      return result.rows[0]; // Return the newly created rating
    } catch (error) {
      throw new Error(`Error creating rating: ${error.message}`);
    }
  }

  // Edit the rating of a film
  static async edit(user_id, film_id, newRating) {
    try {
      const result = await db.query(
        "INSERT INTO ratings (user_id, film_id, rating) VALUES ($1, $2, $3) ON CONFLICT (user_id, film_id) DO UPDATE SET rating = $3",
        [user_id, film_id, newRating]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Fetch ratings for a specific film
  static async getByFilm(film_id) {
    try {
      const query = "SELECT * FROM Ratings WHERE film_id = $1";
      const values = [film_id];
      const result = await db.query(query, values);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching ratings: ${error.message}`);
    }
  }

  // Retrieve not rated films for user
  static async getNotRatedFilms(userId) {
    try {
      const query = `
        SELECT films.*
        FROM films
        LEFT JOIN ratings ON films.film_id = ratings.film_id AND ratings.user_id = $1
        WHERE ratings.rating IS NULL;
      `;
      const values = [userId];

      const { rows } = await db.query(query, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Retrieve the count of ratings for a specific film
  static async getRatingCountForFilm(film_id) {
    try {
      const query = "SELECT COUNT(*) FROM ratings WHERE film_id = $1";
      const values = [film_id];

      const result = await db.query(query, values);
      const count = parseInt(result.rows[0].count);

      return count;
    } catch (error) {
      console.error("Error fetching rating count:", error);
      throw error;
    }
  }

  // Retrieve sum total rating for a film
  static async getSumTotalRatingForFilm(film_id) {
    try {
      const query = `
        SELECT COALESCE(SUM(rating), 0) AS sum_total
        FROM ratings
        WHERE film_id = $1;
      `;

      const values = [film_id];
      const result = await db.query(query, values);

      return result.rows[0].sum_total;
    } catch (error) {
      console.error(
        "Error fetching sum total of ratings for the film from the database:",
        error
      );
      throw error;
    }
  }
}

module.exports = Rating;
