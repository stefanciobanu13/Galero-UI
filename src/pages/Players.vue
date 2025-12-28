<template>
  <v-container class="py-3">
    <v-row class="mb-1">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h5">
            {{ t('pages.players.title') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="9" sm="2" md="1">
                <v-text-field
                  class="inputFields"
                  v-model="searchFirstName"
                  :label="t('pages.addPlayer.firstName')"
                  prepend-icon="mdi-magnify"
                  clearable
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="9" sm="2" md="1">
                <v-text-field
                  class="inputFields"
                  v-model="searchLastName"
                  :label="t('pages.addPlayer.lastName')"
                  prepend-icon="mdi-magnify"
                  clearable
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="9" md="2" class="d-flex align-center gap-5" style="padding-top: 8px; gap: 8%;">
                <v-btn
                  color="success"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  size="x-small"
                  @click="addPlayer"
                >
                  {{ t('pages.players.addNew') }}
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
            <div class="d-flex gap-1">
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
            </div>
          </template>

          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-soccer</v-icon>
              <p class="text-h6 text-grey">{{ t('pages.players.noPlayers') }}</p>
              <p class="text-body2 text-grey">{{ t('pages.addPlayer.title') }}</p>
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
              class="mb-1"
            />
            <v-text-field
              v-model="selectedPlayer.lastName"
              label="Last Name"
              required
              class="mb-1"
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

    <!-- Add Player Dialog -->
    <v-dialog v-model="showAddDialog" max-width="450">
      <v-card class="addPlayerCard" elevation="8">
        <v-card-title class="addPlayerTitle">Add new player</v-card-title>
        <v-card-text class="pt-0">
          <v-form ref="addForm" @submit.prevent="saveNewPlayer">
            <v-text-field
              v-model="newPlayer.firstName"
              placeholder="First Name"
              required
              class="styledInput mb-4"
              hide-details
              variant="underlined"
              density="compact"
            />
            <v-text-field
              v-model="newPlayer.lastName"
              placeholder="Last Name"
              required
              class="styledInput mb-4"
              hide-details
              variant="underlined"
              density="compact"
            />
            <v-text-field
              v-model.number="newPlayer.grade"
              placeholder="Grade"
              type="number"
              step="0.1"
              required
              class="styledInput mb-6"
              hide-details
              variant="underlined"
              density="compact"
            />
            <div class="buttonContainer">
              <v-btn
                color="primary"
                @click="saveNewPlayer"
                :loading="playerStore.loading"
                class="addPlayerBtn"
              >
                Add Player
              </v-btn>
              <v-btn
                color="error"
                @click="showAddDialog = false"
                class="addPlayerBtn cancelBtn"
              >
                Cancel
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayerStore } from '../stores/player';
import { useAuthStore } from '../stores/auth';
import type { Player } from '../types';

const { t } = useI18n();
const playerStore = usePlayerStore();
const authStore = useAuthStore();
const searchFirstName = ref('');
const searchLastName = ref('');
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showAddDialog = ref(false);
const selectedPlayer = ref<Player | null>(null);
const playerToDelete = ref<number | null>(null);

const newPlayer = ref<Partial<Player>>({
  firstName: '',
  lastName: '',
  grade: 0,
});

const allPlayers = ref<Player[]>([]);

// Client-side filtering of players
const filterPlayers = () => {
  const firstNameQuery = (searchFirstName.value || '').toLowerCase();
  const lastNameQuery = (searchLastName.value || '').toLowerCase();
  
  const filtered = allPlayers.value.filter(player => {
    const firstName = player.firstName.toLowerCase();
    const lastName = player.lastName.toLowerCase();
    
    return firstName.includes(firstNameQuery) && lastName.includes(lastNameQuery);
  });
  
  playerStore.setPlayers(filtered);
};

// Watch for changes in search fields and filter players
watch([searchFirstName, searchLastName], () => {
  filterPlayers();
}, { immediate: false });

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

const loadPlayers = async () => {
  searchFirstName.value = '';
  searchLastName.value = '';
  await playerStore.fetchPlayers();
  // Store all players for client-side filtering
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

const addPlayer = () => {
  newPlayer.value = {
    firstName: '',
    lastName: '',
    grade: 0,
  };
  showAddDialog.value = true;
};

const saveNewPlayer = async () => {
  if (newPlayer.value.firstName && newPlayer.value.lastName && newPlayer.value.grade !== undefined) {
    try {
      await playerStore.createPlayer(newPlayer.value as Player);
      showAddDialog.value = false;
      newPlayer.value = {
        firstName: '',
        lastName: '',
        grade: 0
      };
    } catch {
      // Error is handled by store
    }
  }
};
</script>

<style scoped>
  .inputFields {
    font-size: 0.875rem;
  }

  :deep(.v-data-table__tr) {
    height: 40px !important;
  }

  .addPlayerCard {
    border-radius: 24px !important;
    padding-bottom: 24px;
  }

  :deep(.styledInput .v-field) {
    background-color: transparent;
  }

  :deep(.styledInput .v-field__input) {
    font-size: 0.95rem;
    color: #333;
  }

  :deep(.styledInput .v-field__input::placeholder) {
    color: #363636;
  }

  :deep(.styledInput .v-field__underline::before) {
    border-bottom-width: 1px !important;
  }

  :deep(.styledInput.v-field--focused .v-field__underline::before) {
    border-bottom-width: 1px !important;
  }

  :deep(.styledInput .v-field__underline::after) {
    border-bottom-width: 1px !important;
    transition: none !important;
  }

  :deep(.styledInput.v-field--focused .v-field__underline::after) {
    border-bottom-width: 1px !important;
  }

  .buttonContainer {
    display: flex;
    justify-content: center;
    gap: 50px;
  }

  .addPlayerBtn {
    border-radius: 24px !important;
    height: 40px;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: none;
    width: 140px;
  }

  .cancelBtn {
    margin: 0 !important;
  }

  .addPlayerTitle {
    text-align: center;
    padding-top: 32px;
    padding-bottom: 8px;
    font-size: 1.75rem;
    font-weight: 600;
    color: #1a237e;
  }
</style>
