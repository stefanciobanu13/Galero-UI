import { ref, computed } from "vue";
import { goalService } from "../services/goalService";
import { playerService } from "../services/playerService";
import { editionService } from "../services/editionService";
import type { Player } from "../types";

export interface PlayerStatDetail {
  matchesPlayed: number;
  goalsScored: number;
  attendanceRate: number;
  consistencyScore: number;
  sportsmanshipRating: number;
  editionWins: number;
  totalEditions: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  fourthPlace: number;
  suggestedGrade: number;
}

export function usePlayerStatsDetail(
  player: Readonly<{ value: Player | null }>
) {
  const stats = ref<PlayerStatDetail>({
    matchesPlayed: 0,
    goalsScored: 0,
    attendanceRate: 0,
    consistencyScore: 0,
    sportsmanshipRating: 0,
    editionWins: 0,
    totalEditions: 0,
    firstPlace: 0,
    secondPlace: 0,
    thirdPlace: 0,
    fourthPlace: 0,
    suggestedGrade: 0,
  });

  const isLoading = ref(false);

  const loadPlayerStats = async () => {
    if (!player.value?.playerId) return;

    isLoading.value = true;
    try {
      // Fetch in parallel - goals, placement stats, and total editions
      const [goalsResponse, placementResponse, editionsResponse] =
        await Promise.all([
          goalService.getPlayerGoalCount(player.value.playerId),
          playerService.getPlacementStats(player.value.playerId),
          editionService.getAll(),
        ]);

      // Calculate attendance rate and other metrics from available data
      const placementData = placementResponse.data;
      const firstPlace = placementData?.firstPlaceCount || 0;
      const secondPlace = placementData?.secondPlaceCount || 0;
      const thirdPlace = placementData?.thirdPlaceCount || 0;
      const fourthPlace = placementData?.fourthPlaceCount || 0;
      const totalPlacements =
        firstPlace + secondPlace + thirdPlace + fourthPlace;
      const editionsParticipated = placementData?.editionsPlayedCount || 0;

      // Get total editions in system for seniority calculation
      const totalEditionsInSystem = editionsResponse.data?.length || 1;

      // Goals metrics
      const goalsScored = goalsResponse.data?.goalCount || 0;
      const goalsPerEdition =
        editionsParticipated > 0 ? goalsScored / editionsParticipated : 0;
      // Normalize goals (0-100): max expected ~1 goal per edition
      const goalsScore = Math.min(100, (goalsPerEdition / 1) * 100);

      // Calculate realistic metrics based on placement statistics
      const winRate =
        totalPlacements > 0 ? (firstPlace / totalPlacements) * 100 : 0;
      const podiumRate =
        totalPlacements > 0
          ? ((firstPlace + secondPlace) / totalPlacements) * 100
          : 0;
      const attendanceRate =
        editionsParticipated > 0
          ? (totalPlacements / totalEditionsInSystem) * 100
          : 0;

      // Seniority factor - more editions = more data reliability (0-100)
      // Encourages giving credit to experienced players
      const seniorityFactor = Math.min(
        100,
        (editionsParticipated / totalEditionsInSystem) * 100
      );

      // Consistency score: 35% win rate + 35% podium rate + 20% attendance + 10% seniority
      const consistencyScore = Math.round(
        winRate * 0.35 +
          podiumRate * 0.35 +
          attendanceRate * 0.2 +
          seniorityFactor * 0.1
      );

      // Sportsmanship based on how balanced performances are (not too many 4th places)
      const fourthPlaceRatio =
        totalPlacements > 0 ? (fourthPlace / totalPlacements) * 100 : 0;
      const sportsmanshipRating = Math.max(
        70,
        Math.round(100 - fourthPlaceRatio * 0.3)
      );

      // Calculate suggested grade (0-10 scale)
      // Formula: Consistency (20%) + Sportsmanship (30%) + Win Rate (30%) + Goals (10%) + Seniority (5%)
      const suggestedGrade =
        Math.round(
          ((consistencyScore * 0.2 +
            sportsmanshipRating * 0.3 +
            winRate * 0.2 +
            goalsScore * 0.2 +
            seniorityFactor * 0.1) /
            100) *
            10 *
            10
        ) / 10;

      stats.value = {
        matchesPlayed: Math.max(totalPlacements, 1),
        goalsScored: goalsScored,
        attendanceRate: Math.round(attendanceRate),
        consistencyScore: consistencyScore,
        sportsmanshipRating: sportsmanshipRating,
        editionWins: firstPlace,
        totalEditions: editionsParticipated,
        firstPlace: firstPlace,
        secondPlace: secondPlace,
        thirdPlace: thirdPlace,
        fourthPlace: fourthPlace,
        suggestedGrade: suggestedGrade,
      };
    } catch (error) {
      console.error("Failed to load player stats:", error);
      // Reset to defaults on error
      stats.value = {
        matchesPlayed: 0,
        goalsScored: 0,
        attendanceRate: 0,
        consistencyScore: 0,
        sportsmanshipRating: 0,
        editionWins: 0,
        totalEditions: 0,
        firstPlace: 0,
        secondPlace: 0,
        thirdPlace: 0,
        fourthPlace: 0,
        suggestedGrade: 0,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const goalsPerMatch = computed(() => {
    if (stats.value.matchesPlayed === 0) return 0;
    return (stats.value.goalsScored / stats.value.matchesPlayed).toFixed(2);
  });

  const totalPodiums = computed(() => {
    return (
      stats.value.firstPlace +
      stats.value.secondPlace +
      stats.value.thirdPlace +
      stats.value.fourthPlace
    );
  });

  return {
    stats,
    isLoading,
    goalsPerMatch,
    totalPodiums,
    loadPlayerStats,
  };
}
