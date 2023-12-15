const db = require("../db"); // Import your database connection

const WatchLinkClicks = {
  // Count watch link clicks
  create: (user_id, film_id) => {
    return db.query(
      "INSERT INTO Watch_Link_Clicks (user_id, film_id, click) VALUES ($1, $2, true) RETURNING *",
      [user_id, film_id]
    );
  },
};

module.exports = WatchLinkClicks;
