const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// Get the PostgreSQL connection string from your .env file
const dbConnectionString = process.env.DB_CONNECTION_STRING;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: dbConnectionString,
});

// Test the PostgreSQL connection
pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((error) => {
    console.error("PostgreSQL connection error:", error);
  });

module.exports = pool;
