<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h5">
            Players
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="searchFirstName"
                  label="Search by First Name"
                  prepend-icon="mdi-magnify"
                  clearable
                  @update:model-value="handleSearch"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="searchLastName"
                  label="Search by Last Name"
                  prepend-icon="mdi-magnify"
                  clearable
                  @update:model-value="handleSearch"
                />
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-refresh"
                  @click="loadPlayers"
                  :loading="playerStore.loading"
                >
                  Reset
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="playerStore.error" class="mb-6">
      <v-col cols="12">
        <v-alert
          type="error"
          dismissible
          closable
        >
          {{ playerStore.error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table-virtual
          :headers="headers"
          :items="playerStore.players"
          :loading="playerStore.loading"
          item-key="playerId"
          height="600"
          class="elevation-1"
        >
          <template #item.actions="{ item }">
            <v-btn
              v-if="authStore.isAdmin"
              size="small"
              color="info"
              variant="text"
              icon="mdi-pencil"
              @click="editPlayer(item)"
            />
            <v-btn
              v-if="authStore.isAdmin"
              size="small"
              color="error"
              variant="text"
              icon="mdi-delete"
              @click="deletePlayer(item.playerId)"
            />
          </template>

          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-soccer</v-icon>
              <p class="text-h6 text-grey">No players found</p>
              <p class="text-body2 text-grey">Start by adding some players to the competition</p>
            </div>
          </template>
        </v-data-table-virtual>
      </v-col>
    </v-row>

    <!-- Edit Player Dialog -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card v-if="selectedPlayer">
        <v-card-title>Edit Player</v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="saveEdit">
            <v-text-field
              v-model="selectedPlayer.firstName"
              label="First Name"
              required
              class="mb-4"
            />
            <v-text-field
              v-model="selectedPlayer.lastName"
              label="Last Name"
              required
              class="mb-4"
            />
            <v-text-field
              v-model.number="selectedPlayer.grade"
              label="Grade"
              type="number"
              step="0.1"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveEdit" :loading="playerStore.loading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Player</v-card-title>
        <v-card-text>
          Are you sure you want to delete this player? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="playerStore.loading">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useAuthStore } from '../stores/auth';
import { Player } from '../types';

const playerStore = usePlayerStore();
const authStore = useAuthStore();
const searchFirstName = ref('');
const searchLastName = ref('');
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedPlayer = ref<Player | null>(null);
const playerToDelete = ref<number | null>(null);

const headers = computed(() => {
  const baseHeaders = [
    { title: 'First Name', value: 'firstName', sortable: true },
    { title: 'Last Name', value: 'lastName', sortable: true },
    { title: 'Grade', value: 'grade', sortable: true },
  ];

  if (authStore.isAdmin) {
    baseHeaders.push({ title: 'Actions', value: 'actions', sortable: false, align: 'center' });
  }

  return baseHeaders;
});

onMounted(() => {
  loadPlayers();
});

const loadPlayers = () => {
  searchFirstName.value = '';
  searchLastName.value = '';
  playerStore.fetchPlayers();
};

const handleSearch = () => {
  playerStore.searchPlayers(searchFirstName.value, searchLastName.value);
};

const editPlayer = (player: Player) => {
  selectedPlayer.value = { ...player };
  showEditDialog.value = true;
};

const saveEdit = async () => {
  if (selectedPlayer.value && selectedPlayer.value.playerId) {
    try {
      await playerStore.updatePlayer(selectedPlayer.value.playerId, selectedPlayer.value);
      showEditDialog.value = false;
      selectedPlayer.value = null;
    } catch {
      // Error is handled by store
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
    } catch {
      // Error is handled by store
    }
  }
};
</script>

<style scoped>
</style>
