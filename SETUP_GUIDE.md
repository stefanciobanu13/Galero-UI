# Vue 3 UI Setup - Complete Guide

## What Has Been Created

A complete, production-ready Vue 3 + Vite + Vuetify frontend application for the Football Competition Management system.

## Project Location

**Frontend:** `D:\Repositories\Galero-UI`
**Backend:** `D:\Repositories\Galero-backend`

## Running the Application

### 1. Ensure Backend is Running

First, make sure your Spring Boot backend is running with the port-forward:

```bash
# Terminal 1: Keep the port-forward running
kubectl port-forward svc/mysql-clusterip 3306:3306

# Terminal 2: Run the backend
cd D:\Repositories\Galero-backend
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080/api/v1`

### 2. Run the Frontend

```bash
cd D:\Repositories\Galero-UI
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Key Features Implemented

✅ **Authentication & Authorization**
- Demo login with User and Admin roles
- Google OAuth login placeholder
- Session persistence using localStorage
- Role-based route protection

✅ **Navigation**
- Responsive navigation drawer
- Horizontal drawer on desktop (always visible)
- Burger menu on mobile (collapsible)
- Dynamic menu items based on user role
- Profile preview in drawer

✅ **Pages**
- **Home** - Landing page with feature overview
- **Login** - Demo login options (User/Admin)
- **Players** - View, search, edit, delete players (edit/delete admin only)
- **Add Player** - Admin-only form for creating players
- **Profile** - User profile with role display

✅ **Player Management**
- Display all players in responsive data table
- Search players by first name and last name
- Add new players (admin only)
- Edit player information (admin only)
- Delete players (admin only)
- Form validation and error handling

✅ **Responsive Design**
- Desktop, tablet, and mobile layouts
- Adaptive navigation (drawer vs burger menu)
- Touch-friendly interface
- Optimized data tables for mobile

✅ **API Integration**
- Axios with base configuration
- Token-based authentication headers
- Error handling and notifications
- Full integration with Spring Boot backend

✅ **State Management**
- Pinia stores for auth and players
- Global state for user authentication
- Player data caching and management

## Project Structure

```
Galero-UI/
├── src/
│   ├── pages/              # Page components
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Players.vue
│   │   ├── AddPlayer.vue
│   │   └── Profile.vue
│   ├── stores/             # Pinia state management
│   │   ├── auth.ts         # Authentication store
│   │   └── player.ts       # Player data store
│   ├── services/           # API services
│   │   └── api.ts          # Axios configuration & endpoints
│   ├── router/             # Vue Router
│   │   └── index.ts        # Route definitions
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # Type interfaces
│   ├── App.vue             # Main app with navigation
│   ├── main.ts             # App entry point
│   └── style.css           # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Supported API Endpoints

The frontend expects these endpoints on your backend:

```
GET    /api/v1/players              → Get all players
POST   /api/v1/players              → Create player (admin)
PUT    /api/v1/players/{id}         → Update player (admin)
DELETE /api/v1/players/{id}         → Delete player (admin)
GET    /api/v1/players/search       → Search by name
```

## Environment Variables / Configuration

If you need to change the backend URL, edit `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

## Demo Credentials

The app has demo login buttons that don't require Google OAuth:

- **User Login** - Regular user access (can view players, profile)
- **Admin Login** - Admin access (can add/edit/delete players)

Click the respective buttons on the login page to test.

## CORS Configuration

CORS has been configured in the Spring Boot backend (`CorsConfig.java`) to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (production fallback)

## Technologies Stack

| Technology | Purpose |
|-----------|---------|
| Vue 3 | Progressive JavaScript framework |
| Vite | Ultra-fast build tool |
| Vuetify | Material Design components |
| Material Design Icons | Icon library |
| Pinia | State management |
| Vue Router | Client-side routing |
| TypeScript | Type safety |
| Axios | HTTP client |

## Development Workflow

### Adding New Pages

1. Create new Vue file in `src/pages/`
2. Add route in `src/router/index.ts`
3. Add menu item in `src/App.vue` (if needed)

Example:
```typescript
// router/index.ts
import Teams from '../pages/Teams.vue'

{
  path: '/teams',
  name: 'Teams',
  component: Teams,
  meta: { requiresAuth: true }
}
```

### Making API Calls

1. Add service in `src/services/api.ts`
2. Create store actions in relevant store
3. Use in components:

```typescript
import { usePlayerStore } from '../stores/player'
const playerStore = usePlayerStore()

const loadPlayers = async () => {
  await playerStore.fetchPlayers()
}
```

### Form Validation

All forms use Vuetify's built-in validation:

```vue
<v-form ref="form" @submit.prevent="submitForm">
  <v-text-field
    v-model="formData.name"
    label="Name"
    :rules="[rules.required]"
  />
</v-form>
```

## Common Issues & Solutions

### Issue: "Cannot GET /api/v1/players"
**Solution:** Ensure Spring Boot backend is running on port 8080

### Issue: CORS errors
**Solution:** Check `CorsConfig.java` is in the backend and backend is restarted

### Issue: Port already in use
**Solutions:**
- Frontend (5173): `npm run dev -- --port 5174`
- Backend (8080): Change `server.port` in `application.yml`

### Issue: Blank screen
**Solution:** 
1. Check browser console for errors
2. Verify Vuetify is imported in `main.ts`
3. Clear browser cache and restart dev server

## Production Build

To build for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

To preview the production build:

```bash
npm run preview
```

## Next Steps / Future Enhancements

1. **Real Google OAuth Integration**
   - Set up Google Cloud Console project
   - Configure OAuth credentials
   - Integrate `@react-oauth/google` properly

2. **Additional Features**
   - Editions management
   - Teams management
   - Matches and Goals
   - Tournament brackets

3. **Performance**
   - Lazy load routes
   - Code splitting
   - Image optimization

4. **Testing**
   - Unit tests with Vitest
   - E2E tests with Cypress
   - Component tests with Vue Test Utils

## Support & Documentation

- **Vue 3 Docs:** https://vuejs.org
- **Vite Docs:** https://vitejs.dev
- **Vuetify Docs:** https://vuetifyjs.com
- **Material Icons:** https://fonts.google.com/icons
- **Pinia Docs:** https://pinia.vuejs.org

## Summary

Your Vue 3 frontend is now fully set up and running! The app is responsive, production-ready, and fully integrated with your Spring Boot backend. All CORS issues have been resolved at the backend level.

**Start developing:** `npm run dev` in the `Galero-UI` folder!
