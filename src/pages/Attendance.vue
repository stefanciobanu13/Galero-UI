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

        <!-- Edition Date Selection -->
        <v-card elevation="2" class="mb-6">
          <v-card-title class="text-h6">
            Select Edition Date
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="selectedEditionDate"
              label="Edition Date"
              type="date"
              variant="outlined"
              @change="loadEditionAttendance"
            />
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
            Attendance List - {{ selectedEditionDate }}
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { playerService } from '../services/api';
import type { Player } from '../types';

const authStore = useAuthStore();
const selectedEditionDate = ref('');
const selectedPlayer = ref<number | null>(null);
const attendancePlayers = ref<Player[]>([]);
const allPlayers = ref<Player[]>([]);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Local storage key for attendance data
const getAttendanceKey = (date: string) => `attendance_${date}`;

// Format date to YYYY-MM-DD
const formatDateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Computed list of available players (not yet in attendance)
const availablePlayers = computed(() => {
  const addedPlayerIds = new Set(attendancePlayers.value.map(p => p.playerId));
  return allPlayers.value
    .filter(p => !addedPlayerIds.has(p.playerId))
    .map(p => ({
      playerId: p.playerId,
      label: `${p.firstName} ${p.lastName} (Grade ${p.grade})`,
      firstName: p.firstName,
      lastName: p.lastName,
      grade: p.grade,
    }));
});

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
      const status = attendancePlayers.value.length < 24 ? 'player' : 'substitute';
      const playerWithStatus = {
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
const removePlayerFromAttendance = (playerId: number) => {
  attendancePlayers.value = attendancePlayers.value.filter(p => p.playerId !== playerId);
};

// Clear all attendance
const clearAllAttendance = () => {
  if (confirm('Are you sure you want to clear all players from attendance?')) {
    attendancePlayers.value = [];
  }
};

// Submit attendance (save to local storage)
const submitAttendance = async () => {
  if (!selectedEditionDate.value || attendancePlayers.value.length === 0) {
    errorMessage.value = 'Please select a date and add at least one player';
    return;
  }

  isSubmitting.value = true;
  try {
    errorMessage.value = '';
    
    // Save to localStorage for now
    const storageKey = getAttendanceKey(selectedEditionDate.value);
    localStorage.setItem(storageKey, JSON.stringify(attendancePlayers.value));
    
    successMessage.value = `Attendance for ${selectedEditionDate.value} saved successfully! (${attendancePlayers.value.length} players)`;
    
    // TODO: When backend is ready, implement these steps:
    // 1. First, create the edition for this date if it doesn't exist
    // 2. Then, submit the attendance with players as substitutes
    // Example backend call:
    // const attendanceData = {
    //   editionDate: selectedEditionDate.value,
    //   players: attendancePlayers.value.map(p => ({
    //     playerId: p.playerId,
    //     firstName: p.firstName,
    //     lastName: p.lastName,
    //     status: 'SUBSTITUTE',
    //   })),
    // };
    // await attendanceService.submitAttendance(attendanceData);
    
    setTimeout(() => {
      successMessage.value = '';
      // Optionally reset the form here
      selectedEditionDate.value = '';
      attendancePlayers.value = [];
    }, 3000);
  } catch (error) {
    console.error('Failed to submit attendance:', error);
    errorMessage.value = 'Failed to submit attendance. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// Load sample editions (mock data) - No longer needed, editions created on submission
// const loadEditions = () => {
//   const today = new Date();
//   const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
//   const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
//
//   editions.value = [
//     {
//       id: 1,
//       label: `Edition - ${formatDateToString(nextWeek)}`,
//       date: formatDateToString(nextWeek),
//     },
//     {
//       id: 2,
//       label: `Edition - ${formatDateToString(twoWeeks)}`,
//       date: formatDateToString(twoWeeks),
//     },
//   ];
// };

onMounted(() => {
  loadAllPlayers();
});
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
