# Backend Integration Reference

This document provides example responses and request formats for the frontend implementation.

## API Endpoints Reference

### 1. POST `/api/v1/users/google-login`

**Description**: Authenticate user with Google credential and return user profile

**Request**:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkNmZhMDc4MTAzZjUxMTEzZTZkZjczNzljYjc0MWQyOTQ2OWQ2YzAiLCJ0eXAiOiJKV1QifQ..."
}
```

**Response** (200 OK):
```json
{
  "userId": 1,
  "googleId": "110169091038130507772",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "https://lh3.googleusercontent.com/...",
  "playerId": 5,
  "role": "user",
  "createdAt": "2025-12-11T14:00:00Z",
  "updatedAt": "2025-12-11T14:05:00Z"
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Invalid or expired Google credential"
}
```

---

### 2. GET `/api/v1/players`

**Description**: Get list of all available players

**Response** (200 OK):
```json
[
  {
    "playerId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "grade": 10
  },
  {
    "playerId": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "grade": 11
  },
  {
    "playerId": 3,
    "firstName": "Mike",
    "lastName": "Johnson",
    "grade": 9
  },
  {
    "playerId": 4,
    "firstName": "Sarah",
    "lastName": "Williams",
    "grade": 10
  },
  {
    "playerId": 5,
    "firstName": "Tom",
    "lastName": "Brown",
    "grade": 11
  }
]
```

**Response** (500 Error):
```json
{
  "error": "Failed to fetch players"
}
```

---

### 3. POST `/api/v1/users/{userId}/assign-player/{playerId}`

**Description**: Assign a player to a user

**Path Parameters**:
- `userId`: User ID (number)
- `playerId`: Player ID to assign (number)

**Example**: `POST /api/v1/users/1/assign-player/5`

**Response** (200 OK):
```json
{
  "userId": 1,
  "googleId": "110169091038130507772",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "https://lh3.googleusercontent.com/...",
  "playerId": 5,
  "role": "user",
  "createdAt": "2025-12-11T14:00:00Z",
  "updatedAt": "2025-12-11T14:15:00Z"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Player not found"
}
```

**Response** (403 Forbidden):
```json
{
  "error": "Unauthorized to assign player"
}
```

---

### 4. POST `/api/v1/users/{userId}/unassign-player`

**Description**: Remove player assignment from user

**Path Parameters**:
- `userId`: User ID (number)

**Example**: `POST /api/v1/users/1/unassign-player`

**Response** (200 OK):
```json
{
  "userId": 1,
  "googleId": "110169091038130507772",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "https://lh3.googleusercontent.com/...",
  "playerId": null,
  "role": "user",
  "createdAt": "2025-12-11T14:00:00Z",
  "updatedAt": "2025-12-11T14:20:00Z"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "No player currently assigned"
}
```

---

## Frontend Implementation Expectations

### When Login Succeeds (playerId is set)
```typescript
// User has a player assigned
authStore.loginWithGoogle(credential)
  // playerId exists in response
  // Frontend shows profile immediately
  // No player selection modal
```

### When Login Succeeds (no playerId)
```typescript
// User has no player assigned
authStore.loginWithGoogle(credential)
  // playerId is null/undefined in response
  // Frontend shows PlayerSelectionModal
  // User can select and assign player
```

### Player Assignment Flow
```typescript
// User selects player in modal
authStore.assignPlayer(playerId)
  // Frontend calls POST /users/{userId}/assign-player/{playerId}
  // Backend returns updated user with playerId
  // Frontend updates user state
  // Modal closes
  // User redirected to home
```

### Unlink Flow
```typescript
// User clicks Unlink
authStore.unassignPlayer()
  // Frontend calls POST /users/{userId}/unassign-player
  // Backend returns user with playerId = null
  // Frontend clears playerId
  // Modal can be shown again to reassign
```

---

## Error Scenarios

### Invalid Google Credential
**Frontend**: Shows error message "Login failed. Please try again."
**Backend**: Returns 401 with error message

### Player Not Found
**Frontend**: Shows error in modal "Failed to assign player"
**Backend**: Returns 400 with error message

### Unauthorized Assignment
**Frontend**: Shows error message "Failed to assign player"
**Backend**: Returns 403 Forbidden

### Network Error
**Frontend**: Shows error message with retry option
**Backend**: Not reached

---

## Authentication Header

All authenticated requests include:
```
Authorization: Bearer {authToken}
```

The auth token is the Google credential received from Google OAuth.

---

## Sample Backend Implementation (Pseudo-code)

### POST /users/google-login
```typescript
async function googleLogin(credential: string) {
  // 1. Verify Google credential
  const payload = verifyGoogleToken(credential);
  
  // 2. Find or create user
  let user = await findUserByGoogleId(payload.sub);
  if (!user) {
    user = await createUser({
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      profilePictureUrl: payload.picture,
      role: 'user'
    });
  }
  
  // 3. Return user profile
  return {
    userId: user.id,
    googleId: user.googleId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePictureUrl: user.profilePictureUrl,
    playerId: user.playerId, // null if not assigned
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
```

### GET /players
```typescript
async function getPlayers() {
  return await Player.find().select('playerId firstName lastName grade');
}
```

### POST /users/:userId/assign-player/:playerId
```typescript
async function assignPlayer(userId: number, playerId: number) {
  // 1. Verify user exists
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  
  // 2. Verify player exists
  const player = await findPlayerById(playerId);
  if (!player) throw new Error('Player not found');
  
  // 3. Update user
  user.playerId = playerId;
  user.updatedAt = new Date();
  await user.save();
  
  // 4. Return updated user
  return {
    userId: user.id,
    googleId: user.googleId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePictureUrl: user.profilePictureUrl,
    playerId: user.playerId,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
```

### POST /users/:userId/unassign-player
```typescript
async function unassignPlayer(userId: number) {
  // 1. Verify user exists
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  
  // 2. Clear playerId
  user.playerId = null;
  user.updatedAt = new Date();
  await user.save();
  
  // 3. Return updated user
  return {
    userId: user.id,
    googleId: user.googleId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePictureUrl: user.profilePictureUrl,
    playerId: user.playerId,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
```

---

## Test Cases for Backend

### Test 1: Valid Google Login
- Input: Valid Google credential
- Expected: User returned with all fields

### Test 2: First-time Login
- Input: Valid Google credential for new user
- Expected: New user created and returned with playerId = null

### Test 3: Returning Login
- Input: Valid Google credential for existing user
- Expected: Existing user returned with playerId if assigned

### Test 4: Player Assignment
- Input: Valid userId and playerId
- Expected: User updated with playerId, new updatedAt timestamp

### Test 5: Multiple Assignments
- Input: Same userId with different playerId
- Expected: User playerId updated to new value

### Test 6: Unassign Player
- Input: Valid userId
- Expected: User playerId set to null

### Test 7: Unassign Non-assigned Player
- Input: Valid userId with no playerId
- Expected: Error message or success (idempotent)
