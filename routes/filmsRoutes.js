const express = require("express");
const router = express.Router();
const Film = require("../models/Film");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const config = require("../config");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
});

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

// Route to create a new film and send email for review
router.post("/reviewfilm", authMiddleware, async (req, res) => {
  try {
    const { title, release_year, description } = req.body;
    const user = req.user;

    // Create a new film object
    const film = { title, release_year, description };

    // Send email for review with user's email address
    await sendReviewEmail(film, user);

    res.status(201).json({ message: "Film details sent for review" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send film details for review" });
  }
});

// Function to send review email
async function sendReviewEmail(film, user) {
  try {
    // Convert title and description to lowercase, and replace spaces with dashes
    const formattedTitle = encodeURIComponent(
      film.title.toLowerCase().replace(/\s+/g, "-")
    );

    const formattedDescription = encodeURIComponent(
      film.description.toLowerCase().replace(/\s+/g, "-")
    );

    // Email content
    const emailContent = `
      User Details:
      User ID: ${user.user_id}

      Film Details:
      Title: ${film.title}
      Release Year: ${film.release_year}
      Description: ${film.description}

      Master Add Film:
      https://www.undervaluedfilms.com/master/addfilm/${formattedTitle}/${film.release_year}/${formattedDescription}/${user.user_id}
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: config.email,
      subject: "Film Review Request",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending review email:", error);
    throw new Error("Failed to send review email");
  }
}

// Route to reject film details submitted by a user
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const { title, release_year, userId } = req.body;

    // Retrieving Master User's details
    const masterUser = req.user;

    // Format the title: make the first letter of each word uppercase and replace dashes with spaces
    const formattedTitle = title
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Making sure the userId from the input form is an integer
    const user_id = parseInt(userId, 10);

    // Fetch user details from the database using user_id
    const user = await User.findByUserId(user_id);

    // Throw error if user is not found
    if (!user) {
      throw new Error("User not found for the given user_id.");
    }

    if (masterUser.user_id === 1) {
      // Send rejection email to the user
      await sendRejectionEmail(
        user.email,
        user.username,
        formattedTitle,
        release_year
      );

      res
        .status(200)
        .json({ message: `${formattedTitle} rejected successfully` });
    } else {
      console.error("Not Master User!");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject film" });
  }
});

// Function to send rejection email to the user
async function sendRejectionEmail(userEmail, username, filmTitle, filmYear) {
  try {
    // Email content
    const emailContent = `
      Hi ${username},

      Your film submission for "${filmTitle} (${filmYear})" has been rejected.

      If you have any questions or concerns, please contact us.

      Sincerely,
      Undervalued Films
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: userEmail,
      subject: "Film Submission Rejected",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email");
  }
}

// Route to approve film details
router.post("/addfilm", authMiddleware, async (req, res) => {
  try {
    const { title, release_year, description, watchLink, userId } = req.body;

    // Retrieving Master User's details
    const masterUser = req.user;

    // Convert title to lowercase, and replace spaces with dashes
    const formattedTitle = encodeURIComponent(
      title.toLowerCase().replace(/\s+/g, "-")
    );

    // Making sure the userId from the input form is an integer
    const user_id = parseInt(userId, 10);

    // Fetch user details from the database using user_id
    const user = await User.findByUserId(user_id);

    if (!user) {
      throw new Error("User not found for the given user_id.");
    }

    if (masterUser.user_id === 1) {
      // Add film to the database
      await Film.create(title, release_year, description, watchLink);

      // Send approval email to the user
      await sendApprovalEmail(
        user.email,
        user.username,
        title,
        formattedTitle,
        release_year
      );

      res.status(200).json({
        message: `Film "${title}" approved and added to the database`,
      });
    } else {
      console.error("Not Master User!");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Function to send approval email to the user
async function sendApprovalEmail(
  userEmail,
  username,
  filmTitle,
  formattedFilmTitle,
  filmYear
) {
  try {
    // Email content
    const emailContent = `
      Dear ${username},

      Your film submission for "${filmTitle} (${filmYear})" has been approved. You can view your submission here: https://www.undervaluedfilms.com/${formattedFilmTitle}-${filmYear}

      Thank you for your contribution!

      Sincerely,
      Undervalued Films
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: userEmail,
      subject: "Film Submission Approved",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw new Error("Failed to send approval email");
  }
}

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

router.get("/filmdetails", async (req, res) => {
  try {
    const { title, year } = req.query;

    // Fetch film details from the database based on title and release year
    const film = await Film.getByTitleAndYear(title, year);

    if (film) {
      res.status(200).json({ film });
    } else {
      res.status(404).json({ error: "Film not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch film details" });
  }
});

module.exports = router;
