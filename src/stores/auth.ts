import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../types';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoggedIn = ref(false);
  const isAdmin = ref(false);

  const login = (googleUser: any) => {
    user.value = {
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      isAdmin: isAdmin.value,
    };
    isLoggedIn.value = true;
    localStorage.setItem('user', JSON.stringify(user.value));
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    user.value = null;
    isLoggedIn.value = false;
    isAdmin.value = false;
    authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  };

  const setAdmin = (admin: boolean) => {
    isAdmin.value = admin;
    if (user.value) {
      user.value.isAdmin = admin;
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  };

  const restoreFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    const storedAdmin = localStorage.getItem('isAdmin');
    
    if (storedUser && storedLoggedIn === 'true') {
      user.value = JSON.parse(storedUser);
      isLoggedIn.value = true;
      isAdmin.value = storedAdmin === 'true';
    }
  };

  return {
    user,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    setAdmin,
    restoreFromStorage,
  };
});
