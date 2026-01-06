import { ref, computed, onMounted } from "vue";
import { playerService } from "../services/playerService";
import type { Player } from "./usePlayer";
import { attendanceService } from "../services/attendanceService";
import { editionService } from "../services/editionService";

export interface AttendanceRecord {
  playerId: number;
  editionId: number;
  date: string;
  status: "inscris" | "retras" | "rezerva";
}

export function useAttendance() {
  // ===== STATE =====
  const editionNumber = ref<number | null>(null);
  const selectedEditionDate = ref("");
  const selectedPlayer = ref<number | null>(null);
  const currentEditionId = ref<number | null>(null);
  const attendancePlayers = ref<
    Array<Player & { status?: "inscris" | "retras" | "rezerva" }>
  >([]);
  const allPlayers = ref<Player[]>([]);
  const isAddingPlayer = ref(false);
  const isRemovingPlayer = ref<number | null>(null);
  const successMessage = ref("");
  const errorMessage = ref("");
  const activeTab = ref("new");
  const pastAttendances = ref<
    Array<{
      editionId: number;
      editionNumber: number;
      date: string;
      attendanceRecords: Array<{
        player: Player;
        status?: "inscris" | "retras" | "rezerva";
      }> | null;
      isLoading?: boolean;
    }>
  >([]);
  const expandedPanels = ref<number[]>([]);

  // ===== COMPUTED =====
  const availablePlayers = computed(() => {
    const addedPlayerIds = new Set(
      attendancePlayers.value.map((p) => p.playerId)
    );
    return allPlayers.value
      .filter((p) => !addedPlayerIds.has(p.playerId))
      .map((p) => ({
        playerId: p.playerId,
        label: `${p.firstName} ${p.lastName}`,
        firstName: p.firstName,
        lastName: p.lastName,
        grade: p.grade,
      }));
  });

  // ===== DATA LOADING =====
  const loadAllPlayers = async () => {
    try {
      const response = await playerService.getAll();
      allPlayers.value = response.data;
    } catch (error) {
      console.error("Failed to load players:", error);
      errorMessage.value = "Failed to load players list";
    }
  };

  const loadEditionAttendance = async () => {
    if (!selectedEditionDate.value || !currentEditionId.value) {
      attendancePlayers.value = [];
      return;
    }

    try {
      errorMessage.value = "";
      const attendanceResponse = await attendanceService.getAttendanceByEdition(
        currentEditionId.value
      );
      const records = attendanceResponse.data || [];
      attendancePlayers.value = records
        .map((record: any) => {
          const player = allPlayers.value.find(
            (p) => p.playerId === record.playerId
          );
          return player
            ? {
                ...player,
                status: record.status as "inscris" | "retras" | "rezerva",
              }
            : null;
        })
        .filter(Boolean) as Array<
        Player & { status: "inscris" | "retras" | "rezerva" }
      >;
    } catch (error) {
      console.error("Failed to load attendance:", error);
      attendancePlayers.value = [];
    }
  };

  const loadPastAttendances = async () => {
    try {
      const editionsResponse = await editionService.getAll();
      const editions = editionsResponse.data;

      pastAttendances.value = editions
        .map((edition) => ({
          editionId: edition.editionId!,
          editionNumber: edition.editionNumber || 0,
          date: edition.date,
          attendanceRecords: null,
          isLoading: false,
        }))
        .sort((a, b) => b.editionNumber - a.editionNumber);
    } catch (error) {
      console.error("Failed to load past attendances:", error);
    }
  };

  const loadAttendanceForEdition = async (editionId: number) => {
    const attendanceItem = pastAttendances.value.find(
      (a) => a.editionId === editionId
    );
    if (!attendanceItem || attendanceItem.attendanceRecords !== null) return;

    try {
      attendanceItem.isLoading = true;

      if (allPlayers.value.length === 0) {
        const playersResponse = await playerService.getAll();
        allPlayers.value = playersResponse.data;
      }

      const attendanceResponse = await attendanceService.getAttendanceByEdition(
        editionId
      );
      const attendanceRecords = attendanceResponse.data || [];

      attendanceItem.attendanceRecords = attendanceRecords
        .map((record: any) => {
          const player = allPlayers.value.find(
            (p) => p.playerId === record.playerId
          );
          return player
            ? {
                player,
                status: record.status as "inscris" | "retras" | "rezerva",
              }
            : null;
        })
        .filter(Boolean) as Array<{
        player: Player;
        status?: "inscris" | "retras" | "rezerva";
      }>;
    } catch (error) {
      console.warn(
        `Failed to fetch attendance for edition ${attendanceItem.editionNumber}:`,
        error
      );
      attendanceItem.attendanceRecords = [];
    } finally {
      attendanceItem.isLoading = false;
    }
  };

  const onPanelExpanded = (expandedIds: unknown) => {
    if (!expandedIds) return;
    const ids = Array.isArray(expandedIds) ? expandedIds : [expandedIds];
    for (const editionId of ids) {
      if (typeof editionId === "number") {
        const attendanceItem = pastAttendances.value.find(
          (a) => a.editionId === editionId
        );
        if (
          attendanceItem &&
          attendanceItem.attendanceRecords === null &&
          !attendanceItem.isLoading
        ) {
          loadAttendanceForEdition(editionId);
        }
      }
    }
  };

  // ===== ATTENDANCE MANAGEMENT =====
  const addPlayerToAttendance = async () => {
    if (
      !selectedPlayer.value ||
      !selectedEditionDate.value ||
      !editionNumber.value
    )
      return;

    try {
      isAddingPlayer.value = true;
      errorMessage.value = "";
      const player = allPlayers.value.find(
        (p) => p.playerId === selectedPlayer.value
      );
      if (!player) return;

      let editionId: number;
      try {
        const existingEdition = await editionService.getByNumber(
          editionNumber.value
        );
        editionId = existingEdition.data.editionId!;
        currentEditionId.value = editionId;
      } catch {
        throw new Error(
          "Edition does not exist. Please create it first before adding players."
        );
      }

      const status =
        attendancePlayers.value.length >= 24 ? "rezerva" : "inscris";

      await attendanceService.submitAttendance({
        editionId: editionId,
        playerId: player.playerId,
        date: selectedEditionDate.value,
        status: status,
      });

      attendancePlayers.value.push({
        ...player,
        status,
      });
      selectedPlayer.value = null;

      successMessage.value = `${player.firstName} ${player.lastName} added to attendance successfully`;
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    } catch (error) {
      console.error("Failed to add player:", error);
      errorMessage.value =
        error instanceof Error
          ? `Failed to add player: ${error.message}`
          : "Failed to add player to attendance";
    } finally {
      isAddingPlayer.value = false;
    }
  };

  const removePlayerFromAttendance = async (playerId: number | undefined) => {
    if (playerId === undefined || !currentEditionId.value) return;

    try {
      isRemovingPlayer.value = playerId;
      errorMessage.value = "";

      const attendanceResponse = await attendanceService.getAttendanceByEdition(
        currentEditionId.value
      );
      const attendanceRecords = attendanceResponse.data || [];
      const attendanceRecord = attendanceRecords.find(
        (record: any) => record.playerId === playerId
      );

      if (attendanceRecord?.attendanceId) {
        await attendanceService.deleteAttendance(attendanceRecord.attendanceId);
      }

      attendancePlayers.value = attendancePlayers.value.filter(
        (p) => p.playerId !== playerId
      );

      successMessage.value = "Player removed from attendance";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    } catch (error) {
      console.error("Failed to remove player:", error);
      errorMessage.value = "Failed to remove player from attendance";
    } finally {
      isRemovingPlayer.value = null;
    }
  };

  // ===== EDITION & SUBMISSION =====
  const createOrGetEdition = async (): Promise<number> => {
    if (
      !editionNumber.value ||
      !selectedEditionDate.value ||
      attendancePlayers.value.length === 0
    ) {
      throw new Error(
        "Please provide edition number, date, and add at least one player"
      );
    }

    try {
      try {
        const editionResponse = await editionService.create({
          editionNumber: editionNumber.value,
          date: selectedEditionDate.value,
        });
        return editionResponse.data.editionId!;
      } catch (error: any) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          const existingEdition = await editionService.getByNumber(
            editionNumber.value
          );
          return existingEdition.data.editionId!;
        }
        throw error;
      }
    } catch (error) {
      console.error("Failed to create or get edition:", error);
      throw error;
    }
  };

  const submitAttendance = async (editionId: number) => {
    try {
      const attendanceDataList = attendancePlayers.value.map((player) => ({
        editionId: editionId,
        playerId: player.playerId,
        date: selectedEditionDate.value,
      }));

      for (const attendanceData of attendanceDataList) {
        await attendanceService.submitAttendance(attendanceData);
      }
    } catch (error) {
      console.error("Failed to submit attendance:", error);
      throw error;
    }
  };

  // ===== LIFECYCLE =====
  onMounted(() => {
    loadAllPlayers();
    loadPastAttendances();
  });

  return {
    editionNumber,
    selectedEditionDate,
    selectedPlayer,
    currentEditionId,
    attendancePlayers,
    allPlayers,
    isAddingPlayer,
    isRemovingPlayer,
    successMessage,
    errorMessage,
    activeTab,
    pastAttendances,
    expandedPanels,
    availablePlayers,
    loadAllPlayers,
    loadEditionAttendance,
    loadPastAttendances,
    loadAttendanceForEdition,
    onPanelExpanded,
    addPlayerToAttendance,
    removePlayerFromAttendance,
    createOrGetEdition,
    submitAttendance,
  } as const;
}
