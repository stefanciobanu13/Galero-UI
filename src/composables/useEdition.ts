import { ref } from "vue";
import { editionService, type Edition } from "../services/editionService";
import { teamService } from "../services/teamService";
import { matchService } from "../services/matchService";
import { goalService } from "../services/goalService";

export function useEditionManagement() {
  const existingEditions = ref<Edition[]>([]);
  const isCreatingNew = ref(false);
  const selectedEditionForView = ref<Edition | null>(null);
  const editionToDelete = ref<Edition | null>(null);
  const showDeleteDialog = ref(false);
  const isDeleting = ref(false);
  const isInitializing = ref(false);

  const editionForm = ref({
    editionNumber: 1,
    date: "",
  });

  const loadExistingEditions = async () => {
    try {
      const response = await editionService.getAll();
      existingEditions.value = response.data.sort(
        (a: Edition, b: Edition) =>
          (b.editionNumber || 0) - (a.editionNumber || 0)
      );
    } catch (e) {
      console.error("Failed to load editions:", e);
    }
  };

  // ===== CREATE EDITION =====
  const startCreatingNew = () => {
    isCreatingNew.value = true;
    // Store initialization logic would be handled in the component using the store
  };

  // ===== SELECT EDITION FOR VIEW =====
  const selectEdition = async (edition: Edition) => {
    try {
      selectedEditionForView.value = edition;
      // Edition initialization handled via store in component
    } catch (e) {
      console.error("Failed to load edition:", e);
      alert("Failed to load edition");
      selectedEditionForView.value = null;
    }
  };

  // ===== DELETE EDITION =====
  const confirmDeleteEdition = (edition: Edition) => {
    editionToDelete.value = edition;
    showDeleteDialog.value = true;
  };

  const deleteEdition = async () => {
    try {
      if (!editionToDelete.value?.editionId) {
        alert("Invalid edition");
        return;
      }

      isDeleting.value = true;
      await editionService.delete(editionToDelete.value.editionId);

      showDeleteDialog.value = false;
      editionToDelete.value = null;
      await loadExistingEditions();
      alert("Edition deleted successfully");
    } catch (e: any) {
      console.error("Failed to delete edition:", e);
      alert("Failed to delete edition: " + (e.message || "Unknown error"));
    } finally {
      isDeleting.value = false;
    }
  };

  // ===== SAVE EDITION =====
  const saveEdition = async (
    teams: any[],
    matches: any[],
    goals: any[],
    editionNumber: number,
    date: string
  ) => {
    try {
      isInitializing.value = true;

      // Step 1: Create edition in backend
      const editionData = {
        editionNumber,
        date,
      };
      const editionResponse = await editionService.create(editionData);
      const createdEdition = editionResponse.data;

      // Step 2: Create teams in backend with the real edition ID
      const teamIdMap: Record<number, number> = {};
      for (const team of teams) {
        const teamData = {
          editionId: createdEdition.editionId!,
          color: team.color,
          teamColor: team.color,
        };
        const teamResponse = await teamService.create(teamData);
        teamIdMap[team.teamId!] = teamResponse.data.teamId!;
      }

      // Step 3: Create matches in backend
      const matchIdMap: Record<number, number> = {};
      for (const match of matches) {
        const matchData = {
          editionId: createdEdition.editionId!,
          homeTeamId: teamIdMap[match.homeTeamId]!,
          awayTeamId: teamIdMap[match.awayTeamId]!,
          matchNumber: match.matchNumber,
          matchType: match.matchType as "group" | "small_final" | "big_final",
          homeTeamScore: match.homeTeamScore || 0,
          awayTeamScore: match.awayTeamScore || 0,
        };
        const matchResponse = await matchService.create(matchData);
        matchIdMap[match.matchId!] = matchResponse.data.matchId!;
      }

      // Step 4: Create goals in backend
      for (const goal of goals) {
        const goalData = {
          matchId: matchIdMap[goal.matchId]!,
          teamId: teamIdMap[goal.teamId]!,
          playerId: goal.playerId,
          goalType: goal.goalType as "normal" | "penalty" | "own_goal",
        };
        await goalService.create(goalData);
      }

      // Clear saved state after successful save
      try {
        localStorage.removeItem("galero_editions_state");
      } catch (e) {
        console.warn("Failed to clear saved state:", e);
      }

      alert("Edition saved successfully!");
      return true;
    } catch (e: any) {
      console.error("Failed to save edition:", e);
      alert("Failed to save edition: " + (e.message || "Unknown error"));
      return false;
    } finally {
      isInitializing.value = false;
    }
  };

  // ===== NAVIGATION =====
  const goBack = () => {
    // Clear saved state when going back successfully
    try {
      localStorage.removeItem("galero_editions_state");
    } catch (e) {
      console.warn("Failed to clear saved state:", e);
    }

    selectedEditionForView.value = null;
    isCreatingNew.value = false;
  };

  return {
    // State
    existingEditions,
    isCreatingNew,
    selectedEditionForView,
    editionToDelete,
    showDeleteDialog,
    isDeleting,
    isInitializing,
    editionForm,

    // Methods
    loadExistingEditions,
    startCreatingNew,
    selectEdition,
    confirmDeleteEdition,
    deleteEdition,
    saveEdition,
    goBack,
    initializeEdition: async () => {
      // Placeholder - actual logic handled in component
    },
    resetEdition: () => {
      // Placeholder - actual logic handled in component
    },
    onGoalAdded: () => {
      // Placeholder - actual logic handled in component
    },
  };
}
