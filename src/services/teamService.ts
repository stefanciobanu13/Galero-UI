import type { Team } from "../types";
import api from "./api";

export const teamService = {
  getAll: () => api.get<Team[]>("/teams"),
  getById: (id: number) => api.get<Team>(`/teams/${id}`),
  create: (team: Team) => api.post<Team>("/teams", team),
  update: (id: number, team: Team) => api.put<Team>(`/teams/${id}`, team),
  delete: (id: number) => api.delete(`/teams/${id}`),
  getByEdition: (editionId: number) =>
    api.get<Team[]>(`/teams/edition/${editionId}`),
};
