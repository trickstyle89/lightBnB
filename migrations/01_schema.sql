CREATE TABLE users (
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL
);

CREATE TABLE reservations (
id SERIAL PRIMARY KEY,
start_date DATE NOT NULL,
end_date DATE NOT NULL,
property_id INTEGER NOT NULL,
guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE properties (
id SERIAL PRIMARY KEY,
owner_id INTEGER NOT NULL REFERENCES users(id),
title VARCHAR(255),
description TEXT,
thumbnail_photo_url VARCHAR(255),
cover_photo_url VARCHAR(255),
cost_per_night INTEGER,
parking_spaces INTEGER,
number_of_bathrooms INTEGER,
number_of_bedrooms INTEGER,
country VARCHAR(255),
street VARCHAR(255),
city VARCHAR(255),
province VARCHAR(255),
post_code VARCHAR(255),
active BOOLEAN
);

DROP TABLE IF EXISTS rates CASCADE;
DROP TABLE IF EXISTS guest_reviews CASCADE;

CREATE TABLE rates (
  id SERIAL PRIMARY KEY NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cost_per_night INTEGER NOT NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE guest_reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL DEFAULT 0,
  message TEXT
);