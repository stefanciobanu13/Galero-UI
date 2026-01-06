import axios from "axios";
import type { AxiosInstance } from "axios";
import { playerService } from "./playerService";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/api/v1"
    : "/api/v1"; // Aceasta va deveni https://galero.cezarovici.dev/api/v1

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  loginWithGoogle: (credential: string) => {
    // Send the Google credential JWT to the backend for validation
    // Backend will decode the credential and return user profile with all fields
    return api.post("/users/google/login", { credential }).catch((error) => {
      console.error(
        "Login error response:",
        error.response?.data || error.message
      );
      throw error;
    });
  },

  getPlayerById: (playerId: number) => {
    return playerService.getById(playerId);
  },

  assignPlayerToUser: (userId: number, playerId: number) => {
    return api.post(`/users/${userId}/assign-player/${playerId}`);
  },

  unassignPlayerFromUser: (userId: number) => {
    return api.post(`/users/${userId}/unassign-player`);
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
  },

  setAdminRole: () => {
    localStorage.setItem("userRole", "admin");
  },

  isAdmin: () => {
    return localStorage.getItem("userRole") === "admin";
  },

  isLoggedIn: () => {
    return !!localStorage.getItem("authToken");
  },
};

export default api;
