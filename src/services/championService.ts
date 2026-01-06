import api from "./api";

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
