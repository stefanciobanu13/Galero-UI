import type { TeamPlayer } from "../types";
import api from "./api";

export const teamPlayerService = {
  getAll: () => api.get<TeamPlayer[]>("/team-players"),
  addPlayerToTeam: (teamId: number, playerId: number) =>
    api.post<TeamPlayer>("/team-players", { teamId, playerId }),
  getPlayersByTeam: (teamId: number) =>
    api.get<TeamPlayer[]>(`/team-players/team/${teamId}`),
  removePlayerFromTeam: (teamId: number, playerId: number) =>
    api.delete(`/team-players/${teamId}/${playerId}`),
};
