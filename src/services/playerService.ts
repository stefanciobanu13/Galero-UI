import type { Player } from "../types";
import api from "./api";

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
    api.get<
      Array<{
        editionId: number;
        editionNumber: number;
        date: string;
        placement: number;
        finalType: "big_final" | "small_final" | null;
        opponentColor: string;
        playerTeamScore: number;
        opponentScore: number;
      }>
    >(`/players/${playerId}/history`, {
      params: { limit },
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
