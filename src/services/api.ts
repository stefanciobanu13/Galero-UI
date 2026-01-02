import axios from "axios";
import type { AxiosInstance } from "axios";
import type {
  Player,
  Edition,
  Team,
  Match,
  Goal,
  Attendance,
  TeamPlayer,
} from "../types";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:4444/api/v1"
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

export const playerService = {
  getAll: () => api.get<Player[]>("/players"),
  getById: (id: number) => api.get<Player>(`/players/${id}`),
  create: (player: Player) => api.post<Player>("/players", player),
  update: (id: number, player: Player) =>
    api.put<Player>(`/players/${id}`, player),
  delete: (id: number) => api.delete(`/players/${id}`),
  searchByName: (firstName: string, lastName: string) =>
    api.get<Player>("/players/name", {
      params: { firstName, lastName },
    }),
  getEditionHistory: (playerId: number, limit: number) =>
    api.get<Array<{
      editionId: number;
      editionNumber: number;
      date: string;
      placement: number;
      finalType: 'big_final' | 'small_final' | null;
      opponentColor: string;
      playerTeamScore: number;
      opponentScore: number;
    }>>(`/players/${playerId}/history`, {
      params: { limit }
    }),
  getPlacementStats: (playerId: number) =>
    api.get<{
      playerId: number;
      firstName: string;
      lastName: string;
      grade: number;
      firstPlaceCount: number;
      secondPlaceCount: number;
      thirdPlaceCount: number;
      fourthPlaceCount: number;
      editionsPlayedCount: number;
    }>(`/players/${playerId}/placement-stats`),
};

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

export const attendanceService = {
  getAttendanceByDate: (date: string) => {
    return api.get(`/attendance/edition/${date}`);
  },

  getAttendanceByEdition: (editionId: number) => {
    return api.get(`/attendance/edition/${editionId}`);
  },

  getAttendanceById: (attendanceId: number) => {
    return api.get(`/attendance/${attendanceId}`);
  },

  submitAttendance: (attendanceData: any) => {
    return api.post("/attendance", attendanceData);
  },

  updateAttendance: (attendanceId: number, attendanceData: any) => {
    return api.put(`/attendance/${attendanceId}`, attendanceData);
  },

  deleteAttendance: (attendanceId: number) => {
    return api.delete(`/attendance/${attendanceId}`);
  },

  getAllAttendances: () => {
    return api.get("/attendance");
  },

  getAttendanceByEdition: (editionId: number) => {
    return api.get<Attendance[]>(`/attendance/edition/${editionId}`);
  },
};

export const editionService = {
  getAll: () => api.get<Edition[]>("/editions"),
  getById: (id: number) => api.get<Edition>(`/editions/${id}`),
  getFull: (id: number) => api.get<any>(`/editions/${id}/full`),
  create: (edition: Edition) => api.post<Edition>("/editions", edition),
  update: (id: number, edition: Edition) =>
    api.put<Edition>(`/editions/${id}`, edition),
  delete: (id: number) => api.delete(`/editions/${id}`),
  getByNumber: (number: number) =>
    api.get<Edition>(`/editions/number/${number}`),
};

export const teamService = {
  getAll: () => api.get<Team[]>("/teams"),
  getById: (id: number) => api.get<Team>(`/teams/${id}`),
  create: (team: Team) => api.post<Team>("/teams", team),
  update: (id: number, team: Team) => api.put<Team>(`/teams/${id}`, team),
  delete: (id: number) => api.delete(`/teams/${id}`),
  getByEdition: (editionId: number) =>
    api.get<Team[]>(`/teams/edition/${editionId}`),
};

export const teamPlayerService = {
  getAll: () => api.get<TeamPlayer[]>("/team-players"),
  addPlayerToTeam: (teamId: number, playerId: number) =>
    api.post<TeamPlayer>("/team-players", { teamId, playerId }),
  getPlayersByTeam: (teamId: number) =>
    api.get<TeamPlayer[]>(`/team-players/team/${teamId}`),
  removePlayerFromTeam: (teamId: number, playerId: number) =>
    api.delete(`/team-players/${teamId}/${playerId}`),
};

export const matchService = {
  getAll: () => api.get<Match[]>("/matches"),
  getById: (id: number) => api.get<Match>(`/matches/${id}`),
  create: (match: Match) => api.post<Match>("/matches", match),
  update: (id: number, match: Match) => api.put<Match>(`/matches/${id}`, match),
  delete: (id: number) => api.delete(`/matches/${id}`),
  getByEdition: (editionId: number) =>
    api.get<Match[]>(`/matches/edition/${editionId}`),
  getByTeam: (teamId: number) => api.get<Match[]>(`/matches/team/${teamId}`),
  getByType: (matchType: string) =>
    api.get<Match[]>(`/matches/type/${matchType}`),
};

export const goalService = {
  getAll: () => api.get<Goal[]>("/goals"),
  getById: (id: number) => api.get<Goal>(`/goals/${id}`),
  create: (goal: Goal) => api.post<Goal>("/goals", goal),
  update: (id: number, goal: Goal) => api.put<Goal>(`/goals/${id}`, goal),
  delete: (id: number) => api.delete(`/goals/${id}`),
  getByMatch: (matchId: number) => api.get<Goal[]>(`/goals/match/${matchId}`),
  getByTeam: (teamId: number) => api.get<Goal[]>(`/goals/team/${teamId}`),
  getByPlayer: (playerId: number) =>
    api.get<Goal[]>(`/goals/player/${playerId}`),
  getByType: (goalType: string) => api.get<Goal[]>(`/goals/type/${goalType}`),
  getPlayerGoalCount: (playerId: number) =>
    api.get<{
      playerId: number;
      firstName: string;
      lastName: string;
      goalCount: number;
    }>(`/goals/player/${playerId}/count`),
};

export const championsService = {
  getTopEditionWinners: (limit: number = 10) =>
    api.get<
      Array<{
        playerId: number;
        firstName: string;
        lastName: string;
        grade: number;
        editionWinsCount: number;
        editionsPlayedCount: number;
      }>
    >("/champions/edition-winners", {
      params: { limit },
    }),

  getAllTimeTopScorers: (limit: number = 10) =>
    api.get<
      Array<{
        playerId: number;
        firstName: string;
        lastName: string;
        totalGoals: number;
      }>
    >("/champions/all-time-scorers", {
      params: { limit },
    }),
};

export default api;
