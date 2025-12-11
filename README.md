# Football Competition Management UI

A modern, responsive Vue 3 + Vite + Vuetify application for managing football competitions with role-based access control.

## Features

- **Google OAuth Integration** - Demo login system with user and admin roles
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Role-Based Access Control** - Different features for admin and regular users
- **Navigation Drawer** - Horizontal navigation that collapses to burger menu on mobile
- **Player Management** - Add, edit, delete, and search players
- **Profile Management** - View and manage user profile
- **Real-time API Integration** - Connected to Spring Boot backend

## Project Structure

```
src/
├── pages/           # Page components (Home, Login, Players, AddPlayer, Profile)
├── components/      # Reusable components
├── stores/          # Pinia stores (auth, player)
├── services/        # API services and axios configuration
├── router/          # Vue Router configuration
├── types/           # TypeScript type definitions
└── App.vue          # Main app component with navigation
```

## Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Running Spring Boot backend on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Configuration

### API Base URL
Update `API_BASE_URL` in `src/services/api.ts` if your backend runs on a different URL:

```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

### CORS
The backend must have CORS enabled. A `CorsConfig.java` has been added to the backend to allow requests from the frontend.

## Pages

### Home
- Landing page with feature overview
- Login button for non-authenticated users

### Login
- Demo login options:
  - Login as User
  - Login as Admin
  - Google Sign-In (placeholder)

### Players
- View all players in a data table
- Search players by first name or last name
- Admin-only features:
  - Edit player information
  - Delete players
- Responsive table view

### Add Player
- Admin-only page for adding new players
- Form validation for player data
- Grade field with range validation (0-10)
- Success/error notifications

### Profile
- View user profile information
- Display user role (User/Admin)
- Logout functionality
- Quick link to players page

## Technologies

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend build tool
- **Vuetify** - Material Design component framework
- **Material Design Icons** - Icon library
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **TypeScript** - Type safety

## Role-Based Access

### User Role
- View all players
- Search players
- View profile
- Logout

### Admin Role
- All user features plus:
- Add new players
- Edit existing players
- Delete players
- Admin menu items in navigation

## API Integration

The application integrates with these Spring Boot endpoints:

- `GET /api/v1/players` - Get all players
- `POST /api/v1/players` - Create new player (admin only)
- `PUT /api/v1/players/{id}` - Update player (admin only)
- `DELETE /api/v1/players/{id}` - Delete player (admin only)
- `GET /api/v1/players/search` - Search players by name

## Development Tips

### Adding New Pages
1. Create a new Vue file in `src/pages/`
2. Add route in `src/router/index.ts`
3. Add navigation item in `src/App.vue`

### Adding New API Calls
1. Create service method in `src/services/api.ts`
2. Add store actions in relevant store (`src/stores/`)
3. Use in components via `const store = useStore()`

### Authentication
- User data is stored in localStorage
- Token stored on login
- Restore from storage on app initialization
- Clear on logout

## Mobile Optimization

- Burger menu on mobile devices
- Responsive grid layout
- Touch-friendly button sizes
- Optimized data tables for mobile viewing

## Future Enhancements

- Real Google OAuth integration
- Backend authentication/authorization
- Editions and Teams management
- Matches and Goals tracking
- Tournament brackets visualization
- Player statistics and analytics

## License

MIT
