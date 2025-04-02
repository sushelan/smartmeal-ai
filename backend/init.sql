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

/* psql -U postgres -h localhost -d mealplan -f db/init.sql */