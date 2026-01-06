import { ref } from "vue";
import { championsService } from "../services/championService";

export interface TopWinner {
  playerId: number;
  firstName: string;
  lastName: string;
  grade: number;
  editionWinsCount: number;
  editionsPlayedCount: number;
}

export interface TopScorer {
  playerId: number;
  firstName: string;
  lastName: string;
  totalGoals: number;
}

export function useChampionStats() {
  // ===== STATE =====
  const topWinners = ref<TopWinner[]>([]);
  const topScorers = ref<TopScorer[]>([]);
  const isLoadingWinners = ref(false);
  const isLoadingScorers = ref(false);

  // ===== DATA LOADING =====
  const loadTopWinners = async (limit: number = 10) => {
    isLoadingWinners.value = true;
    try {
      const response = await championsService.getTopEditionWinners(limit);
      topWinners.value = response.data;
    } catch (error) {
      console.error("Failed to load top winners:", error);
      topWinners.value = [];
    } finally {
      isLoadingWinners.value = false;
    }
  };

  const loadTopScorers = async (limit: number = 10) => {
    isLoadingScorers.value = true;
    try {
      const response = await championsService.getAllTimeTopScorers(limit);
      topScorers.value = response.data;
    } catch (error) {
      console.error("Failed to load top scorers:", error);
      topScorers.value = [];
    } finally {
      isLoadingScorers.value = false;
    }
  };

  const loadAllChampionData = async (limit: number = 10) => {
    await Promise.all([loadTopWinners(limit), loadTopScorers(limit)]);
  };

  return {
    // State
    topWinners,
    topScorers,
    isLoadingWinners,
    isLoadingScorers,
    // Methods
    loadTopWinners,
    loadTopScorers,
    loadAllChampionData,
  } as const;
}
