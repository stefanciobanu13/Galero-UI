# Quick Reference: Google OAuth + Player Linking

## What Was Implemented

### ✅ Google OAuth Integration
- Google One Tap authentication on login page
- Backend validation of Google credentials
- User profile data from backend response

### ✅ Player Selection After Login
- Automatic modal on first login (if no player assigned)
- Search and filter players by name/grade
- Dropdown and clickable card interface
- "Skip for Now" option for later assignment

### ✅ Player Assignment
- POST `/users/{userId}/assign-player/{playerId}` endpoint
- Stores playerId in user profile

### ✅ Profile Page
- Display assigned player name
- "Change Player" button to select different player
- "Unlink" button with confirmation
- Success/error messages

### ✅ Player Unlinking
- POST `/users/{userId}/unassign-player` endpoint
- Allows user to remove player assignment anytime

## Files Created/Modified

### Created
- `src/components/PlayerSelectionModal.vue` - Player selection modal component
- `GOOGLE_OAUTH_SETUP.md` - Setup instructions
- `IMPLEMENTATION_DETAILS.md` - Detailed documentation

### Modified
- `src/types/index.ts` - Extended User interface
- `src/stores/auth.ts` - Added Google login, player assignment/unassignment
- `src/services/api.ts` - Added Google OAuth and player assignment endpoints
- `src/pages/Login.vue` - Integrated Google OAuth button
- `src/pages/Profile.vue` - Added player management UI
- `index.html` - Added Google OAuth script tag

## Key Implementation Details

### User Flow
1. User clicks "Sign in with Google"
2. Google authentication completes
3. Backend validates token and returns user profile
4. If user has no playerId → PlayerSelectionModal appears
5. User selects player → POST to assign endpoint
6. User redirected to home page
7. Profile page shows assigned player

### API Endpoints Required

```
POST /users/google-login
  - Validates Google credential
  - Returns user with playerId, firstName, lastName, etc.

GET /players
  - Returns list of all available players

POST /users/{userId}/assign-player/{playerId}
  - Assigns player to user
  - Returns updated user object

POST /users/{userId}/unassign-player
  - Removes player assignment
```

### State Management

**Auth Store (Pinia)**
- `user` - Current user object with all fields
- `isLoggedIn` - Authentication status
- `needsPlayerSelection` - Flag if user needs to select player
- `loginWithGoogle()` - Authenticate with Google
- `assignPlayer()` - Assign player to user
- `unassignPlayer()` - Remove player assignment

## Configuration

### Step 1: Google OAuth
```
1. Get Client ID from Google Cloud Console
2. Set VITE_GOOGLE_CLIENT_ID environment variable
   OR update client_id in src/pages/Login.vue
```

### Step 2: Backend
```
- Must be at http://localhost:8080/api/v1
- Implement 4 endpoints listed above
```

### Step 3: Run
```bash
npm run dev
```

## Testing Workflow

### With Google OAuth
1. Click "Sign in with Google"
2. Complete Google authentication
3. Player modal opens automatically
4. Select and confirm player
5. Redirected to home
6. Visit profile to see assigned player

### Without Google OAuth (Demo)
1. Click "Demo: Login as User"
2. Redirected directly to home
3. On profile, click "Assign Player"
4. Select and confirm player

### Change/Unlink Player
1. On profile page
2. Click "Change Player" to select different player
3. Click "Unlink" to remove (with confirmation)

## Error Handling

- Invalid Google credentials → Error message on login
- Failed player fetch → Alert in modal
- Failed player assignment → Alert with retry option
- Failed unlink → Error message

## Storage

- User data stored in `localStorage.user`
- Auth token in `localStorage.authToken`
- Login status in `localStorage.isLoggedIn`
- Data persists across page refreshes

## Success Indicators

✅ Google OAuth button renders on login page
✅ Player modal appears after Google auth
✅ Player search works
✅ Player assignment succeeds
✅ Assigned player shows on profile
✅ Change player works
✅ Unlink player works
✅ User data persists on refresh
✅ All error cases handled with messages

## Demo Buttons

For development without Google OAuth setup:
- "Demo: Login as User" - Direct user login
- "Demo: Login as Admin" - Direct admin login

These bypass Google OAuth but still allow testing the UI.

## Notes

- All async operations have loading states
- Confirmation required for destructive actions (unlink)
- Player search is client-side after fetching all players
- Modal can be dismissed to proceed without player selection
- User can assign player later on profile page
- Auth token automatically included in API requests
