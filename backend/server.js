const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const cors = require('cors');

app.use(cors({
  origin: "http://localhost:3000", // Frontend URL
  credentials: true, // Allow cookies to be sent
}));

// PostgreSQL pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // use secure cookies in production (HTTPS)
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

/**
 * Passport Local Strategy for email/password authentication
 */
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (res.rows.length === 0) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const user = res.rows[0];
      // Compare provided password with stored hashed password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

/**
 * Passport Google OAuth Strategy
 */
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists based on Google ID
      const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
      let user;
      if (res.rows.length > 0) {
        user = res.rows[0];
      } else {
        // Create new user with data from Google
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const insertRes = await pool.query(
          'INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING *',
          [email, name, profile.id]
        );
        user = insertRes.rows[0];
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/**
 * Passport session handling
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length > 0) {
      done(null, res.rows[0]);
    } else {
      done(new Error("User not found"), null);
    }
  } catch (error) {
    done(error, null);
  }
});
app.get('/api/test', (req, res) => {
  res.json({ message: "Test route works!" });
});
/**
 * Authentication Routes
 */
// Local Login
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email, name: user.name }
      });
    });
  })(req, res, next);
});

// Sign Up
app.post('/api/auth/signup', async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertRes = await pool.query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING *',
      [email, name, hashedPassword]
    );
    const user = insertRes.rows[0];
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: { id: user.id, email: user.email, name: user.name }
      });
    });
  } catch (error) {
    return next(error);
  }
});

// Google OAuth Start
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to the food logging page.
    res.redirect('http://localhost:3000/food-logging');
  }
);

// Get Current Authenticated User
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
  } else {
    res.status(401).json({ success: false, message: 'Not logged in' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'User logged out successfully' });
  });
});

/**
 * Middleware to Protect Routes
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: "Unauthorized" });
}

/**
 * Food Logging Endpoints
 */
// GET food logs for the logged-in user
app.get('/api/foodlogs', ensureAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM foodlogs WHERE user_id = $1 ORDER BY timestamp ASC',
      [req.user.id]
    );
    res.json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching food logs', error: error.message });
  }
});

// POST a new food log
app.post('/api/foodlogs', ensureAuthenticated, async (req, res) => {
  const { item } = req.body;
  if (!item) return res.status(400).json({ success: false, message: 'Food item is required' });
  try {
    const result = await pool.query(
      'INSERT INTO foodlogs (user_id, item) VALUES ($1, $2) RETURNING *',
      [req.user.id, item]
    );
    res.status(201).json({ log: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding food log', error: error.message });
  }
});

// DELETE a food log by ID
app.delete('/api/foodlogs/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM foodlogs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Food log not found' });
    }
    res.json({ success: true, message: 'Food log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting food log', error: error.message });
  }
});

app.post('/api/favorites/ingredients', ensureAuthenticated, async (req, res) => {
  const { ingredient } = req.body;
  if (!ingredient) {
    return res.status(400).json({ success: false, message: 'Ingredient is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO user_favorite_ingredients (user_id, ingredient) VALUES ($1, $2) RETURNING *',
      [req.user.id, ingredient]
    );
    res.status(201).json({ success: true, favorite: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding favorite ingredient', error: error.message });
  }
});

app.post('/api/favorites/dishes', ensureAuthenticated, async (req, res) => {
  const { dish } = req.body;
  if (!dish) {
    return res.status(400).json({ success: false, message: 'Dish is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO user_favorite_dishes (user_id, dish) VALUES ($1, $2) RETURNING *',
      [req.user.id, dish]
    );
    res.status(201).json({ success: true, favorite: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding favorite dish', error: error.message });
  }
});

app.get('/api/favorites/ingredients', ensureAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_favorite_ingredients WHERE user_id = $1 ORDER BY date_added ASC',
      [req.user.id]
    );
    res.json({ favorites: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching favorite ingredients', error: error.message });
  }
});

app.get('/api/favorites/dishes', ensureAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_favorite_dishes WHERE user_id = $1 ORDER BY date_added ASC',
      [req.user.id]
    );
    res.json({ favorites: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching favorite dishes', error: error.message });
  }
});

app.delete('/api/favorites/ingredients/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM user_favorite_ingredients WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Favorite ingredient not found' });
    }
    res.json({ success: true, message: 'Favorite ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting favorite ingredient', error: error.message });
  }
});

app.delete('/api/favorites/dishes/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM user_favorite_dishes WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Favorite dish not found' });
    }
    res.json({ success: true, message: 'Favorite dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting favorite dish', error: error.message });
  }
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

module.exports = app;