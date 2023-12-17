-- Create the Films table
CREATE TABLE Films (
    film_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INTEGER NOT NULL,
    description TEXT,
    watch_link VARCHAR(255)
);

-- Create the Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    verification_token VARCHAR(255),
    verified BOOLEAN DEFAULT false
);


-- Create the Ratings table
CREATE TABLE Ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    film_id INT REFERENCES Films(film_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
     -- Define a unique constraint on user_id and film_id
    CONSTRAINT unique_user_film_rating UNIQUE (user_id, film_id)
);

-- Create the Mentions table
CREATE TABLE Mentions (
    mention_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    film_id INT REFERENCES Films(film_id),
    mentioned BOOLEAN NOT NULL,
    -- Define a unique constraint on user_id and film_id
    CONSTRAINT unique_user_film_mention UNIQUE (user_id, film_id)
);

-- Create the Watch Link Clicks table
CREATE TABLE Watch_Link_Clicks (
    click_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    film_id INT REFERENCES Films(film_id),
    click BOOLEAN NOT NULL DEFAULT false,
    click_timestamp TIMESTAMPTZ DEFAULT NOW()
);
