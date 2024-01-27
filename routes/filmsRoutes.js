const express = require("express");
const router = express.Router();
const Film = require("../models/Film");
// const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const config = require("../config");
// const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// // Get server domain
// const server_domain = process.env.SERVER_DOMAIN;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
});

// // Function to generate a unique identifier
// function generateUniqueIdentifier() {
//   return uuidv4();
// }

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
    // const formattedDescription = encodeURIComponent(
    //   film.description.toLowerCase().replace(/\s+/g, "-")
    // );

    // // Unique identifier for the rejection link
    // const rejectionIdentifier = encodeURIComponent(generateUniqueIdentifier());
    // const approvalIdentifier = encodeURIComponent(generateUniqueIdentifier());

    // Email content
    const emailContent = `
      User Details:
      User ID: ${user.user_id}

      Film Details:
      Title: ${film.title}
      Release Year: ${film.release_year}
      Description: ${film.description}

      Approve Email Template:
      RE: Film Submission Approved

      Dear ${user.username},
      
      Your film submission for "${film.title} (${film.release_year})" has been approved. You can view your submission here: https://www.undervaluedfilms.com/${formattedTitle}-${film.release_year}
      
      Thank you for your contribution!
      
      Sincerely,
      Undervalued Films

      Reject Email Template:
      RE: Film Submission Rejected

      Hi ${user.username},
      
      Your film submission for "${film.title}} (${film.release_year})" has been rejected.
      
      If you have any questions or concerns, please contact us.
      
      Sincerely,
      Undervalued Films
    `;

    // Review Links:
    // - Approve: ${server_domain}/approve/${formattedTitle}/${film.release_year}/${formattedDescription}/${user.user_id}/${approvalIdentifier}
    // - Reject: ${server_domain}/reject/${formattedTitle}/${film.release_year}/${user.user_id}/${rejectionIdentifier}

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

// // Route to reject film details submitted by a user
// router.post(
//   "/reject/:title/:release_year/:user_id/:rejection_identifier",
//   async (req, res) => {
//     try {
//       const { title, release_year, user_id, rejection_identifier } = req.params;

//       // Validate rejection identifier
//       if (!isValidRejectionIdentifier(rejection_identifier)) {
//         throw new Error("Invalid rejection identifier.");
//       }

//       // Format the title: make the first letter of each word uppercase and replace dashes with spaces
//       const formattedTitle = title
//         .split("-")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");

//       // Fetch user details from the database using user_id
//       const user = await User.findByUserId(user_id);

//       // Throw error if user is not found
//       if (!user) {
//         throw new Error("User not found for the given user_id.");
//       }

//       // Send rejection email to the user
//       await sendRejectionEmail(
//         user.email,
//         user.username,
//         formattedTitle,
//         release_year
//       );

//       res
//         .status(200)
//         .json({ message: `${formattedTitle} rejected successfully` });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Failed to reject film" });
//     }
//   }
// );

// // Function to send rejection email to the user
// async function sendRejectionEmail(userEmail, username, filmTitle, filmYear) {
//   try {
//     // Email content
//     const emailContent = `
//       Hi ${username},

//       Your film submission for "${filmTitle} (${filmYear})" has been rejected.

//       If you have any questions or concerns, please contact us.

//       Sincerely,
//       Undervalued Films
//     `;

//     // Email options
//     const mailOptions = {
//       from: config.email,
//       to: userEmail,
//       subject: "Film Submission Rejected",
//       text: emailContent,
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Error sending rejection email:", error);
//     throw new Error("Failed to send rejection email");
//   }
// }

// // Route to approve film details
// router.post(
//   "/approve/:title/:release_year/:description/:user_id/:approval_identifier",
//   async (req, res) => {
//     try {
//       const { title, release_year, description, user_id, approval_identifier } =
//         req.params;

//       // Validate approval identifier
//       if (!isValidApprovalIdentifier(approval_identifier)) {
//         throw new Error("Invalid approval identifier.");
//       }

//       // Format the title: make the first letter of each word uppercase and replace dashes with spaces
//       const formattedTitle = title
//         .split("-")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");

//       // Format the description: make the first letter of each word uppercase and replace dashes with spaces
//       const formattedDescription = description
//         .split("-")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");

//       // Fetch user details from the database using user_id
//       const user = await User.findByUserId(user_id);

//       if (!user) {
//         throw new Error("User not found for the given user_id.");
//       }

//       // Add film to the database
//       await Film.create(formattedTitle, release_year, formattedDescription);

//       // Send approval email to the user
//       await sendApprovalEmail(
//         user.email,
//         user.username,
//         title,
//         formattedTitle,
//         release_year
//       );

//       res.status(200).json({
//         message: `Film "${formattedTitle}" approved and added to the database`,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(400).json({ error: error.message });
//     }
//   }
// );

// // Function to send approval email to the user
// async function sendApprovalEmail(
//   userEmail,
//   username,
//   filmTitle,
//   formattedFilmTitle,
//   filmYear
// ) {
//   try {
//     // Email content
//     const emailContent = `
//       Dear ${username},

//       Your film submission for "${formattedFilmTitle} (${filmYear})" has been approved. You can view your submission here: https://www.undervaluedfilms.com/${filmTitle}-${filmYear}

//       Thank you for your contribution!

//       Sincerely,
//       Undervalued Films
//     `;

//     // Email options
//     const mailOptions = {
//       from: config.email,
//       to: userEmail,
//       subject: "Film Submission Approved",
//       text: emailContent,
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Error sending approval email:", error);
//     throw new Error("Failed to send approval email");
//   }
// }

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

// // Function to validate rejection identifier
// function isValidRejectionIdentifier(identifier) {
//   // Check if the identifier is a non-empty string
//   return typeof identifier === "string" && identifier.length > 0;
// }

// // Function to validate approval identifier
// function isValidApprovalIdentifier(identifier) {
//   // Check if the identifier is a non-empty string
//   return typeof identifier === "string" && identifier.length > 0;
// }

module.exports = router;
