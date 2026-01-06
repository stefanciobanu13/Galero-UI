import { ref } from "vue";
import { playerService } from "../services/playerService";
import type { User } from "../types";

export interface EditionHistoryRecord {
  editionId: number;
  editionNumber: number;
  date: string;
  placement: number;
  finalType: "big_final" | "small_final" | null;
  opponentColor: string;
  playerTeamScore: number;
  opponentScore: number;
}

export function usePlayerHistory(user: Readonly<User | undefined>) {
  // ===== STATE =====
  const editionHistory = ref<EditionHistoryRecord[]>([]);
  const isLoadingHistory = ref(false);

  // ===== DATA LOADING =====
  const loadEditionHistory = async () => {
    if (!user?.playerId) {
      editionHistory.value = [];
      return;
    }

    isLoadingHistory.value = true;
    try {
      const response = await playerService.getEditionHistory(
        user.playerId,
        1000
      );
      editionHistory.value = response.data;
    } catch (error) {
      console.error("Failed to load edition history:", error);
      editionHistory.value = [];
    } finally {
      isLoadingHistory.value = false;
    }
  };

  return {
    // State
    editionHistory,
    isLoadingHistory,
    // Methods
    loadEditionHistory,
  } as const;
}
