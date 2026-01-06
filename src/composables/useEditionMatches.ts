import { computed } from "vue";
import type { Match, Team } from "../types";

export function useEditionMatches(getMatches: () => Match[]) {
  // ===== COMPUTED PROPERTIES =====
  const regularMatches = computed(() =>
    getMatches().filter((m) => m.matchType === "group")
  );

  const finalMatches = computed(() =>
    getMatches().filter((m) => m.matchType !== "group")
  );

  // ===== HELPERS =====
  const homeTeamName = (match: Match, teams: Team[]): string => {
    const team = teams.find((t) => t.teamId == match.homeTeamId);

    return team ? team.color : "Unknown";
  };

  const awayTeamName = (match: Match, teams: Team[]): string => {
    const team = teams.find((t) => t.teamId === match.awayTeamId);
    return team ? team.color : "Unknown";
  };

  const matchTypeLabel = (match: Match): string => {
    if (match.matchType === "small_final") return "Small Final";
    if (match.matchType === "big_final") return "Big Final";
    return `Match ${match.matchNumber}`;
  };

  return {
    // Computed
    regularMatches,
    finalMatches,

    // Methods
    homeTeamName,
    awayTeamName,
    matchTypeLabel,
  };
}
