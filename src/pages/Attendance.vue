<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <!-- Header -->
        <v-card class="mb-lg rounded-lg shadow-lg">
          <v-card-title class="text-2xl text-bold py-lg px-lg bg-primary text-white d-flex align-center gap-md rounded-t-lg">
            <v-icon>mdi-calendar-check</v-icon>
            Attendance Management
          </v-card-title>
          <v-card-text class="py-lg px-lg">
            <p class="text-base text-muted">
              Register attendance for editions. View and manage past attendances.
            </p>
          </v-card-text>
        </v-card>

        <!-- Tabs for New Attendance / Past Attendances -->
        <v-tabs v-model="activeTab" class="mb-lg">
          <v-tab value="new">Add New Attendance</v-tab>
          <v-tab value="past">Past Attendances</v-tab>
        </v-tabs>

        <!-- Add New Attendance Tab -->
        <v-window v-model="activeTab">
          <v-window-item value="new">
            <!-- Edition Information -->
            <v-card class="mb-lg rounded-lg shadow-md">
              <v-card-title class="text-lg text-bold py-lg px-lg">
                Edition Information
              </v-card-title>
              <v-card-text class="py-lg px-lg">
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
                      class="rounded-md"
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
                      class="rounded-md"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Current Attendance Stats -->
            <v-card v-if="selectedEditionDate" class="mb-lg rounded-lg shadow-md">
              <v-card-text class="py-lg px-lg">
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="text-center">
                      <p class="text-xs text-muted">Players Registered</p>
                      <p class="text-4xl text-bold text-primary">
                        {{ attendancePlayers.length }}
                      </p>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Add Player to Attendance -->
            <v-card v-if="selectedEditionDate" class="mb-lg rounded-lg shadow-md">
              <v-card-title class="text-lg text-bold py-lg px-lg">
                Add Player to Attendance
              </v-card-title>
              <v-card-text class="py-lg px-lg">
                <v-row class="gap-md">
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
                      class="rounded-md"
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-btn
                      color="primary"
                      block
                      @click="addPlayerToAttendance"
                      :disabled="!selectedPlayer"
                      :loading="isAddingPlayer"
                      class="h-100 rounded-full"
                      prepend-icon="mdi-plus"
                    >
                      Add Player
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Attendance List -->
            <v-card v-if="selectedEditionDate" class="mb-lg rounded-lg shadow-md">
              <v-card-title class="text-lg text-bold py-lg px-lg">
                Attendance List - Edition {{ editionNumber }} - {{ selectedEditionDate }}
              </v-card-title>

              <v-card-text v-if="attendancePlayers.length === 0" class="text-center text-muted py-xl px-lg">
                No players added yet. Select players above to add them to the attendance list.
              </v-card-text>

              <v-table v-else class="rounded-lg">
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
                        hide-details
                        class="rounded-md"
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
            <v-card class="rounded-lg shadow-md">
              <v-card-title class="text-lg text-bold py-lg px-lg">
                Past Attendances
              </v-card-title>
              <v-card-text class="py-lg px-lg">
                <v-alert v-if="pastAttendances.length === 0" type="info" class="mb-md rounded-md">
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
                      <v-divider class="mb-md" />
                      <p v-if="pastAttendance.attendanceRecords && pastAttendance.attendanceRecords.length === 0" class="text-muted">
                        No players in this attendance
                      </p>
                      <v-list v-else-if="pastAttendance.attendanceRecords">
                        <v-list-item v-for="(record, index) in pastAttendance.attendanceRecords" :key="record.player.playerId">
                          <template #prepend>
                            <span class="text-bold gap-md">{{ index + 1 }}</span>
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
          class="mt-lg rounded-md"
          closable
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-lg rounded-md"
          closable
        >
          {{ errorMessage }}
        </v-alert>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAttendance } from '../hooks/useAttendance';
import { formatDate } from '../utils/dateUtils';

const {
  editionNumber,
  selectedEditionDate,
  selectedPlayer,
  attendancePlayers,
  isAddingPlayer,
  isRemovingPlayer,
  successMessage,
  errorMessage,
  activeTab,
  pastAttendances,
  expandedPanels,
  availablePlayers,
  loadEditionAttendance,
  addPlayerToAttendance,
  removePlayerFromAttendance,
  onPanelExpanded,
} = useAttendance();

</script>


