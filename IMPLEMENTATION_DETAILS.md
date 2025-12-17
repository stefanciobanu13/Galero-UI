# Implementation Summary: Google OAuth with Player Linking

## Overview
Complete implementation of Google OAuth authentication with player linking functionality. After a user logs in with Google, they're prompted to select and link a player from the database.

## Files Modified

### 1. `src/types/index.ts`
**Changes**: Extended User interface
- Added backend response fields: `userId`, `googleId`, `firstName`, `lastName`, `profilePictureUrl`, `playerId`, `role`, `createdAt`, `updatedAt`
- These fields are now optional to support both demo and real authentication

### 2. `src/stores/auth.ts`
**Changes**: Enhanced authentication store with new methods
- `loginWithGoogle(credential)` - Handles Google credential verification with backend
  - Stores user data from backend response
  - Sets `needsPlayerSelection` flag if user has no playerId
  - Stores auth token in localStorage
  
- `assignPlayer(playerId)` - Assigns a player to the current user
  - Makes POST request to `/users/{userId}/assign-player/{playerId}`
  - Updates user state and localStorage
  - Clears `needsPlayerSelection` flag
  
- `unassignPlayer()` - Removes player assignment
  - Makes POST request to `/users/{userId}/unassign-player`
  - Resets playerId and sets `needsPlayerSelection` to true
  
- `needsPlayerSelection` - New ref to track if user needs to select a player
- `restoreFromStorage()` - Updated to set `needsPlayerSelection` based on stored data

### 3. `src/services/api.ts`
**Changes**: Added new API endpoints
- `authService.loginWithGoogle(credential)` - POST `/users/google-login`
  - Sends Google credential to backend for verification
  - Returns complete user profile with all fields
  
- `authService.assignPlayerToUser(userId, playerId)` - POST `/users/{userId}/assign-player/{playerId}`
  - Assigns selected player to user
  
- `authService.unassignPlayerFromUser(userId)` - POST `/users/{userId}/unassign-player`
  - Removes player assignment

### 4. `src/pages/Login.vue`
**Changes**: Integrated Google OAuth authentication
- Replaced mock button with actual Google OAuth One Tap button
- Uses Google Identity Services JavaScript library
- `handleGoogleSuccess()` - Calls `authStore.loginWithGoogle()`
  - If player selection needed, shows PlayerSelectionModal
  - Otherwise redirects to home page
  
- `handleGoogleError()` - Displays error message
- Kept demo buttons for development testing
- Error message display for auth failures

### 5. `src/pages/Profile.vue`
**Changes**: Added player assignment management
- **Assigned Player Section**:
  - Shows assigned player name with check icon
  - Displays "No player assigned yet" if not assigned
  
- **Player Management Buttons**:
  - "Assign Player" / "Change Player" - Opens modal to select/change player
  - "Unlink" - Removes assignment with confirmation
  
- **PlayerSelectionModal Integration**:
  - Can open modal from profile page
  - `handlePlayerSelected()` - Updates state and shows success message
  - `handleUnassignPlayer()` - Unlinks player with confirmation
  
- **UI Improvements**:
  - Success/error message alerts
  - Loading states during operations
  - Better formatting with cards for player display

### 6. `src/components/PlayerSelectionModal.vue` (NEW)
**Features**:
- Fetches all players from `/players` endpoint on mount
- **Player Selection UI**:
  - Dropdown select component
  - Text search input for filtering
  - Clickable card list with radio buttons
  - Each card shows player name and grade
  
- **Search/Filter**:
  - Real-time filtering by first name, last name, or grade
  - Client-side filtering after fetching all players
  
- **Actions**:
  - "Confirm" - Assigns selected player and closes modal
  - "Skip for Now" - Proceeds without player assignment
  
- **States**:
  - Loading while fetching players
  - Error messages if fetch or assignment fails
  - Disabled states during operations
  
- **Props & Emits**:
  - `v-model:open` - Controls modal visibility
  - `@player-selected` - Emitted when player is successfully assigned
  - `@skip` - Emitted when user skips selection

### 7. `index.html`
**Changes**: Added Google OAuth script
- Added `<script src="https://accounts.google.com/gsi/client" async defer></script>`
- This loads the Google Identity Services JavaScript library needed for OAuth

## Data Flow

### Login Flow
```
User clicks "Sign in with Google"
  ↓
Google OAuth dialog appears
  ↓
User authenticates with Google
  ↓
Google sends credential to frontend
  ↓
Frontend calls authStore.loginWithGoogle(credential)
  ↓
authStore calls authService.loginWithGoogle(credential)
  ↓
Backend endpoint /users/google-login validates token
  ↓
Backend returns user profile with all fields
  ↓
Frontend checks if playerId exists
  ├─ YES: Redirect to home
  └─ NO: Show PlayerSelectionModal
```

### Player Assignment Flow
```
User selects player in modal
  ↓
Frontend calls authStore.assignPlayer(playerId)
  ↓
authStore calls authService.assignPlayerToUser(userId, playerId)
  ↓
Backend endpoint /users/{userId}/assign-player/{playerId}
  ↓
Backend returns updated user with playerId
  ↓
Frontend updates user state and localStorage
  ↓
Modal closes and user redirected to home
```

### Change Player Flow
```
User on profile page clicks "Change Player"
  ↓
PlayerSelectionModal opens
  ↓
User selects different player
  ↓
Same assignment flow as above
  ↓
Success message displayed
```

### Unlink Player Flow
```
User clicks "Unlink" button
  ↓
Confirmation dialog shown
  ↓
User confirms
  ↓
Frontend calls authStore.unassignPlayer()
  ↓
Backend endpoint /users/{userId}/unassign-player
  ↓
Frontend clears playerId from user state
  ↓
Success message displayed
  ↓
User can now assign a new player
```

## API Endpoints Expected

### 1. POST `/api/v1/users/google-login`
**Request**: `{ credential: string }`
**Response**:
```json
{
  "userId": 1,
  "googleId": "user123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "https://...",
  "playerId": 5,
  "role": "user",
  "createdAt": "2025-12-11T14:00:00",
  "updatedAt": "2025-12-11T14:05:00"
}
```

### 2. GET `/api/v1/players`
**Response**:
```json
[
  {
    "playerId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "grade": 10
  },
  ...
]
```

### 3. POST `/api/v1/users/{userId}/assign-player/{playerId}`
**Response**: Updated user object (same as google-login response)

### 4. POST `/api/v1/users/{userId}/unassign-player`
**Response**: Success confirmation

## Configuration

### Google OAuth Setup
1. Get Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `VITE_GOOGLE_CLIENT_ID` in environment or directly in `src/pages/Login.vue`
3. Add `http://localhost:3000` to authorized origins

### Backend Requirements
- Must be running at `http://localhost:8080/api/v1`
- Implement all 4 endpoints listed above
- Validate Google tokens on backend
- Implement player assignment logic

## Testing

### Demo Mode (Without Google OAuth)
- "Demo: Login as User" - Skips player selection
- "Demo: Login as Admin" - Skips player selection

### Production Mode (With Google OAuth)
1. Click "Sign in with Google"
2. Complete Google authentication
3. Select a player from modal
4. Confirm and redirect to home
5. Visit profile page to see assigned player
6. Test "Change Player" and "Unlink" buttons

## Security Notes

- Google credentials are validated on the backend
- Auth token is stored in localStorage and sent with API requests
- User data is populated from backend response, not frontend
- Confirmation required for unlinking player
- All sensitive operations require valid authentication

## Future Enhancements

- Add Google token refresh logic
- Implement logout on token expiry
- Add player history/audit trail
- Add admin functionality to manage user-player links
- Add email verification if needed
- Implement proper error handling with retry logic
