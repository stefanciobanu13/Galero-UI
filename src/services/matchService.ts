import type { Match } from "../types";
import api from "./api";

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
