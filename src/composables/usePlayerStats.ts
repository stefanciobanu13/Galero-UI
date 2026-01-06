import { ref, computed } from "vue";
import { playerService } from "../services/playerService";
import { goalService } from "../services/goalService";
import { championsService } from "../services/championService";
import type { User } from "../types";

export function usePlayerStats(user: Readonly<User | undefined>) {
  // ===== STATE =====
  const playerGoalCount = ref<number>(0);
  const isLoadingGoals = ref(false);
  const playerWinsCount = ref<number>(0);
  const playerEditionsCount = ref<number>(0);
  const isLoadingStats = ref(false);
  const firstPlaceCount = ref<number>(0);
  const secondPlaceCount = ref<number>(0);
  const thirdPlaceCount = ref<number>(0);
  const fourthPlaceCount = ref<number>(0);
  const isLoadingPlacementStats = ref(false);

  // ===== DATA LOADING =====
  const loadPlayerGoals = async () => {
    if (!user?.playerId) return;

    isLoadingGoals.value = true;
    try {
      const response = await goalService.getPlayerGoalCount(user.playerId);
      playerGoalCount.value = response.data.goalCount;
    } catch (error) {
      console.error("Failed to load player goals:", error);
      playerGoalCount.value = 0;
    } finally {
      isLoadingGoals.value = false;
    }
  };

  const loadPlayerStats = async () => {
    if (!user?.playerId) return;

    isLoadingStats.value = true;
    try {
      const response = await championsService.getTopEditionWinners(1000);
      const playerStats = response.data.find(
        (p: any) => p.playerId === user.playerId
      );
      if (playerStats) {
        playerWinsCount.value = playerStats.editionWinsCount;
        playerEditionsCount.value = playerStats.editionsPlayedCount;
      } else {
        playerWinsCount.value = 0;
        playerEditionsCount.value = 0;
      }
    } catch (error) {
      console.error("Failed to load player stats:", error);
      playerWinsCount.value = 0;
      playerEditionsCount.value = 0;
    } finally {
      isLoadingStats.value = false;
    }
  };

  const loadPlacementStats = async () => {
    if (!user?.playerId) return;

    isLoadingPlacementStats.value = true;
    try {
      const response = await playerService.getPlacementStats(user.playerId);
      firstPlaceCount.value = response.data.firstPlaceCount;
      secondPlaceCount.value = response.data.secondPlaceCount;
      thirdPlaceCount.value = response.data.thirdPlaceCount;
      fourthPlaceCount.value = response.data.fourthPlaceCount;
    } catch (error) {
      console.error("Failed to load placement stats:", error);
      firstPlaceCount.value = 0;
      secondPlaceCount.value = 0;
      thirdPlaceCount.value = 0;
      fourthPlaceCount.value = 0;
    } finally {
      isLoadingPlacementStats.value = false;
    }
  };

  const loadAllStats = async () => {
    await Promise.all([
      loadPlayerGoals(),
      loadPlayerStats(),
      loadPlacementStats(),
    ]);
  };

  // ===== COMPUTED =====
  const isLoadingAny = computed(
    () =>
      isLoadingGoals.value ||
      isLoadingStats.value ||
      isLoadingPlacementStats.value
  );

  return {
    // State
    playerGoalCount,
    isLoadingGoals,
    playerWinsCount,
    playerEditionsCount,
    isLoadingStats,
    firstPlaceCount,
    secondPlaceCount,
    thirdPlaceCount,
    fourthPlaceCount,
    isLoadingPlacementStats,
    isLoadingAny,
    // Methods
    loadPlayerGoals,
    loadPlayerStats,
    loadPlacementStats,
    loadAllStats,
  } as const;
}
