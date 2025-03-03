## Local Login 

Endpoint
`POST /api/auth/login`

Request Body
```
{
  "email": string,
  "password": string
}
```

Response
Success (HTTP 200)
```{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "Alice"
    // ...any additional fields needed on the frontend
  },
  "token": "JWT_OR_SESSION_ID"
}
```

Error (HTTP 401)
```
{
  "success": false,
  "message": "Invalid credentials"
}
```

Notes:
If using a session cookie, don't return a token field, set a cookie instead.
If using JWT, we can include the JWT string here.

## Google OAuth Start

Endpoint
`GET /api/auth/google`

Behavior:
Redirects user to Google’s OAuth sign-in page.
No request body needed.
On success, Google sends user back to your callback.

## Google OAuth Callback

Endpoint
`GET /api/auth/google/callback`

Response:
On success: Redirect to the frontend, e.g., https://yourapp.com/dashboard, possibly with a token/cookie.
On failure: Redirect to some error page or return JSON indicating failure.

Notes:
In Node code, handle the “passport.authenticate('google')” logic here.
User’s data will be stored in the DB if they’re a new user or updated if they’re returning.

## Logout

Endpoint
`POST /api/auth/logout`

Request Body:
N/A or empty object

Response:
Success (HTTP 200)
```
{
  "success": true,
  "message": "User logged out successfully"
}
```

Notes:
If using session cookies, call req.logout() (Passport) or destroy the session.
If using JWT, the frontend just discards the token; on the server side, you might store a token blacklist if you want immediate invalidation.

## Get Current User

Endpoint:
`GET /api/auth/me`

Response:
Success (HTTP 200) if user is authenticated:
```
{
  "id": 123,
  "email": "user@example.com",
  "name": "Alice",
  // any other profile fields
}
```

Error (HTTP 401) if user is not authenticated:
```
{
  "success": false,
  "message": "Not logged in"
}
```

Notes:
This helps React app know if there’s an active session (e.g., for route-guarding).
