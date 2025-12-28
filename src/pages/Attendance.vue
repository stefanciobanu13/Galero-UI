<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <!-- Header -->
        <v-card elevation="2" class="mb-6">
          <v-card-title class="text-h5">
            <v-icon class="mr-2">mdi-calendar-check</v-icon>
            Attendance Management
          </v-card-title>
          <v-card-text>
            <p class="text-body2 text-grey">
              Register attendance for upcoming editions. You can add up to 24 players as substitutes.
            </p>
          </v-card-text>
        </v-card>

        <!-- Edition Information -->
        <v-card elevation="2" class="mb-6">
          <v-card-title class="text-h6">
            Edition Information
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editionNumber"
                  label="Edition Number"
                  type="number"
                  variant="outlined"
                  hint="e.g., 1, 2, 3..."
                  @change="loadEditionAttendance"
                  :disabled="!!selectedEditionDate"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="selectedEditionDate"
                  label="Edition Date"
                  type="date"
                  variant="outlined"
                  @change="loadEditionAttendance"
                  :disabled="!editionNumber"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Current Attendance Stats -->
        <v-card v-if="selectedEditionDate" elevation="2" class="mb-6">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-center">
                  <p class="text-overline text-grey">Players Registered</p>
                  <p class="text-h4 font-weight-bold">
                    {{ attendancePlayers.length }}<span class="text-h6"> / 24</span>
                  </p>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <v-progress-linear
                  :value="(attendancePlayers.length / 24) * 100"
                  color="primary"
                  height="30"
                  class="mt-4"
                >
                  <span class="text-white text-body2">
                    {{ Math.round((attendancePlayers.length / 24) * 100) }}%
                  </span>
                </v-progress-linear>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Add Player to Attendance -->
        <v-card v-if="selectedEditionDate" elevation="2" class="mb-6">
          <v-card-title class="text-h6">
            Add Player to Attendance
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="8">
                <v-autocomplete
                  v-model="selectedPlayer"
                  :items="availablePlayers"
                  item-title="label"
                  item-value="playerId"
                  label="Search and select a player"
                  variant="outlined"
                  clearable
                  :disabled="attendancePlayers.length >= 24"
                  @update:model-value="selectedPlayer = $event"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn
                  color="primary"
                  block
                  @click="addPlayerToAttendance"
                  :disabled="!selectedPlayer || attendancePlayers.length >= 24"
                  class="h-100"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add Player
                </v-btn>
              </v-col>
            </v-row>

            <v-alert
              v-if="attendancePlayers.length >= 24"
              type="info"
              variant="tonal"
              class="mt-4"
            >
              Maximum capacity (24 players) reached
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Attendance List -->
        <v-card v-if="selectedEditionDate" elevation="2">
          <v-card-title class="text-h6">
            Attendance List - Edition {{ editionNumber }} - {{ selectedEditionDate }}
          </v-card-title>

          <v-card-text v-if="attendancePlayers.length === 0" class="text-center text-grey py-8">
            No players added yet. Select players above to add them to the attendance list.
          </v-card-text>

          <v-table v-else>
            <thead>
              <tr>
                <th class="text-left">#</th>
                <th class="text-left">First Name</th>
                <th class="text-left">Last Name</th>
                <th class="text-left">Status</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(player, index) in attendancePlayers" :key="player.playerId">
                <td>{{ index + 1 }}</td>
                <td>{{ player.firstName }}</td>
                <td>{{ player.lastName }}</td>
                <td>
                  <v-chip 
                    :color="player.status === 'player' ? 'success' : 'warning'" 
                    variant="outlined" 
                    size="small"
                  >
                    {{ player.status === 'player' ? 'Player' : 'Substitute' }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removePlayerFromAttendance(player.playerId)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-card-actions v-if="attendancePlayers.length > 0">
            <v-spacer />
            <v-btn
              color="error"
              variant="outlined"
              @click="clearAllAttendance"
            >
              Clear All
            </v-btn>
            <v-btn
              color="primary"
              @click="submitAttendance"
              :loading="isSubmitting"
            >
              Submit Attendance
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Messages -->
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mt-6"
          closable
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-6"
          closable
        >
          {{ errorMessage }}
        </v-alert>

        <!-- Team Creation Dialog -->
        <v-dialog v-model="showTeamCreationDialog" max-width="900" persistent>
          <v-card>
            <v-card-title class="text-h6">
              Create Teams for Edition {{ createdEditionNumber }}
            </v-card-title>
            <v-card-subtitle class="mb-4">
              Manually assign players from the attendance list to teams
            </v-card-subtitle>

            <v-card-text class="max-height-dialog">
              <v-row>
                <!-- Unassigned Players Column -->
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-title class="text-subtitle2">
                      <v-icon class="mr-2">mdi-account-multiple</v-icon>
                      Available Players ({{ unassignedPlayers.length }})
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="scrollable-list">
                      <v-list density="compact">
                        <v-list-item
                          v-for="player in unassignedPlayers"
                          :key="player.playerId"
                          class="player-item"
                        >
                          <v-chip
                            class="w-100 justify-start"
                            @click="selectPlayerForTeam(player)"
                            variant="outlined"
                            @dragstart="(event: DragEvent) => { if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'; draggedPlayer = player; }"
                          >
                            {{ player.firstName }} {{ player.lastName }}
                          </v-chip>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Teams Column -->
                <v-col cols="12" md="8">
                  <v-row>
                    <v-col cols="12" sm="6" v-for="color in teamColors" :key="color">
                      <v-card
                        :style="{ borderLeft: `5px solid ${getTeamColor(color)}` }"
                        @dragover.prevent
                        @drop="assignPlayerToTeam(color)"
                        class="team-dropzone"
                      >
                        <v-card-title class="text-capitalize text-subtitle2">
                          {{ color }} Team ({{ getTeamPlayers(color).length }})
                        </v-card-title>
                        <v-divider />
                        <v-card-text class="scrollable-list">
                          <v-list density="compact">
                            <v-list-item
                              v-for="player in getTeamPlayers(color)"
                              :key="player.playerId"
                              class="team-player-item"
                            >
                              <v-chip
                                class="w-100 justify-space-between"
                                closable
                                @click:close="removePlayerFromTeam(color, player.playerId)"
                              >
                                {{ player.firstName }} {{ player.lastName }}
                              </v-chip>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <v-alert type="info" variant="tonal" class="mt-6">
                You can drag players from the left panel to assign them to teams, or click on players to move them.
              </v-alert>
            </v-card-text>

            <v-divider />
            <v-card-actions>
              <v-spacer />
              <v-btn variant="outlined" @click="cancelTeamCreation">
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                @click="saveTeams"
                :disabled="!areAllPlayersAssigned"
                :loading="isSavingTeams"
              >
                Save Teams & Continue
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { playerService, attendanceService, editionService, teamService, teamPlayerService } from '../services/api';
import type { Player } from '../types';

interface AttendancePlayer extends Player {
  status?: 'player' | 'substitute';
}

const router = useRouter();
const editionNumber = ref<number | null>(null);
const selectedEditionDate = ref('');
const selectedPlayer = ref<number | null>(null);
const attendancePlayers = ref<AttendancePlayer[]>([]);
const allPlayers = ref<Player[]>([]);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Team creation related
const showTeamCreationDialog = ref(false);
const createdEditionNumber = ref<number | null>(null);
const createdEditionId = ref<number | null>(null);
const isSavingTeams = ref(false);
const draggedPlayer = ref<AttendancePlayer | null>(null);
const teamColors: Array<'green' | 'orange' | 'gray' | 'blue'> = ['green', 'orange', 'gray', 'blue'];
const teams = ref<Record<'green' | 'orange' | 'gray' | 'blue', AttendancePlayer[]>>({
  green: [],
  orange: [],
  gray: [],
  blue: [],
});

// Local storage key for attendance data
const getAttendanceKey = (date: string) => `attendance_${date}`;

// Get team color value for styling
const getTeamColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    green: '#4CAF50',
    orange: '#FF9800',
    gray: '#9E9E9E',
    blue: '#2196F3',
  };
  return colorMap[color] || '#000';
};

// Computed list of available players (not yet in attendance)
const availablePlayers = computed(() => {
  const addedPlayerIds = new Set(attendancePlayers.value.map(p => p.playerId));
  return allPlayers.value
    .filter(p => !addedPlayerIds.has(p.playerId))
    .map(p => ({
      playerId: p.playerId,
      label: `${p.firstName} ${p.lastName}`,
      firstName: p.firstName,
      lastName: p.lastName,
      grade: p.grade,
    }));
});

// Unassigned players in team creation
const unassignedPlayers = computed(() => {
  const assignedIds = new Set<number>();
  teamColors.forEach(color => {
    teams.value[color].forEach(player => {
      assignedIds.add(player.playerId!);
    });
  });
  return attendancePlayers.value.filter(p => !assignedIds.has(p.playerId!));
});

// Check if all players are assigned to teams
const areAllPlayersAssigned = computed(() => {
  return unassignedPlayers.value.length === 0 && attendancePlayers.value.length > 0;
});

// Helper to get team players with type safety
const getTeamPlayers = (color: string) => {
  return teams.value[color as 'green' | 'orange' | 'gray' | 'blue'] || [];
};

// Load all players on mount
const loadAllPlayers = async () => {
  try {
    const response = await playerService.getAll();
    allPlayers.value = response.data;
  } catch (error) {
    console.error('Failed to load players:', error);
    errorMessage.value = 'Failed to load players list';
  }
};

// Load attendance for selected edition (from local storage)
const loadEditionAttendance = async () => {
  if (!selectedEditionDate.value) {
    attendancePlayers.value = [];
    return;
  }

  try {
    errorMessage.value = '';
    // Load from localStorage instead of backend
    const storageKey = getAttendanceKey(selectedEditionDate.value);
    const stored = localStorage.getItem(storageKey);
    attendancePlayers.value = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load attendance:', error);
    attendancePlayers.value = [];
  }
};

// Add player to attendance
const addPlayerToAttendance = async () => {
  if (!selectedPlayer.value || !selectedEditionDate.value) return;

  try {
    errorMessage.value = '';
    const player = allPlayers.value.find(p => p.playerId === selectedPlayer.value);
    if (player) {
      // Determine status: 'player' for first 24, 'substitute' for additional
      const status: 'player' | 'substitute' = attendancePlayers.value.length < 24 ? 'player' : 'substitute';
      const playerWithStatus: AttendancePlayer = {
        ...player,
        status,
      };
      attendancePlayers.value.push(playerWithStatus);
      selectedPlayer.value = null;
      successMessage.value = `${player.firstName} ${player.lastName} added to attendance`;
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (error) {
    console.error('Failed to add player:', error);
    errorMessage.value = 'Failed to add player to attendance';
  }
};

// Remove player from attendance
const removePlayerFromAttendance = (playerId: number | undefined) => {
  if (playerId !== undefined) {
    attendancePlayers.value = attendancePlayers.value.filter(p => p.playerId !== playerId);
  }
};

// Clear all attendance
const clearAllAttendance = () => {
  if (confirm('Are you sure you want to clear all players from attendance?')) {
    attendancePlayers.value = [];
  }
};

// Team creation functions
const selectPlayerForTeam = (player: AttendancePlayer) => {
  // Find first team that doesn't have this player and assign
  for (const color of teamColors) {
    const teamPlayers = teams.value[color];
    if (teamPlayers && !teamPlayers.find(p => p.playerId === player.playerId)) {
      teamPlayers.push(player);
      return;
    }
  }
};

const assignPlayerToTeam = (teamColor: string) => {
  if (draggedPlayer.value) {
    const teamPlayers = teams.value[teamColor as 'green' | 'orange' | 'gray' | 'blue'];
    if (teamPlayers && !teamPlayers.find(p => p.playerId === draggedPlayer.value!.playerId)) {
      teamPlayers.push(draggedPlayer.value);
      draggedPlayer.value = null;
    }
  }
};

const removePlayerFromTeam = (teamColor: string, playerId: number | undefined) => {
  if (playerId !== undefined) {
    const teamPlayers = teams.value[teamColor as 'green' | 'orange' | 'gray' | 'blue'];
    if (teamPlayers) {
      teams.value[teamColor as 'green' | 'orange' | 'gray' | 'blue'] = teamPlayers.filter(p => p.playerId !== playerId);
    }
  }
};

const cancelTeamCreation = () => {
  if (confirm('Are you sure you want to cancel team creation? You will need to restart the attendance process.')) {
    showTeamCreationDialog.value = false;
    // Reset form
    editionNumber.value = null;
    selectedEditionDate.value = '';
    attendancePlayers.value = [];
    selectedPlayer.value = null;
    // Reset teams
    teams.value = {
      green: [],
      orange: [],
      gray: [],
      blue: [],
    };
  }
};

const saveTeams = async () => {
  if (!createdEditionId.value) {
    errorMessage.value = 'Edition ID not found. Please try again.';
    return;
  }

  isSavingTeams.value = true;
  try {
    errorMessage.value = '';

    // Create teams in backend
    const teamIdMap: Record<string, number> = {};
    for (const color of teamColors) {
      const teamResponse = await teamService.create({
        editionId: createdEditionId.value,
        color: color as 'green' | 'orange' | 'gray' | 'blue',
      });
      teamIdMap[color] = teamResponse.data.teamId!;
    }

    // Assign players to teams
    for (const color of teamColors) {
      const teamId = teamIdMap[color];
      const teamPlayers = teams.value[color];
      if (teamPlayers && teamId) {
        for (const player of teamPlayers) {
          const playerId = player.playerId;
          if (playerId) {
            await teamPlayerService.addPlayerToTeam(teamId, playerId);
          }
        }
      }
    }

    successMessage.value = `Teams created successfully! Redirecting to edition setup...`;
    
    // Redirect to editions page to continue with match setup
    setTimeout(() => {
      showTeamCreationDialog.value = false;
      editionNumber.value = null;
      selectedEditionDate.value = '';
      attendancePlayers.value = [];
      selectedPlayer.value = null;
      teams.value = {
        green: [],
        orange: [],
        gray: [],
        blue: [],
      };
      // Navigate to editions page, optionally with the edition ID
      router.push(`/editions`);
    }, 2000);
  } catch (error) {
    console.error('Failed to save teams:', error);
    errorMessage.value = error instanceof Error 
      ? `Failed to save teams: ${error.message}`
      : 'Failed to save teams. Please try again.';
  } finally {
    isSavingTeams.value = false;
  }
};

// Submit attendance (first create edition, then save attendance)
const submitAttendance = async () => {
  if (!editionNumber.value || !selectedEditionDate.value || attendancePlayers.value.length === 0) {
    errorMessage.value = 'Please provide edition number, date, and add at least one player';
    return;
  }

  isSubmitting.value = true;
  try {
    errorMessage.value = '';
    
    // Step 1: Create the edition
    let editionId: number;
    try {
      const editionResponse = await editionService.create({
        editionNumber: editionNumber.value,
        date: selectedEditionDate.value,
      });
      editionId = editionResponse.data.editionId!;
    } catch (error: any) {
      // Check if edition already exists (might get a conflict error)
      if (error.response?.status === 409 || error.response?.status === 400) {
        // Try to fetch existing edition
        try {
          const existingEdition = await editionService.getByNumber(editionNumber.value);
          editionId = existingEdition.data.editionId!;
        } catch {
          throw new Error('Failed to create or find edition');
        }
      } else {
        throw error;
      }
    }

    // Step 2: Submit attendance with the created edition ID
    const attendanceDataList = attendancePlayers.value.map(player => ({
      editionId: editionId,
      playerId: player.playerId,
      playerFirstName: player.firstName,
      playerLastName: player.lastName,
      date: selectedEditionDate.value,
    }));

    // Submit each attendance record
    for (const attendanceData of attendanceDataList) {
      await attendanceService.submitAttendance(attendanceData);
    }
    
    successMessage.value = `Attendance for Edition ${editionNumber.value} (${selectedEditionDate.value}) saved successfully! (${attendancePlayers.value.length} players)`;

    // Reset teams for new edition
    teams.value = {
      green: [],
      orange: [],
      gray: [],
      blue: [],
    };

    // Show team creation dialog
    createdEditionNumber.value = editionNumber.value;
    createdEditionId.value = editionId;
    showTeamCreationDialog.value = true;

    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to submit attendance:', error);
    errorMessage.value = error instanceof Error 
      ? `Failed to submit attendance: ${error.message}`
      : 'Failed to submit attendance. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadAllPlayers();
});
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.max-height-dialog {
  max-height: 500px;
  overflow-y: auto;
}

.scrollable-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-item {
  padding: 4px 0;
}

.team-player-item {
  padding: 4px 0;
}

.team-dropzone {
  min-height: 300px;
  transition: background-color 0.2s ease;
}

.team-dropzone:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
