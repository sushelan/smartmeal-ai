CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password TEXT,
    google_id TEXT
);

CREATE TABLE IF NOT EXISTS foodlogs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_favorite_ingredients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  date_added TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_favorite_dishes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dish TEXT NOT NULL,
  date_added TIMESTAMPTZ DEFAULT NOW()
);

/* psql -U postgres -h localhost -d mealplan -f db/init.sql */