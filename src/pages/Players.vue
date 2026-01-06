<template>
  <v-container class="pa-lg">
    <!-- Header Section -->
    <div class="mb-2xl">
      <h1 class="text-4xl text-bold text-primary mb-lg">{{ t('pages.players.title') }}</h1>
      <p class="text-lg text-grey-600">Manage and view player statistics</p>
    </div>

    <!-- Search & Filter Bar -->
    <v-card class="rounded-xl shadow-lg mb-2xl">
      <v-card-text class="pa-lg">
        <v-row class="gap-lg align-center">
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-text-field
              v-model="searchFirstName"
              :label="t('pages.addPlayer.firstName')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="rounded-lg"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-text-field
              v-model="searchLastName"
              :label="t('pages.addPlayer.lastName')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="rounded-lg"
            />
          </v-col>
          <v-col cols="12" md="4" lg="auto" class="flex items-end">
            <v-btn
              v-if="authStore.isAdmin"
              color="success"
              prepend-icon="mdi-plus"
              size="large"
              @click="openAddDialog"
              class="rounded-full w-full"
            >
              {{ t('pages.players.addNew') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Error Alert -->
    <v-alert
      v-if="playerStore.error"
      type="error"
      dismissible
      closable
      class="rounded-lg mb-2xl"
    >
      {{ playerStore.error }}
    </v-alert>

    <!-- Players List Component -->
    <PlayerList
      :players="playerStore.players"
      :is-admin="authStore.isAdmin"
      :loading="playerStore.loading"
      @edit="handleEditPlayer"
      @delete="handleDeletePlayer"
      @view-stats="handleViewStats"
    >
      <template #empty-action>
        <v-btn
          v-if="authStore.isAdmin"
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          @click="openAddDialog"
          class="rounded-full"
        >
          Add First Player
        </v-btn>
      </template>
    </PlayerList>

    <!-- Add/Edit Player Dialog -->
    <PlayerForm
      v-model="showFormDialog"
      :is-edit="isEditingPlayer"
      :player="selectedPlayer"
      :loading="playerStore.loading"
      @save="handleSavePlayer"
      @cancel="handleCancelForm"
    />

    <!-- Delete Confirmation Dialog -->
    <PlayerDeleteDialog
      v-model="showDeleteDialog"
      :player="selectedPlayer"
      :loading="playerStore.loading"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />

    <!-- Player Statistics Dialog -->
    <PlayerStatsDialog
      v-model="showStatsDialog"
      :player="selectedPlayer"
      :stats="playerStatsDetail.stats.value"
      :goals-per-match="playerStatsDetail.goalsPerMatch.value"
      :loading="playerStatsDetail.isLoading.value"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayerManagement } from '../composables/usePlayerManagement';
import { usePlayerStatsDetail } from '../composables/usePlayerStatsDetail';
import { useAuthStore } from '../stores/auth';
import PlayerList from '../components/players/PlayerList.vue';
import PlayerForm from '../components/players/PlayerForm.vue';
import PlayerDeleteDialog from '../components/players/PlayerDeleteDialog.vue';
import PlayerStatsDialog from '../components/players/PlayerStatsDialog.vue';
import type { Player } from '../types';

const { t } = useI18n();
const authStore = useAuthStore();

const {
  searchFirstName,
  searchLastName,
  selectedPlayer,
  playerStore,
  loadPlayers,
  saveEdit,
  confirmDelete,
  cancelEdit,
  cancelDelete,
} = usePlayerManagement();

// ===== PLAYER STATS COMPOSABLE =====
const playerStatsDetail = usePlayerStatsDetail(selectedPlayer);

// ===== DIALOG STATE =====
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const showStatsDialog = ref(false);
const isEditingPlayer = ref(false);

// ===== EVENT HANDLERS =====
const openAddDialog = () => {
  isEditingPlayer.value = false;
  selectedPlayer.value = null;
  showFormDialog.value = true;
};

const handleEditPlayer = (player: Player) => {
  selectedPlayer.value = player;
  isEditingPlayer.value = true;
  showFormDialog.value = true;
};

const handleDeletePlayer = (player: Player) => {
  selectedPlayer.value = player;
  showDeleteDialog.value = true;
};

const handleViewStats = (player: Player) => {
  selectedPlayer.value = player;
  showStatsDialog.value = true;
  // Load stats from API when dialog opens
  playerStatsDetail.loadPlayerStats();
};

const handleSavePlayer = async (formData: any) => {
  if (isEditingPlayer.value && selectedPlayer.value?.playerId) {
    // Update existing player
    selectedPlayer.value.firstName = formData.firstName;
    selectedPlayer.value.lastName = formData.lastName;
    selectedPlayer.value.grade = formData.grade;
    await saveEdit();
  }
  showFormDialog.value = false;
};

const handleCancelForm = () => {
  showFormDialog.value = false;
  cancelEdit();
};

const handleConfirmDelete = async () => {
  if (selectedPlayer.value?.playerId) {
    await confirmDelete();
    showDeleteDialog.value = false;
  }
};

const handleCancelDelete = () => {
  showDeleteDialog.value = false;
  cancelDelete();
};

// ===== LIFECYCLE =====
onMounted(() => {
  loadPlayers();
});
</script>

