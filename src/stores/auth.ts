import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../types';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoggedIn = ref(false);
  const isAdmin = ref(false);
  const needsPlayerSelection = ref(false);

  const login = (googleUser: any) => {
    user.value = {
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      isAdmin: isAdmin.value,
      googleId: googleUser.googleId,
      userId: googleUser.userId,
    };
    isLoggedIn.value = true;
    localStorage.setItem('user', JSON.stringify(user.value));
    localStorage.setItem('isLoggedIn', 'true');
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await authService.loginWithGoogle(credential);
      const userData = response.data;
      
      // Handle name - if firstName/lastName are null, use email or a default
      const firstName = userData.firstName || 'User';
      const lastName = userData.lastName || '';
      const name = `${firstName} ${lastName}`.trim() || userData.email;
      
      user.value = {
        userId: userData.userId,
        email: userData.email,
        name: name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        picture: userData.profilePictureUrl || 'https://cdn.vuetifyjs.com/images/avatars/1.jpg',
        profilePictureUrl: userData.profilePictureUrl,
        googleId: userData.googleId,
        playerId: userData.playerId,
        role: userData.role,
        isAdmin: userData.role === 'admin',
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
      
      isLoggedIn.value = true;
      needsPlayerSelection.value = !userData.playerId;
      
      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authToken', credential);
      
      return { success: true, needsPlayerSelection: !userData.playerId };
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const assignPlayer = async (playerId: number) => {
    if (!user.value?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const response = await authService.assignPlayerToUser(user.value.userId, playerId);
      const userData = response.data;
      
      // Fetch the player details to get their name
      const playerResponse = await authService.getPlayerById(playerId);
      const playerData = playerResponse.data;
      
      user.value = {
        ...user.value,
        playerId: userData.playerId,
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        name: `${playerData.firstName} ${playerData.lastName}`,
        updatedAt: userData.updatedAt,
      };
      
      needsPlayerSelection.value = false;
      localStorage.setItem('user', JSON.stringify(user.value));
      
      return userData;
    } catch (error) {
      console.error('Failed to assign player:', error);
      throw error;
    }
  };

  const unassignPlayer = async () => {
    if (!user.value?.userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      await authService.unassignPlayerFromUser(user.value.userId);
      
      user.value = {
        ...user.value,
        playerId: undefined,
      };
      
      needsPlayerSelection.value = true;
      localStorage.setItem('user', JSON.stringify(user.value));
    } catch (error) {
      console.error('Failed to unassign player:', error);
      throw error;
    }
  };

  const logout = () => {
    user.value = null;
    isLoggedIn.value = false;
    isAdmin.value = false;
    needsPlayerSelection.value = false;
    authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
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
      needsPlayerSelection.value = !user.value.playerId;
    }
  };

  return {
    user,
    isLoggedIn,
    isAdmin,
    needsPlayerSelection,
    login,
    loginWithGoogle,
    assignPlayer,
    unassignPlayer,
    logout,
    setAdmin,
    restoreFromStorage,
  };
});
