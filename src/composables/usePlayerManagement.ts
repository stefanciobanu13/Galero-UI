import { ref, computed, watch } from "vue";
import { usePlayerStore } from "../hooks/usePlayer";
import type { Player } from "../services/playerService";

export function usePlayerManagement() {
  const playerStore = usePlayerStore();

  // ===== STATE =====
  const searchFirstName = ref("");
  const searchLastName = ref("");
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  const showAddDialog = ref(false);
  const selectedPlayer = ref<Player | null>(null);
  const playerToDelete = ref<number | null>(null);
  const allPlayers = ref<Player[]>([]);

  const newPlayer = ref<Partial<Player>>({
    firstName: "",
    lastName: "",
    grade: 0,
  });

  // ===== COMPUTED =====
  const filteredPlayers = computed(() => {
    const firstNameQuery = (searchFirstName.value || "").toLowerCase();
    const lastNameQuery = (searchLastName.value || "").toLowerCase();

    return allPlayers.value.filter((player: Player) => {
      const firstName = player.firstName.toLowerCase();
      const lastName = player.lastName.toLowerCase();

      return (
        firstName.includes(firstNameQuery) && lastName.includes(lastNameQuery)
      );
    });
  });

  // ===== WATCHERS =====
  watch(filteredPlayers, (newFiltered) => {
    playerStore.setPlayers(newFiltered);
  });

  // ===== PLAYER OPERATIONS =====
  const loadPlayers = async () => {
    searchFirstName.value = "";
    searchLastName.value = "";
    await playerStore.fetchPlayers();
    allPlayers.value = [...playerStore.players];
    playerStore.setPlayers(allPlayers.value);
  };

  const editPlayer = (player: Player) => {
    selectedPlayer.value = { ...player };
    showEditDialog.value = true;
  };

  const saveEdit = async () => {
    if (selectedPlayer.value && selectedPlayer.value.playerId) {
      try {
        await playerStore.updatePlayer(
          selectedPlayer.value.playerId,
          selectedPlayer.value
        );
        showEditDialog.value = false;
        selectedPlayer.value = null;
      } catch (error) {
        console.error("Failed to save edit:", error);
      }
    }
  };

  const deletePlayer = (id: number) => {
    playerToDelete.value = id;
    showDeleteDialog.value = true;
  };

  const confirmDelete = async () => {
    if (playerToDelete.value) {
      try {
        await playerStore.deletePlayer(playerToDelete.value);
        showDeleteDialog.value = false;
        playerToDelete.value = null;
      } catch (error) {
        console.error("Failed to delete player:", error);
      }
    }
  };

  const openAddDialog = () => {
    newPlayer.value = {
      firstName: "",
      lastName: "",
      grade: 0,
    };
    showAddDialog.value = true;
  };

  const saveNewPlayer = async () => {
    if (
      newPlayer.value.firstName &&
      newPlayer.value.lastName &&
      newPlayer.value.grade !== undefined
    ) {
      try {
        await playerStore.createPlayer(newPlayer.value as Player);
        showAddDialog.value = false;
        newPlayer.value = {
          firstName: "",
          lastName: "",
          grade: 0,
        };
      } catch (error) {
        console.error("Failed to create player:", error);
      }
    }
  };

  const cancelEdit = () => {
    showEditDialog.value = false;
    selectedPlayer.value = null;
  };

  const cancelDelete = () => {
    showDeleteDialog.value = false;
    playerToDelete.value = null;
  };

  const cancelAdd = () => {
    showAddDialog.value = false;
    newPlayer.value = {
      firstName: "",
      lastName: "",
      grade: 0,
    };
  };

  return {
    // State
    searchFirstName,
    searchLastName,
    showEditDialog,
    showDeleteDialog,
    showAddDialog,
    selectedPlayer,
    playerToDelete,
    newPlayer,
    // Store
    playerStore,
    // Computed
    filteredPlayers,
    // Methods
    loadPlayers,
    editPlayer,
    saveEdit,
    deletePlayer,
    confirmDelete,
    openAddDialog,
    saveNewPlayer,
    cancelEdit,
    cancelDelete,
    cancelAdd,
  } as const;
}
