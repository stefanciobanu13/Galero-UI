import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { TEAM_COLORS, type TeamColor } from "../utils/teamColorUtils";
import { teamPlayerService } from "../services/teamPlayerService";
import { teamService } from "../services/teamService";
import type { Player } from "./usePlayer";

export interface AttendancePlayer extends Player {
  status?: "inscris" | "retras" | "rezerva";
}

export function useTeamCreation() {
  const router = useRouter();

  const showTeamCreationDialog = ref(false);
  const createdEditionNumber = ref<number | null>(null);
  const createdEditionId = ref<number | null>(null);
  const isSavingTeams = ref(false);
  const draggedPlayer = ref<AttendancePlayer | null>(null);
  const errorMessage = ref("");
  const successMessage = ref("");

  const teams = ref<Record<TeamColor, AttendancePlayer[]>>({
    verde: [],
    portocaliu: [],
    gri: [],
    albastru: [],
  });

  const unassignedPlayers = computed(() => {
    const assignedIds = new Set<number>();
    TEAM_COLORS.forEach((color) => {
      teams.value[color].forEach((player) => {
        assignedIds.add(player.playerId!);
      });
    });
    // Must be passed from outside - used by parent
    return [] as AttendancePlayer[];
  });

  const areAllPlayersAssigned = computed(() => {
    return (
      unassignedPlayers.value.length === 0 &&
      Object.values(teams.value).flat().length > 0
    );
  });

  const getTeamPlayers = (color: string) => {
    return teams.value[color as TeamColor] || [];
  };

  const selectPlayerForTeam = (player: AttendancePlayer) => {
    for (const color of TEAM_COLORS) {
      const teamPlayers = teams.value[color];
      if (
        teamPlayers &&
        !teamPlayers.find((p) => p.playerId === player.playerId)
      ) {
        teamPlayers.push(player);
        return;
      }
    }
  };

  const assignPlayerToTeam = (teamColor: string) => {
    if (draggedPlayer.value) {
      const teamPlayers = teams.value[teamColor as TeamColor];
      if (
        teamPlayers &&
        !teamPlayers.find((p) => p.playerId === draggedPlayer.value!.playerId)
      ) {
        teamPlayers.push(draggedPlayer.value);
        draggedPlayer.value = null;
      }
    }
  };

  const removePlayerFromTeam = (
    teamColor: string,
    playerId: number | undefined
  ) => {
    if (playerId !== undefined) {
      const teamPlayers = teams.value[teamColor as TeamColor];
      if (teamPlayers) {
        teams.value[teamColor as TeamColor] = teamPlayers.filter(
          (p) => p.playerId !== playerId
        );
      }
    }
  };

  const resetTeams = () => {
    TEAM_COLORS.forEach((color) => {
      teams.value[color] = [];
    });
  };

  const cancelTeamCreation = () => {
    if (
      confirm(
        "Are you sure you want to cancel team creation? You will need to restart the attendance process."
      )
    ) {
      showTeamCreationDialog.value = false;
      resetTeams();
      createdEditionNumber.value = null;
      createdEditionId.value = null;
    }
  };

  const getTeamColor = (color: TeamColor): string => {
    const colorMap: Record<TeamColor, string> = {
      verde: "#4CAF50",
      portocaliu: "#FF9800",
      gri: "#9E9E9E",
      albastru: "#2196F3",
    };
    return colorMap[color];
  };

  const saveTeams = async () => {
    if (!createdEditionId.value) {
      errorMessage.value = "Edition ID not found. Please try again.";
      return;
    }

    isSavingTeams.value = true;
    try {
      errorMessage.value = "";

      const teamIdMap: Record<TeamColor, number> = {} as Record<
        TeamColor,
        number
      >;

      for (const color of TEAM_COLORS) {
        const teamResponse = await teamService.create({
          editionId: createdEditionId.value,
          color: color,
        });
        teamIdMap[color] = teamResponse.data.teamId!;
      }

      for (const color of TEAM_COLORS) {
        const teamId = teamIdMap[color];
        const teamPlayers = teams.value[color];
        if (teamPlayers && teamId) {
          for (const player of teamPlayers) {
            if (player.playerId) {
              await teamPlayerService.addPlayerToTeam(teamId, player.playerId);
            }
          }
        }
      }

      successMessage.value = "Teams created successfully! Redirecting...";
      setTimeout(() => {
        showTeamCreationDialog.value = false;
        resetTeams();
        createdEditionNumber.value = null;
        createdEditionId.value = null;
        router.push("/editions");
      }, 2000);
    } catch (error) {
      console.error("Failed to save teams:", error);
      errorMessage.value =
        error instanceof Error
          ? `Failed to save teams: ${error.message}`
          : "Failed to save teams. Please try again.";
    } finally {
      isSavingTeams.value = false;
    }
  };

  return {
    showTeamCreationDialog,
    createdEditionNumber,
    createdEditionId,
    isSavingTeams,
    draggedPlayer,
    errorMessage,
    successMessage,
    teams,
    teamColors: TEAM_COLORS,
    getTeamColor,
    unassignedPlayers,
    areAllPlayersAssigned,
    TEAM_COLORS,
    getTeamPlayers,
    selectPlayerForTeam,
    assignPlayerToTeam,
    removePlayerFromTeam,
    resetTeams,
    cancelTeamCreation,
    saveTeams,
  };
}
