const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const app = express();
const config = require("./config");

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(helmet()); // Set various HTTP headers for security
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded request bodies

// Routes
const authRoutes = require("./routes/authRoutes");
const filmsRoutes = require("./routes/filmsRoutes");
const mentionsRoutes = require("./routes/mentionsRoutes");
const ratingsRoutes = require("./routes/ratingsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const watchLinkClicksRoutes = require("./routes/watchLinkClicksRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/films", filmsRoutes);
app.use("/api/mentions", mentionsRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/watch", watchLinkClicksRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
