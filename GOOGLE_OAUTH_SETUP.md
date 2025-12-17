# Google OAuth Setup Guide

## Implementation Summary

I've implemented a complete Google OAuth login flow with player linking functionality. Here's what was added:

### Components & Files Created:
1. **`src/components/PlayerSelectionModal.vue`** - Modal for selecting and assigning players after login
2. **Updated `src/pages/Login.vue`** - Integrated Google OAuth button and player selection flow
3. **Updated `src/pages/Profile.vue`** - Shows assigned player with change/unlink options
4. **Updated `src/stores/auth.ts`** - Added Google login, player assignment, and unassignment methods
5. **Updated `src/services/api.ts`** - Added backend API endpoints for authentication and player assignment
6. **Updated `src/types/index.ts`** - Extended User interface with backend fields
7. **Updated `index.html`** - Added Google OAuth script tag

## Key Features

### 1. Google OAuth Authentication
- Users click "Sign in with Google" button on login page
- Google OAuth One Tap authentication is rendered
- Backend validates Google credential and returns user profile

### 2. Player Selection Modal
After successful Google login:
- Modal displays automatically if user has no assigned player
- Users can search players by name or grade
- Dropdown and clickable card list for selecting players
- "Confirm" button sends assignment request to backend
- "Skip for Now" option to proceed without selecting

### 3. Player Assignment API
- **Endpoint**: `POST /api/v1/users/{userId}/assign-player/{playerId}`
- Expected response includes updated user data with playerId

### 4. Profile Page Updates
- Displays assigned player name with check icon
- "Change Player" button opens modal to select different player
- "Unlink" button removes player assignment
- Shows "No player assigned yet" if user hasn't selected one
- Success/error messages for all operations

## Configuration Steps

### Step 1: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000` as authorized JavaScript origin
6. Copy your Client ID

### Step 2: Set Environment Variable
Create a `.env` file in the project root:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Or update the client ID in `src/pages/Login.vue`:
```typescript
client_id: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID',
```

### Step 3: Ensure Backend is Running
The application expects a backend running at `http://localhost:8080/api/v1` with these endpoints:

**Endpoints Required:**

1. **POST `/users/google-login`**
   - Request: `{ credential: string }`
   - Response: User object with userId, firstName, lastName, email, googleId, playerId, profilePictureUrl, role, createdAt, updatedAt

2. **GET `/players`**
   - Response: Array of Player objects with playerId, firstName, lastName, grade

3. **POST `/users/{userId}/assign-player/{playerId}`**
   - Response: Updated user object with playerId

4. **POST `/users/{userId}/unassign-player`**
   - Response: Success confirmation

### Step 4: Run the Application
```bash
npm run dev
```

Navigate to `http://localhost:3000` and test the login flow.

## User Flow

1. **Unauthenticated User**
   - Clicks "Sign in with Google"
   - Google One Tap authentication appears

2. **After Google Authentication**
   - Backend validates token and returns user profile
   - If user has no playerId:
     - Player Selection Modal opens automatically
     - User searches and selects a player
     - Player is assigned via `POST /users/{userId}/assign-player/{playerId}`
   - If user has playerId:
     - User redirected to home page

3. **On Profile Page**
   - Displays assigned player name
   - Options to change or unlink player
   - Change opens modal to select different player
   - Unlink removes assignment (requires confirmation)

## Demo Features (Still Available)

For development without setting up Google OAuth:
- "Demo: Login as User" - Direct login without OAuth
- "Demo: Login as Admin" - Direct admin login

## Notes

- Google OAuth script is loaded from CDN in `index.html`
- All user data is stored in localStorage for session persistence
- Player selection state is tracked in auth store via `needsPlayerSelection` flag
- Auth interceptor automatically adds bearer token to API requests
- Search/filter is done client-side after fetching all players
- Modal can be skipped to proceed without player selection (user can assign later on profile)

## Testing Checklist

- [ ] Google OAuth button renders on login page
- [ ] Google authentication flow works
- [ ] Player selection modal appears after login
- [ ] Player search/filter works
- [ ] Player assignment request succeeds
- [ ] Assigned player displays on profile page
- [ ] Change player functionality works
- [ ] Unlink player functionality works with confirmation
- [ ] User data persists after page refresh
- [ ] Logout clears all auth data
