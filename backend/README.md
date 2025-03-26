SmartMeal Project
SmartMeal is a smart meal planning platform built with a Node.js/Express backend using PostgreSQL for storage and a Next.js frontend. The application supports local authentication (with Passport) as well as Google OAuth, and allows users to log food items.

Table of Contents

1. Prerequisites
2. Environment Setup
3. PostgreSQL Database Setup
4. Backend Setup
5. Frontend Setup
6. API Endpoints
7. Troubleshooting

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Git (optional, for version control)

## Environment Setup

Create a .env file in the backend directory with the following content (replace placeholder values as needed):

```
PORT=5001
SESSION_SECRET=your_session_secret
DATABASE_URL=postgres://username:password@localhost:5432/mealplanlogin
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## PostgreSQL Database Setup

### 1. Create the Database

Open your terminal and connect to PostgreSQL:

```
psql postgres
```

Create your database:

```
CREATE DATABASE mealplanlogin;
```

Exit psql with:

```
\q
```

### 2. Create the Users Table

Connect to your new database:

```
psql mealplanlogin
```

Run the following SQL command to create the users table:

```
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255),    -- For local authentication
  google_id VARCHAR(255)    -- For Google OAuth users
);
```

### 3. Create the Food Logs Table

In the same database, run:

```
CREATE TABLE IF NOT EXISTS foodlogs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Exit psql:

```
\q
```

## Backend Setup

Navigate to the backend directory.

Install dependencies:

```
npm install
```

Start the backend server:

```
node server.js
```

You should see a message like:

```
Backend server listening on port 5001
```

### Overview of Backend (server.js)

**Middleware**:

- Uses CORS (allowing requests from http://localhost:3000), JSON and URL-encoded parsers, and session middleware.

**Passport Configuration**:

- Sets up a local strategy for email/password authentication and a Google OAuth strategy.

**Routes**:

- Authentication routes under `/api/auth/...`:
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `GET /api/auth/google`
  - `GET /api/auth/google/callback` (redirects to http://localhost:3000/food-logging on success)
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- Food logging routes (protected):
  - `GET /api/foodlogs`
  - `POST /api/foodlogs`
  - `DELETE /api/foodlogs/:id`

## Frontend Setup

Navigate to the frontend directory.

Install dependencies:

```
npm install
```

Start the Next.js development server:

```
npm run dev
```

Your app should be available at http://localhost:3000.

### Frontend File Structure

```
team-21-project/
  backend/
    server.js
    .env
  frontend/
    public/                <-- Place static assets here (texture.svg, google-icon.svg, etc.)
    services/
      authApi.js
      axiosInstance.js
    src/
      app/
        page.js          // Login page (homepage)
        food-logging/
          page.js        // Food logging page (route: /food-logging)
        layout.js
```

### Key Frontend Files

- **services/authApi.js**: Contains helper functions (`login`, `signup`, `startGoogleOAuth`, `logout`, `getCurrentUser`) that use Axios to call backend endpoints.
- **services/axiosInstance.js**: Configures the Axios instance with a base URL pointing to the backend.
- **src/app/page.js**: The homepage is the login page. On successful login (or via Google OAuth), it redirects to `/food-logging`.
- **src/app/food-logging/page.js**: This page allows users to add, view, and delete food logs via API calls to the backend.
- **src/app/layout.js**: Global layout for the Next.js app.

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login`: Log in a user with email and password.
- `POST /api/auth/signup`: Create a new user account.
- `GET /api/auth/google`: Start Google OAuth login.
- `GET /api/auth/google/callback`: Google OAuth callback. On success, redirects to `http://localhost:3000/food-logging`.
- `GET /api/auth/me`: Get information about the currently authenticated user.
- `POST /api/auth/logout`: Log out the user.

### Food Logging Endpoints (Protected)

- `GET /api/foodlogs`: Retrieve all food logs for the logged-in user.
- `POST /api/foodlogs`: Add a new food log. Expects JSON body: `{ item: "food item" }`.
- `DELETE /api/foodlogs/:id`: Delete a specific food log by its ID.

## Troubleshooting

### 404 Errors on API Calls

- Ensure your Axios instance in `authApi.js` has the correct base URL (e.g., `http://localhost:5001/api`). Verify that your endpoint paths are correct.

### Session and Authentication

- Confirm that after logging in, a session cookie is set (check in your browser's Application tab under Cookies). Use the `/api/auth/me` endpoint to test the session.

### Static Assets Not Loading

- Place your static files (like `texture.svg` and `google-icon.svg`) in the `frontend/public` folder.

### Next.js Routes

- Verify that your Next.js route folder names match exactly (e.g., `food-logging` for `/food-logging`). Clear the `.next` cache and restart the dev server if necessary.

### Testing

- Use Postman or curl to test your API endpoints manually if needed.

### Error Logging

- Check backend logs and browser console for error details.
