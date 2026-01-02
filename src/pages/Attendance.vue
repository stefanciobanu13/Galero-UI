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
              Register attendance for editions. View and manage past attendances.
            </p>
          </v-card-text>
        </v-card>

        <!-- Tabs for New Attendance / Past Attendances -->
        <v-tabs v-model="activeTab" class="mb-6">
          <v-tab value="new">{{ isEditingMode ? 'Edit Attendance' : 'Add New Attendance' }}</v-tab>
          <v-tab value="past">Past Attendances</v-tab>
        </v-tabs>

        <!-- Add New Attendance Tab -->
        <v-window v-model="activeTab">
          <v-window-item value="new">
            <!-- Editing Mode Notice -->
            <v-alert v-if="isEditingMode" type="info" variant="tonal" class="mb-6">
              <v-icon class="mr-2">mdi-pencil</v-icon>
              You are editing an existing attendance record. Make your changes and proceed to team creation.
              <v-btn 
                size="small" 
                variant="text" 
                color="info"
                @click="cancelEditMode"
                class="ml-2"
              >
                Cancel Edit
              </v-btn>
            </v-alert>
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
                        {{ attendancePlayers.length }}
                      </p>
                    </div>
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
                      @update:model-value="selectedPlayer = $event"
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-btn
                      color="primary"
                      block
                      @click="addPlayerToAttendance"
                      :disabled="!selectedPlayer"
                      :loading="isAddingPlayer"
                      class="h-100"
                    >
                      <v-icon left>mdi-plus</v-icon>
                      Add Player
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Attendance List -->
            <v-card v-if="selectedEditionDate" elevation="2" class="mb-6">
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
                      <v-select
                        v-model="player.status"
                        :items="['inscris', 'retras', 'rezerva']"
                        density="compact"
                        variant="outlined"
                        @update:model-value="updatePlayerStatus(player)"
                        hide-details
                      />
                    </td>
                    <td class="text-center">
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click="removePlayerFromAttendance(player.playerId)"
                        :loading="isRemovingPlayer === player.playerId"
                      />
                    </td>
                  </tr>
                </tbody>
              </v-table>


            </v-card>
          </v-window-item>

          <!-- Past Attendances Tab -->
          <v-window-item value="past">
            <v-card elevation="2">
              <v-card-title class="text-h6">
                Past Attendances
              </v-card-title>
              <v-card-text>
                <v-alert v-if="pastAttendances.length === 0" type="info" class="mb-4">
                  No past attendances found.
                </v-alert>

                <v-expansion-panels v-else v-model="expandedPanels" @update:model-value="onPanelExpanded">
                  <v-expansion-panel v-for="pastAttendance in pastAttendances" :key="pastAttendance.editionId" :value="pastAttendance.editionId">
                    <v-expansion-panel-title>
                      <v-row class="align-center w-100">
                        <v-col cols="auto">
                          <strong>Edition {{ pastAttendance.editionNumber }}</strong>
                        </v-col>
                        <v-col cols="auto">
                          {{ formatDate(pastAttendance.date) }}
                        </v-col>
                        <v-col cols="auto" class="ml-auto">
                          <v-chip v-if="pastAttendance.attendanceRecords" size="small">
                            {{ pastAttendance.attendanceRecords.length }} players
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-divider class="mb-4" />
                      <p v-if="pastAttendance.attendanceRecords && pastAttendance.attendanceRecords.length === 0" class="text-grey">
                        No players in this attendance
                      </p>
                      <v-list v-else-if="pastAttendance.attendanceRecords">
                        <v-list-item v-for="(record, index) in pastAttendance.attendanceRecords" :key="record.player.playerId">
                          <template #prepend>
                            <span class="font-weight-bold mr-4">{{ index + 1 }}</span>
                          </template>
                          <v-list-item-title>
                            {{ record.player.firstName }} {{ record.player.lastName }}
                          </v-list-item-title>
                          <template #append>
                            <v-chip 
                              size="small"
                              :color="record.status === 'inscris' ? 'success' : record.status === 'retras' ? 'error' : 'warning'"
                              variant="tonal"
                            >
                              {{ record.status }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                      <v-divider class="my-4" />
                      <v-row class="gap-2">
                        <v-col cols="auto">
                          <v-btn
                            color="primary"
                            @click.stop="editPastAttendance(pastAttendance)"
                          >
                            <v-icon left>mdi-pencil</v-icon>
                            Edit Attendance
                          </v-btn>
                        </v-col>
                        <v-col cols="auto">
                          <v-btn
                            color="info"
                            @click.stop="copyAttendanceMessage(pastAttendance)"
                          >
                            <v-icon left>mdi-content-copy</v-icon>
                            Copy Message
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>

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
  status?: 'inscris' | 'retras' | 'rezerva';
}

const router = useRouter();
const editionNumber = ref<number | null>(null);
const selectedEditionDate = ref('');
const selectedPlayer = ref<number | null>(null);
const currentEditionId = ref<number | null>(null);
const attendancePlayers = ref<AttendancePlayer[]>([]);
const allPlayers = ref<Player[]>([]);
const isSubmitting = ref(false);
const isAddingPlayer = ref(false);
const isRemovingPlayer = ref<number | null>(null);
const isCreatingEdition = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const activeTab = ref('new');
const pastAttendances = ref<Array<{ editionId: number; editionNumber: number; date: string; attendanceRecords: Array<{ player: Player; status?: 'inscris' | 'retras' | 'rezerva'; attendanceId?: number }> | null; isLoading?: boolean }>>([]);
const expandedPanels = ref<number[]>([]);

// Edit mode state
const isEditingMode = ref(false);
const editingEditionId = ref<number | null>(null);

// Team creation related
const showTeamCreationDialog = ref(false);
const createdEditionNumber = ref<number | null>(null);
const createdEditionId = ref<number | null>(null);
const isSavingTeams = ref(false);
const draggedPlayer = ref<AttendancePlayer | null>(null);
const teamColors: Array<'verde' | 'portocaliu' | 'gri' | 'albastru'> = ['verde', 'portocaliu', 'gri', 'albastru'];
const teams = ref<Record<'verde' | 'portocaliu' | 'gri' | 'albastru', AttendancePlayer[]>>({
  verde: [],
  portocaliu: [],
  gri: [],
  albastru: [],
});

// Local storage key for attendance data
const getAttendanceKey = (date: string) => `attendance_${date}`;

// Get team color value for styling
const getTeamColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    verde: '#4CAF50',
    portocaliu: '#FF9800',
    gri: '#9E9E9E',
    albastru: '#2196F3',
  };
  return colorMap[color] || '#FFFFFF';
};

// Format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
  return teams.value[color as 'verde' | 'portocaliu' | 'gri' | 'albastru'] || [];
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
    currentEditionId.value = null;
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
  if (!selectedPlayer.value || !selectedEditionDate.value || !editionNumber.value) return;

  try {
    isAddingPlayer.value = true;
    errorMessage.value = '';
    
    const player = allPlayers.value.find(p => p.playerId === selectedPlayer.value);
    if (!player) return;

    // Step 1: Get existing edition by number
    let editionId: number;
    try {
      const existingEdition = await editionService.getByNumber(editionNumber.value);
      editionId = existingEdition.data.editionId!;
      currentEditionId.value = editionId;
    } catch {
      throw new Error('Edition does not exist. Please create it first before adding players.');
    }

    // Step 2: Calculate status before submission
    // Set status: inscris for first 24 players, rezerva after
    const status: 'inscris' | 'retras' | 'rezerva' = attendancePlayers.value.length >= 24 ? 'rezerva' : 'inscris';

    // Step 3: Submit attendance immediately for this player with status
    await attendanceService.submitAttendance({
      editionId: editionId,
      playerId: player.playerId,
      date: selectedEditionDate.value,
      status: status,
    });

    // Step 4: Add to local list
    const playerWithStatus: AttendancePlayer = {
      ...player,
      status: status,
    };
    attendancePlayers.value.push(playerWithStatus);
    selectedPlayer.value = null;
    
    successMessage.value = `${player.firstName} ${player.lastName} added to attendance successfully`;
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to add player:', error);
    errorMessage.value = error instanceof Error 
      ? `Failed to add player: ${error.message}`
      : 'Failed to add player to attendance';
  } finally {
    isAddingPlayer.value = false;
  }
};

// Update player status and persist to database
const updatePlayerStatus = async (player: AttendancePlayer) => {
  if (!currentEditionId.value || !player.status || !selectedEditionDate.value) return;

  try {
    // Get all attendance records for the current edition
    const attendanceResponse = await attendanceService.getAttendanceByEdition(currentEditionId.value);
    const attendanceRecords = attendanceResponse.data || [];
    
    // Find the attendance record for this player
    const attendanceRecord = attendanceRecords.find((record: any) => record.playerId === player.playerId);
    
    if (attendanceRecord && attendanceRecord.attendanceId) {
      // Update the status in the database with all required fields
      await attendanceService.updateAttendance(
        attendanceRecord.attendanceId,
        {
          playerId: player.playerId,
          editionId: currentEditionId.value,
          date: selectedEditionDate.value,
          status: player.status
        }
      );
      
      successMessage.value = `${player.firstName} ${player.lastName}'s status updated to ${player.status}`;
      setTimeout(() => {
        successMessage.value = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to update player status:', error);
    errorMessage.value = 'Failed to update player status';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
  }
};

// Remove player from attendance
const removePlayerFromAttendance = async (playerId: number | undefined) => {
  if (playerId === undefined || !currentEditionId.value) return;

  try {
    isRemovingPlayer.value = playerId;
    errorMessage.value = '';
    
    // Step 1: Get all attendance records for the current edition
    const attendanceResponse = await attendanceService.getAttendanceByEdition(currentEditionId.value);
    const attendanceRecords = attendanceResponse.data || [];
    
    // Step 2: Find the attendance record for this player
    const attendanceRecord = attendanceRecords.find((record: any) => record.playerId === playerId);
    
    if (attendanceRecord && attendanceRecord.attendanceId) {
      // Step 3: Delete from database
      await attendanceService.deleteAttendance(attendanceRecord.attendanceId);
    }
    
    // Step 4: Remove from local list
    attendancePlayers.value = attendancePlayers.value.filter(p => p.playerId !== playerId);
    
    successMessage.value = 'Player removed from attendance';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to remove player:', error);
    errorMessage.value = 'Failed to remove player from attendance';
  } finally {
    isRemovingPlayer.value = null;
  }
};

// Clear all attendance
const clearAllAttendance = () => {
  if (confirm('Are you sure you want to clear all players from attendance?')) {
    attendancePlayers.value = [];
  }
};

// Load past attendances (only editions, not the players yet)
const loadPastAttendances = async () => {
  try {
    const editionsResponse = await editionService.getAll();
    const editions = editionsResponse.data;

    pastAttendances.value = editions.map(edition => ({
      editionId: edition.editionId!,
      editionNumber: edition.editionNumber || 0,
      date: edition.date,
      attendanceRecords: null, // Will be loaded on expansion
      isLoading: false,
    })).sort((a, b) => b.editionNumber - a.editionNumber);
  } catch (error) {
    console.error('Failed to load past attendances:', error);
  }
};

// Load attendance records for a specific edition (called when user expands)
const loadAttendanceForEdition = async (editionId: number) => {
  const attendanceItem = pastAttendances.value.find(a => a.editionId === editionId);
  if (!attendanceItem) return;

  // If already loaded, don't fetch again
  if (attendanceItem.attendanceRecords !== null) return;

  try {
    attendanceItem.isLoading = true;

    // Make sure all players are loaded
    if (allPlayers.value.length === 0) {
      const playersResponse = await playerService.getAll();
      allPlayers.value = playersResponse.data;
    }

    // Get attendance records for this edition using edition ID
    const attendanceResponse = await attendanceService.getAttendanceByEdition(editionId);
    const attendanceRecords = attendanceResponse.data || [];
    
    // Get player details from the already loaded allPlayers list and include status and attendanceId
    const attendanceWithPlayers = attendanceRecords
      .map((record: any) => {
        const player = allPlayers.value.find(p => p.playerId === record.playerId);
        if (player) {
          return {
            player,
            status: record.status as 'inscris' | 'retras' | 'rezerva',
            attendanceId: record.attendanceId as number,
          };
        }
        return null;
      })
      .filter((item: any): item is { player: Player; status: 'inscris' | 'retras' | 'rezerva'; attendanceId: number } => item !== null);

    attendanceItem.attendanceRecords = attendanceWithPlayers;
  } catch (error) {
    console.warn(`Failed to fetch attendance for edition ${attendanceItem.editionNumber}:`, error);
    attendanceItem.attendanceRecords = [];
  } finally {
    attendanceItem.isLoading = false;
  }
};

// Handler for when a panel is expanded
const onPanelExpanded = (expandedIds: unknown) => {
  if (expandedIds === undefined || expandedIds === null) return;
  
  // Convert to array if single value
  const ids = Array.isArray(expandedIds) ? expandedIds : [expandedIds];
  
  // Load attendance for newly expanded panels
  for (const editionId of ids) {
    if (typeof editionId !== 'number') continue;
    const attendanceItem = pastAttendances.value.find(a => a.editionId === editionId);
    if (attendanceItem && attendanceItem.attendanceRecords === null && !attendanceItem.isLoading) {
      loadAttendanceForEdition(editionId);
    }
  }
};

// Proceed to team creation
const proceedToTeamCreation = async () => {
  if (!editionNumber.value || !selectedEditionDate.value || attendancePlayers.value.length === 0) {
    errorMessage.value = 'Missing edition information or players';
    return;
  }

  isCreatingEdition.value = true;
  try {
    errorMessage.value = '';

    // Get or create edition
    let editionId: number;
    try {
      const editionResponse = await editionService.create({
        editionNumber: editionNumber.value,
        date: selectedEditionDate.value,
      });
      editionId = editionResponse.data.editionId!;
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.status === 400) {
        const existingEdition = await editionService.getByNumber(editionNumber.value);
        editionId = existingEdition.data.editionId!;
      } else {
        throw error;
      }
    }

    // If in edit mode, update the attendance records with new statuses
    if (isEditingMode.value) {
      try {
        // Get current attendance records from the database
        const attendanceResponse = await attendanceService.getAttendanceByEdition(editionId);
        const dbAttendanceRecords = attendanceResponse.data || [];

        // Update the status for each player that has been modified
        for (const player of attendancePlayers.value) {
          const dbRecord = dbAttendanceRecords.find((r: any) => r.playerId === player.playerId);
          if (dbRecord && player.status !== dbRecord.status) {
            const attendanceId = dbRecord.attendanceId as number;
            // Status has been changed, update it
            await attendanceService.updateAttendance(
              attendanceId,
              { status: player.status }
            );
          }
        }
        successMessage.value = 'Attendance updated successfully!';
      } catch (error) {
        console.error('Failed to update attendance:', error);
        errorMessage.value = 'Failed to update some attendance records';
      }
    }

    // Reset teams for new edition
    teams.value = {
      verde: [],
      portocaliu: [],
      gri: [],
      albastru: [],
    };

    // Show team creation dialog
    createdEditionNumber.value = editionNumber.value;
    createdEditionId.value = editionId;
    showTeamCreationDialog.value = true;

    successMessage.value = isEditingMode.value ? 'Attendance updated! Proceeding to team configuration...' : 'Proceeding to team creation...';
    setTimeout(() => {
      successMessage.value = '';
    }, 2000);
  } catch (error) {
    console.error('Failed to proceed:', error);
    errorMessage.value = error instanceof Error 
      ? `Failed: ${error.message}`
      : 'Failed to proceed to team creation';
  } finally {
    isCreatingEdition.value = false;
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
    const teamPlayers = teams.value[teamColor as 'verde' | 'portocaliu' | 'gri' | 'albastru'];
    if (teamPlayers && !teamPlayers.find(p => p.playerId === draggedPlayer.value!.playerId)) {
      teamPlayers.push(draggedPlayer.value);
      draggedPlayer.value = null;
    }
  }
};

const removePlayerFromTeam = (teamColor: string, playerId: number | undefined) => {
  if (playerId !== undefined) {
    const teamPlayers = teams.value[teamColor as 'verde' | 'portocaliu' | 'gri' | 'albastru'];
    if (teamPlayers) {
      teams.value[teamColor as 'verde' | 'portocaliu' | 'gri' | 'albastru'] = teamPlayers.filter(p => p.playerId !== playerId);
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
    // Reset editing mode
    isEditingMode.value = false;
    editingEditionId.value = null;
    // Reset teams
    teams.value = {
      verde: [],
      portocaliu: [],
      gri: [],
      albastru: [],
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

    // Color mapping from Romanian to English for backend
    const colorMap: Record<string, 'green' | 'orange' | 'gray' | 'blue'> = {
      verde: 'green',
      portocaliu: 'orange',
      gri: 'gray',
      albastru: 'blue',
    };

    // Create teams in backend
    const teamIdMap: Record<string, number> = {};
    for (const color of teamColors) {
      const teamResponse = await teamService.create({
        editionId: createdEditionId.value,
        color: colorMap[color] as 'green' | 'orange' | 'gray' | 'blue',
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
      isEditingMode.value = false;
      editingEditionId.value = null;
      teams.value = {
        verde: [],
        portocaliu: [],
        gri: [],
        albastru: [],
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
      date: selectedEditionDate.value,
    }));

    // Submit each attendance record
    for (const attendanceData of attendanceDataList) {
      await attendanceService.submitAttendance(attendanceData);
    }
    
    successMessage.value = `Attendance for Edition ${editionNumber.value} (${selectedEditionDate.value}) saved successfully! (${attendancePlayers.value.length} players)`;

    // Reset teams for new edition
    teams.value = {
      verde: [],
      portocaliu: [],
      gri: [],
      albastru: [],
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

// Edit attendance functions
const editPastAttendance = async (pastAttendance: any) => {
  try {
    // Load full attendance records if not already loaded
    if (!pastAttendance.attendanceRecords) {
      await loadAttendanceForEdition(pastAttendance.editionId);
    }

    // Set the edition information in the form
    editionNumber.value = pastAttendance.editionNumber;
    selectedEditionDate.value = pastAttendance.date;
    currentEditionId.value = pastAttendance.editionId;

    // Load the players into the attendance list
    if (pastAttendance.attendanceRecords) {
      attendancePlayers.value = pastAttendance.attendanceRecords.map((record: any) => ({
        ...record.player,
        status: record.status,
      }));
    }

    // Set editing mode and switch tab
    isEditingMode.value = true;
    editingEditionId.value = pastAttendance.editionId;
    activeTab.value = 'new';

    successMessage.value = 'Loaded attendance for editing. You can now modify players and statuses.';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to load attendance for editing:', error);
    errorMessage.value = 'Failed to load attendance data for editing';
  }
};

const cancelEditMode = () => {
  isEditingMode.value = false;
  editingEditionId.value = null;
  editionNumber.value = null;
  selectedEditionDate.value = '';
  currentEditionId.value = null;
  attendancePlayers.value = [];
  selectedPlayer.value = null;
  activeTab.value = 'past';
};

// Format attendance data into a message and copy to clipboard
const copyAttendanceMessage = async (pastAttendance: any) => {
  try {
    // Make sure attendance records are loaded
    if (!pastAttendance.attendanceRecords) {
      await loadAttendanceForEdition(pastAttendance.editionId);
    }

    if (!pastAttendance.attendanceRecords || pastAttendance.attendanceRecords.length === 0) {
      errorMessage.value = 'No attendance records to copy';
      setTimeout(() => {
        errorMessage.value = '';
      }, 3000);
      return;
    }

    // Separate players by status
    const inscrisi = pastAttendance.attendanceRecords
      .filter((r: any) => r.status === 'inscris')
      .map((r: any) => r.player);
    const rezerve = pastAttendance.attendanceRecords
      .filter((r: any) => r.status === 'rezerva')
      .map((r: any) => r.player);
    const retras = pastAttendance.attendanceRecords
      .filter((r: any) => r.status === 'retras')
      .map((r: any) => r.player);

    // Build the message
    let message = `Prezenta pentru editia ${pastAttendance.editionNumber} - Galero:`;

    // Add inscris players (first 24)
    if (inscrisi.length > 0) {
      message += '\n';
      inscrisi.slice(0, 24).forEach((player, index) => {
        message += `\n${index + 1}. ${player.firstName} ${player.lastName}`;
      });
    }

    // Add rezerva players
    if (rezerve.length > 0) {
      message += '\n\nRezerve:';
      rezerve.forEach((player, index) => {
        message += `\n${index + 1}. ${player.firstName} ${player.lastName}`;
      });
    }

    // Add retras players
    if (retras.length > 0) {
      message += '\n\nList Rusinii:';
      retras.forEach((player, index) => {
        message += `\n${index + 1}. ${player.firstName} ${player.lastName}`;
      });
    }

    // Copy to clipboard
    await navigator.clipboard.writeText(message);

    successMessage.value = 'Attendance message copied to clipboard!';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to copy attendance message:', error);
    errorMessage.value = 'Failed to copy message to clipboard';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
  }
};

onMounted(() => {
  loadAllPlayers();
  loadPastAttendances();
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
