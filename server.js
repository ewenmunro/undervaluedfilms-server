const http = require("http");
const app = require("./app"); // Import the Express.js application instance
const config = require("./config");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Get the port from environment variables or use a default value
const port = process.env.PORT || 5000;

// Create an HTTP server using the Express.js app
const server = http.createServer(app);

// Start listening on the specified port
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

// Handle server errors
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
