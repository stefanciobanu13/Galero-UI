# User Flow & Architecture Diagrams

## 1. Complete Authentication & Player Assignment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      GALERO UI - LOGIN FLOW                     │
└─────────────────────────────────────────────────────────────────┘

START: Unauthenticated User
   │
   ├──► Visits /login
   │
   ├──► Clicks "Sign in with Google"
   │
   └──► [Google OAuth Dialog Opens]
          │
          ├──► User authenticates with Google
          │
          └──► Google returns credential to frontend
                 │
                 ├──► Frontend: authStore.loginWithGoogle(credential)
                 │
                 └──► Backend: POST /users/google-login
                        │
                        ├──► Backend validates Google credential
                        │
                        ├──► Backend finds/creates user
                        │
                        └──► Backend returns user object
                               {
                                 userId: 1,
                                 email: "user@example.com",
                                 firstName: "John",
                                 lastName: "Doe",
                                 playerId: null,  ← Key: null if not assigned
                                 role: "user",
                                 ...
                               }

                              │
                              ├──► playerId exists?
                              │
                              ├─YES─► Redirect to /
                              │       (User already has player)
                              │
                              └─NO─► Show PlayerSelectionModal
                                     │
                                     ├──► Modal fetches players
                                     │    GET /api/v1/players
                                     │
                                     ├──► User searches players
                                     │    (Client-side filtering)
                                     │
                                     ├──► User selects a player
                                     │
                                     ├──► User clicks "Confirm"
                                     │
                                     └──► Modal calls:
                                            authStore.assignPlayer(playerId)
                                            │
                                            └──► Backend:
                                                 POST /users/{userId}/assign-player/{playerId}
                                                 │
                                                 └──► Backend links player to user
                                                      Returns updated user:
                                                      { playerId: 5, ... }
                                                      │
                                                      └──► Modal closes
                                                           │
                                                           └──► Redirect to /
                                                                │
                                                                └──► HOME PAGE

END: Authenticated User with Assigned Player
```

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

App.vue
├── Router Navigation
│
├── Pages
│   ├── Login.vue
│   │   ├── Google OAuth Button
│   │   ├── Demo Buttons
│   │   └── PlayerSelectionModal
│   │       (shows if needsPlayerSelection = true)
│   │
│   ├── Home.vue
│   │   └── [Protected - requires isLoggedIn = true]
│   │
│   ├── Profile.vue
│   │   ├── User Profile Info
│   │   ├── Assigned Player Display
│   │   ├── Change Player Button
│   │   │   └── PlayerSelectionModal
│   │   ├── Unlink Player Button
│   │   └── Logout Button
│   │
│   └── Players.vue
│       └── [Protected - requires isLoggedIn = true]
│
├── Components
│   └── PlayerSelectionModal.vue
│       ├── Player List
│       ├── Search/Filter
│       ├── Dropdown Select
│       ├── Confirm Button
│       └── Skip Button
│
├── Store (Pinia)
│   └── auth.ts
│       ├── State
│       │   ├── user
│       │   ├── isLoggedIn
│       │   ├── isAdmin
│       │   └── needsPlayerSelection
│       │
│       └── Methods
│           ├── login()
│           ├── loginWithGoogle()
│           ├── assignPlayer()
│           ├── unassignPlayer()
│           ├── logout()
│           ├── setAdmin()
│           └── restoreFromStorage()
│
├── Services
│   ├── api.ts (Axios)
│   │   ├── playerService
│   │   │   └── getAll()
│   │   └── authService
│   │       ├── loginWithGoogle()
│       ├── assignPlayerToUser()
│       └── unassignPlayerFromUser()
│
└── Storage
    ├── localStorage.user
    ├── localStorage.authToken
    └── localStorage.isLoggedIn
```

## 3. Player Assignment State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│               PLAYER ASSIGNMENT STATE DIAGRAM                   │
└─────────────────────────────────────────────────────────────────┘

START: User Logs In
  │
  ├─────────────────────────────────────────────────────────────
  │
  ├─ Backend returns playerId = null
  │  │
  │  └─► [NEEDS_PLAYER_SELECTION]
  │      │
  │      ├─ needsPlayerSelection = true
  │      ├─ Show PlayerSelectionModal
  │      │
  │      ├─ User selects player
  │      │
  │      └─► authStore.assignPlayer(playerId)
  │         │
  │         ├─ Call: POST /users/{userId}/assign-player/{playerId}
  │         │
  │         └─► Transition to [HAS_PLAYER]
  │
  ├─ Backend returns playerId = 5
  │  │
  │  └─► [HAS_PLAYER]
  │      │
  │      ├─ needsPlayerSelection = false
  │      ├─ Display assigned player on profile
  │      │
  │      ├─ User can click "Change Player"
  │      │  │
  │      │  └─► Show Modal → Select Different Player
  │      │     │
  │      │     └─► POST /assign-player/{newPlayerId}
  │      │        │
  │      │        └─► playerId updated
  │      │
  │      └─ User can click "Unlink"
  │         │
  │         └─► Confirm dialog
  │            │
  │            └─► POST /unassign-player
  │               │
  │               └─► Transition back to [NEEDS_PLAYER_SELECTION]

Any State + Click Logout
  │
  └─► [NOT_AUTHENTICATED]
      ├─ Clear user, isLoggedIn, needsPlayerSelection
      ├─ Clear localStorage
      ├─ Clear authToken
      └─► Redirect to /login
```

## 4. API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    API INTERACTION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

FRONTEND                           BACKEND
   │                                  │
   ├─── POST /users/google-login ────►│
   │    { credential: "..." }         │
   │                                  │
   │                           (Verify Google Token)
   │                           (Find/Create User)
   │                                  │
   │◄──────── 200 OK ────────────────┤
   │    { userId, googleId,          │
   │      email, firstName,           │
   │      lastName, playerId,         │
   │      ... }                       │
   │                                  │
   │─── GET /players ────────────────►│
   │                                  │
   │                           (Query all players)
   │                                  │
   │◄──── 200 OK [{...}, {...}] ─────┤
   │                                  │
   │─── POST /users/1/assign-player/5─►│
   │                                  │
   │                           (Link user to player)
   │                                  │
   │◄──────── 200 OK ────────────────┤
   │    { userId: 1,                  │
   │      playerId: 5,                │
   │      updatedAt: "..." }          │
   │                                  │
   │─── POST /users/1/unassign-player─►│
   │                                  │
   │                           (Unlink user from player)
   │                                  │
   │◄──────── 200 OK ────────────────┤
   │    { userId: 1,                  │
   │      playerId: null,             │
   │      updatedAt: "..." }          │
   │                                  │
```

## 5. Data Persistence Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   DATA PERSISTENCE FLOW                         │
└─────────────────────────────────────────────────────────────────┘

LOGIN SUCCESS
   │
   ├─► Store in Pinia (Vue State)
   │   │
   │   └─ authStore.user = { ... }
   │      authStore.isLoggedIn = true
   │      authStore.needsPlayerSelection = true/false
   │
   └─► Store in localStorage
       │
       ├─ localStorage.user = JSON.stringify(user)
       ├─ localStorage.authToken = credential
       ├─ localStorage.isLoggedIn = "true"
       │
       └─ [Data persists across page refresh]

PAGE REFRESH
   │
   ├─► Vue App mounts
   │
   ├─► App.vue calls authStore.restoreFromStorage()
   │   │
   │   ├─ Read localStorage.user
   │   ├─ Read localStorage.isLoggedIn
   │   ├─ Read localStorage.authToken
   │   │
   │   └─ Restore all state in Pinia
   │
   └─► User sees authenticated state
       (No need to login again)

LOGOUT
   │
   ├─► Clear Pinia state
   │   ├─ user = null
   │   ├─ isLoggedIn = false
   │   └─ needsPlayerSelection = false
   │
   ├─► Clear localStorage
   │   ├─ localStorage.removeItem('user')
   │   ├─ localStorage.removeItem('authToken')
   │   └─ localStorage.removeItem('isLoggedIn')
   │
   └─► Redirect to /login
       (Completely unauthenticated)
```

## 6. Modal State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│            PLAYER SELECTION MODAL STATE MACHINE                 │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────
    │
    ├─ CLOSED
    │  │
    │  ├─ Show on login (if playerId = null)
    │  │  OR
    │  ├─ Open from profile (Change Player button)
    │  │
    │  └─► LOADING_PLAYERS
    │     │
    │     ├─ GET /players
    │     │
    │     ├─ Success ───────────► PLAYER_LIST_DISPLAYED
    │     │                          │
    │     │                          ├─ isLoadingPlayers = false
    │     │                          ├─ Show player list
    │     │                          ├─ Enable selection
    │     │                          │
    │     │                          ├─ User searches
    │     │                          │  │
    │     │                          │  └─ FILTERING_PLAYERS
    │     │                          │     │
    │     │                          │     └─ Update filteredPlayersList
    │     │                          │
    │     │                          ├─ User selects player
    │     │                          │  │
    │     │                          │  └─ selectedPlayerId = value
    │     │                          │
    │     │                          ├─ User clicks "Confirm"
    │     │                          │  │
    │     │                          │  └─► ASSIGNING_PLAYER
    │     │                          │     │
    │     │                          │     ├─ POST /assign-player
    │     │                          │     │
    │     │                          │     ├─ Success
    │     │                          │     │  │
    │     │                          │     │  └─► CLOSED
    │     │                          │     │     (Emit player-selected)
    │     │                          │     │
    │     │                          │     └─ Error
    │     │                          │        │
    │     │                          │        └─► PLAYER_LIST_DISPLAYED
    │     │                          │           (Show error message)
    │     │                          │
    │     │                          └─ User clicks "Skip"
    │     │                             │
    │     │                             └─► CLOSED
    │     │                                (Emit skip)
    │     │
    │     └─ Error
    │        │
    │        └─► PLAYER_LIST_DISPLAYED
    │           (Show error, retry button)
    │
    └──────────────
```

## 7. Authentication Flow Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                 SEQUENCE DIAGRAM: LOGIN FLOW                    │
└─────────────────────────────────────────────────────────────────┘

User          Login.vue      Google API      Backend         Pinia Store
  │               │              │              │                 │
  ├─ Click ──────►│              │              │                 │
  │  "Sign in      │              │              │                 │
  │   with         │              │              │                 │
  │   Google"      │              │              │                 │
  │               │              │              │                 │
  │               ├─ Initialize ─┤              │                 │
  │               │  Google 1Tap │              │                 │
  │               │              │              │                 │
  │◄──────────────┤◄─ Show Auth ─┤              │                 │
  │   Google      │  Dialog      │              │                 │
  │   Dialog      │              │              │                 │
  │               │              │              │                 │
  ├─ Enter ──────►│              │              │                 │
  │  Credentials  │              │              │                 │
  │               │              │              │                 │
  │               │◄── Return ───┤              │                 │
  │               │   Credential │              │                 │
  │               │              │              │                 │
  │               ├─────────────────────────────►│                 │
  │               │  loginWithGoogle(credential) │                 │
  │               │                              │                 │
  │               │                    Verify & │                 │
  │               │                    Get User │                 │
  │               │                              │                 │
  │               │◄─────────────────────────────┤                 │
  │               │    User Object (playerId:null)                 │
  │               │                              │                 │
  │               ├──────────────────────────────────────────────►│
  │               │     loginWithGoogle()       │   Save User     │
  │               │                              │   needsPlayer=true
  │               │                              │                 │
  │               │                              │◄──────────────┤
  │               │                              │  Return User   │
  │               │                              │                 │
  │               ├─ Show ──────────────────────────────────────►│
  │               │ PlayerSelectionModal│       │                 │
  │               │                     │       │                 │
  │               ├─ GET /players───────────────►│                 │
  │               │                              │                 │
  │               │◄─────────────────────────────┤                 │
  │               │   Players List              │                 │
  │               │                              │                 │
  ├─ Select ─────►│                              │                 │
  │  Player       ├─────────────────────────────►│                 │
  │               │ assignPlayer(playerId)      │                 │
  │               │ POST /assign-player         │                 │
  │               │                    Link User│                 │
  │               │                    & Player │                 │
  │               │◄─────────────────────────────┤                 │
  │               │    Updated User (playerId:5)│                 │
  │               │                              │                 │
  │               ├──────────────────────────────────────────────►│
  │               │     assignPlayer()         │   Update User   │
  │               │                              │   playerId=5    │
  │               │                              │                 │
  │               │                              │◄──────────────┤
  │               │                              │ User Updated   │
  │               │                              │                 │
  ├ Redirect ─────┤◄─ Close Modal ─────────────┤                 │
  │ to /          │ and Redirect to /            │                 │
  │               │                              │                 │
  ╰───────────────╯                              ╰                 ╰
```

## 8. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                          │
└─────────────────────────────────────────────────────────────────┘

ERROR SCENARIO 1: Invalid Google Credential
   └─ Backend returns 401
      └─ Frontend catches error
         └─ Set errorMessage
         └─ Display error alert on login page
         └─ User can retry by clicking button again

ERROR SCENARIO 2: Failed to Load Players
   └─ Backend returns 5xx or network error
      └─ Modal fetching players
      └─ isLoadingPlayers = false
      └─ Show error message
      └─ Provide retry button
      └─ User can try again

ERROR SCENARIO 3: Failed to Assign Player
   └─ Backend returns 4xx/5xx
      └─ Assigning in progress
      └─ Show error message in modal
      └─ Re-enable selection controls
      └─ User can select different player and retry

ERROR SCENARIO 4: Failed to Unlink Player
   └─ Backend returns error
      └─ Show error alert on profile
      └─ Keep unlink button enabled
      └─ User can try again

ERROR SCENARIO 5: Network Error
   └─ Any API call fails
      └─ Catch in try-catch block
      └─ Display user-friendly error message
      └─ Disable loading states
      └─ Allow retry
```

---

These diagrams illustrate the complete flow of the Google OAuth authentication and player linking system. The architecture is modular, maintainable, and follows Vue 3 + Pinia best practices.
