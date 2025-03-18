// backend/server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
  cookie: { secure: false } // In production, set secure: true when using HTTPS
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

/**
 * Route: Local Login
 * POST /api/auth/login
 */
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.json({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email, name: user.name }
      });
    });
  })(req, res, next);
});

/**
 * Route: Sign Up (Registration)
 * POST /api/auth/signup
 */
app.post('/api/auth/signup', async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    // Check if user with given email already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertRes = await pool.query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING *',
      [email, name, hashedPassword]
    );
    const user = insertRes.rows[0];
    // Automatically log in the newly registered user
    req.logIn(user, (err) => {
      if (err) { return next(err); }
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

/**
 * Route: Google OAuth Start
 * GET /api/auth/google
 */
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * Route: Google OAuth Callback
 * GET /api/auth/google/callback
 */
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to protected page.
    res.redirect('/log-food');
  }
);

/**
 * Route: Get Current Authenticated User
 * GET /api/auth/me
 */
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
  } else {
    res.status(401).json({ success: false, message: 'Not logged in' });
  }
});

/**
 * Route: Logout
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ success: true, message: 'User logged out successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
