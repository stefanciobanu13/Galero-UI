# Backend Requirements for Google OAuth Integration

## Overview
The frontend has been updated to use real Google OAuth authentication. The backend needs to implement a Google login endpoint that validates the Google credential JWT and returns the user profile.

## Frontend Implementation

The frontend now sends a POST request to authenticate users via Google OAuth. Here's what the frontend does:

1. **Google OAuth Flow**:
   - User clicks "Sign in with Google" button
   - Google returns an OAuth credential JWT (not a Bearer token)
   - Frontend sends this credential to backend for validation

2. **Frontend Request**:
   ```
   POST /api/v1/users/google/login
   Content-Type: application/json
   Body: {
     "credential": "<Google JWT token from OAuth>"
   }
   ```

## Backend Requirements

### Endpoint: `POST /api/v1/users/google/login`

**Request Body:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjExIn0..."
}
```

The `credential` is a JWT token signed by Google. You need to:

1. **Validate the Google JWT**:
   - Verify the JWT signature using Google's public keys
   - Check that the token is not expired
   - Use Google's token validation libraries (e.g., `google-auth-library`)

2. **Extract user information** from the JWT payload:
   - `sub` → googleId
   - `email` → email
   - `given_name` → firstName
   - `family_name` → lastName
   - `picture` → profilePictureUrl

3. **User Management Logic**:
   - Check if user exists in database (by googleId or email)
   - If user exists: update their profile with latest info
   - If user doesn't exist: create new user record
   - Use role `"user"` by default (can be upgraded to `"admin"` by admin)

4. **Return Response** with this exact structure:
   ```json
   {
     "userId": 123,
     "googleId": "118234567890123456789",
     "email": "user@gmail.com",
     "firstName": "John",
     "lastName": "Doe",
     "profilePictureUrl": "https://lh3.googleusercontent.com/...",
     "playerId": null,
     "role": "user",
     "createdAt": "2025-12-17T13:44:18.660Z",
     "updatedAt": "2025-12-17T13:44:18.660Z"
   }
   ```

   **Field Explanations:**
   - `userId`: Unique user ID in your database
   - `googleId`: Google's unique ID from the JWT `sub` claim
   - `email`: User's email from JWT
   - `firstName`: First name from JWT `given_name` (can be null)
   - `lastName`: Last name from JWT `family_name` (can be null)
   - `profilePictureUrl`: Avatar URL from JWT `picture` (can be null)
   - `playerId`: Will be null initially; set when user selects a player
   - `role`: Either `"user"` or `"admin"`
   - `createdAt`, `updatedAt`: Timestamps

### Error Handling

Return appropriate HTTP status codes:
- `200 OK`: Successful authentication
- `400 Bad Request`: Missing or invalid credential
- `401 Unauthorized`: Invalid/expired Google token
- `500 Internal Server Error`: Server-side error

**Error Response Example:**
```json
{
  "error": "Invalid Google credential",
  "message": "Token signature verification failed"
}
```

## Frontend Flow After Backend Response

Once the backend returns the user profile:

1. **Store the credential** as `authToken` in localStorage (this will be used for subsequent requests as Bearer token)
2. **User sees player selection modal** if `playerId` is null
3. **User can assign a player** via `POST /api/v1/users/{userId}/assign-player/{playerId}`

## Google Libraries Recommended

Depending on your backend language:

- **Node.js/Express**: Use `google-auth-library` npm package
  ```javascript
  const {OAuth2Client} = require('google-auth-library');
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  
  async function verify(credential) {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  }
  ```

- **Java/Spring**: Use `google-auth-library-java`

- **Python/Django**: Use `google-auth` library

- **C#/.NET**: Use `Google.Apis.Auth` NuGet package

## Testing

To test this locally:

1. Get a Google credential JWT from the frontend (user clicks login)
2. Use tools like Postman or curl to test:
   ```bash
   curl -X POST http://localhost:8080/api/v1/users/google/login \
     -H "Content-Type: application/json" \
     -d '{"credential": "<actual-google-jwt-token>"}'
   ```

## Additional Endpoints (Already Planned in Frontend)

These endpoints will also be needed later:

- `POST /api/v1/users/{userId}/assign-player/{playerId}` - Assign a player to user
- `POST /api/v1/users/{userId}/unassign-player` - Unassign player from user
- `GET /api/v1/players` - List all players
- `GET /api/v1/players/{playerId}` - Get specific player
- `GET /api/v1/players/search?firstName=...&lastName=...` - Search players

But the priority is getting the `/users/google/login` endpoint working first.
