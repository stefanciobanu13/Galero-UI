import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Player } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const playerService = {
  getAll: () => api.get<Player[]>('/players'),
  getById: (id: number) => api.get<Player>(`/players/${id}`),
  create: (player: Player) => api.post<Player>('/players', player),
  update: (id: number, player: Player) => api.put<Player>(`/players/${id}`, player),
  delete: (id: number) => api.delete(`/players/${id}`),
  searchByName: (firstName: string, lastName: string) => 
    api.get<Player[]>('/players/search', {
      params: { firstName, lastName }
    }),
};

export const authService = {
  loginWithGoogle: (credential: string) => {
    // Store the credential - in a real app, you'd validate this with your backend
    localStorage.setItem('authToken', credential);
    localStorage.setItem('userRole', 'user');
    return Promise.resolve({
      token: credential,
      user: {
        email: 'user@example.com',
        name: 'User Name',
        picture: '',
        isAdmin: false,
      }
    });
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  },

  setAdminRole: () => {
    localStorage.setItem('userRole', 'admin');
  },

  isAdmin: () => {
    return localStorage.getItem('userRole') === 'admin';
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('authToken');
  }
};

export default api;
