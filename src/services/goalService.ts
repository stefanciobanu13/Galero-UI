import type { Goal } from "../types";
import api from "./api";

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
