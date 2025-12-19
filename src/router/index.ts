import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Home from '../pages/Home.vue';
import Players from '../pages/Players.vue';
import Profile from '../pages/Profile.vue';
import Login from '../pages/Login.vue';
import AddPlayer from '../pages/AddPlayer.vue';
import Attendance from '../pages/Attendance.vue';
import Editions from '../pages/Editions.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/players',
    name: 'Players',
    component: Players,
    meta: { requiresAuth: true },
  },
  {
    path: '/add-player',
    name: 'AddPlayer',
    component: AddPlayer,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance,
    meta: { requiresAuth: true },
  },
  {
    path: '/editions',
    name: 'Editions',
    component: Editions,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Restore auth state from storage
  authStore.restoreFromStorage();

  const requiresAuth = to.meta.requiresAuth as boolean;
  const requiresAdmin = to.meta.requiresAdmin as boolean;

  if (requiresAuth && !authStore.isLoggedIn) {
    next('/login');
  } else if (requiresAdmin && !authStore.isAdmin) {
    next('/players');
  } else {
    next();
  }
});

export default router;
