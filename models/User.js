const db = require("../db"); // Import the PostgreSQL connection pool
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing

const User = {
  // Create new user
  create: async (username, email, password) => {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

      const values = [username, email, hashedPassword];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  },

  // Update user verification token by user ID
  updateVerificationToken: async (userId, verificationToken) => {
    try {
      const query = `
        UPDATE users
        SET verification_token = $1
        WHERE user_id = $2;
      `;

      const values = [verificationToken, userId];
      await db.query(query, values);
    } catch (error) {
      console.error("Failed to update user verification token:", error);
      throw error;
    }
  },

  // Find user by verification token
  findByVerificationToken: async (verificationToken) => {
    try {
      const query = `
        SELECT * FROM users
        WHERE verification_token = $1;
      `;

      const values = [verificationToken];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find user by verification token:", error);
      throw error;
    }
  },

  // Mark user as verified by user ID
  markUserAsVerified: async (userId) => {
    try {
      const query = `
        UPDATE users
        SET verified = true,
            verification_token = null
        WHERE user_id = $1;
      `;

      const values = [userId];
      await db.query(query, values);
    } catch (error) {
      console.error("Failed to mark user as verified:", error);
      throw error;
    }
  },

  // Delete unverified users older than a specified timestamp
  deleteUnverifiedUsersOlderThan48Hours: async (cutoffTimestamp) => {
    try {
      const query = `
      DELETE FROM users
      WHERE verified = false AND created_at < $1;
    `;

      const values = [cutoffTimestamp];
      await db.query(query, values);
    } catch (error) {
      console.error("Failed to delete unverified users:", error);
      throw error;
    }
  },

  // Find user by user id
  findByUserId: async (userId) => {
    try {
      const query = `
        SELECT * FROM users
        WHERE user_id = $1;
      `;

      const values = [userId];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find user by user ID:", error);
      throw error;
    }
  },

  // Find user by username
  findByUsername: async (username) => {
    try {
      const query = `
        SELECT * FROM users
        WHERE username = $1;
      `;

      const values = [username];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find user by username:", error);
      throw error;
    }
  },

  // Find user by email
  findByEmail: async (email) => {
    try {
      const query = `
      SELECT * FROM users
      WHERE email = $1;
    `;

      const values = [email];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find user by email:", error);
      throw error;
    }
  },

  // Find user by user id
  findByUserId: async (userId) => {
    try {
      const query = `
      SELECT * FROM users
      WHERE user_id = $1;
    `;

      const values = [userId];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find user by user ID:", error);
      throw error;
    }
  },

  // Find user profile by username
  findUserProfileByUsername: async (username) => {
    try {
      const query = `
      SELECT * FROM users
      WHERE username = $1;
    `;

      const values = [username];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find user profile by username:", error);
      throw error;
    }
  },

  // Retrieve a refresh token by user ID
  getRefreshTokenByUserId: async (userId) => {
    try {
      const query = `
      SELECT refresh_token
      FROM users
      WHERE user_id = $1;
    `;
      const values = [userId];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Failed to get refresh token by user ID:", error);
      throw error;
    }
  },

  // Update a refresh token by user ID
  updateRefreshToken: async (userId, refreshToken) => {
    try {
      const query = `
      UPDATE users
      SET refresh_token = $1
      WHERE user_id = $2;
    `;
      const values = [refreshToken, userId];
      await db.query(query, values);
    } catch (error) {
      console.error("Failed to update refresh token by user ID:", error);
      throw error;
    }
  },

  // Insert a new refresh token for a user
  insertRefreshToken: async (userId, refreshToken) => {
    try {
      const query = `
      INSERT INTO users (refresh_token)
      VALUES ($1)
      WHERE user_id = $2;
    `;
      const values = [refreshToken, userId];
      await db.query(query, values);
    } catch (error) {
      console.error("Failed to insert refresh token for user:", error);
      throw error;
    }
  },

  // Find user by refresh token
  findByRefreshToken: async (refreshToken) => {
    try {
      const query = `
        SELECT * FROM users
        WHERE refresh_token = $1;
      `;

      const values = [refreshToken];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find user by refresh token:", error);
      throw error;
    }
  },

  // Update user profile by user ID
  update: async (userId, updatedUserProfile) => {
    try {
      const { username, email, password } = updatedUserProfile;

      // Create an array to hold the set clauses for the update query
      const setClauses = [];
      const values = [userId];

      // Check if the username is provided in the update data
      if (username) {
        setClauses.push(`username = $${values.length + 1}`);
        values.push(username);
      }

      // Check if the email is provided in the update data
      if (email) {
        setClauses.push(`email = $${values.length + 1}`);
        values.push(email);
      }

      // Check if the password is provided in the update data
      if (password) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        setClauses.push(`password = $${values.length + 1}`);
        values.push(hashedPassword);
      }

      // Create the SQL update query
      const updateQuery = `
      UPDATE users
      SET ${setClauses.join(", ")}
      WHERE user_id = $1
      RETURNING *;
    `;

      const result = await db.query(updateQuery, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  },
};

module.exports = User;
