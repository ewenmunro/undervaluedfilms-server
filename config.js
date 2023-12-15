// Load environment variables from .env file (dotenv package)
require("dotenv").config();

// Define configuration settings
const config = {
  port: process.env.PORT || 5000, // Port for the server
  databaseUrl: process.env.DB_CONNECTION_STRING, // Database connection string
  secretKey: process.env.SECRET_KEY, // Secret key for JWT authentication
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET, // Refreshed secret key for JWT authentication
  email: process.env.EMAIL, // Email for sending verification emails when user signs up
  password: process.env.PASSWORD, // Password required for sending verification emaisl when user signs up
};

module.exports = config;
