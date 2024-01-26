const db = require("../db"); // Import the PostgreSQL connection pool

const Film = {
  // Find a film by title and release year
  findByTitleAndYear: async (title, release_year) => {
    try {
      const query = `
      SELECT * FROM films
      WHERE title = $1 AND release_year = $2;
    `;

      const values = [title, release_year];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find film by title and year:", error);
      throw error;
    }
  },

  // Add film to the database
  create: async (title, release_year, description) => {
    try {
      const query = `
        INSERT INTO films (title, release_year, description)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

      const values = [title, release_year, description];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to create film:", error);
      throw error;
    }
  },

  // Retrieve all films
  getAll: async () => {
    try {
      const query = `
        SELECT * FROM films;
      `;

      const result = await db.query(query);

      return result.rows;
    } catch (error) {
      console.error("Failed to fetch films:", error);
      throw error;
    }
  },

  // Get film details by title and release year
  getByTitleAndYear: async (title, year) => {
    try {
      const query = {
        text: "SELECT * FROM films WHERE title = $1 AND release_year = $2",
        values: [title, year],
      };

      const result = await db.query(query);

      // Return the first row if a film is found, otherwise return null
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error("Error fetching film details:", error);
      throw error;
    }
  },
};

module.exports = Film;
