import { computed } from "vue";
import type { Goal } from "../services/goalService";
import type { Player } from "../services/playerService";

export interface TopScorer {
  playerId: number;
  playerName: string;
  goalCount: number;
  goalCountInFinals: number;
}

export function useEditionStats(
  goals: Goal[],
  matches: any[],
  players: Player[]
) {
  // ===== COMPUTED =====
  const topScorers = computed(() => {
    // Group goals by player and count them
    const scorerMap: Record<number, TopScorer> = {};

    goals.forEach((goal) => {
      if (!scorerMap[goal.playerId]) {
        // Find player name from players array
        const player = players.find((p) => p.playerId === goal.playerId);
        scorerMap[goal.playerId] = {
          playerId: goal.playerId,
          playerName: player
            ? `${player.firstName} ${player.lastName}`
            : "Unknown",
          goalCount: 0,
          goalCountInFinals: 0,
        };
      }
      const scorer = scorerMap[goal.playerId];
      if (scorer) {
        scorer.goalCount++;

        // Check if this goal was scored in a final match
        const match = matches.find((m) => m.matchId === goal.matchId);
        if (
          match &&
          (match.matchType === "small_final" || match.matchType === "big_final")
        ) {
          scorer.goalCountInFinals++;
        }
      }
    });

    // Convert to array, sort by goal count (descending), then by goals in finals (descending), and return top 10
    return Object.values(scorerMap)
      .sort((a, b) => {
        if (b.goalCount !== a.goalCount) {
          return b.goalCount - a.goalCount;
        }
        // Tiebreaker: goals in finals
        return b.goalCountInFinals - a.goalCountInFinals;
      })
      .slice(0, 10);
  });

  return {
    // Computed
    topScorers,
  };
}
