<template>
  <v-dialog v-model="isOpen" persistent width="600" @update:model-value="handleDialogClose">
    <v-card>
      <v-card-title class="text-h6 d-flex align-center gap-2">
        <v-icon>mdi-account-search</v-icon>
        Select Your Player
      </v-card-title>

      <v-card-text>
        <p class="text-body2 mb-6 text-grey-darken-1">
          To proceed, please select the player profile you are associated with.
        </p>

        <v-select
          v-model="selectedPlayerId"
          :items="playerOptions"
          item-title="label"
          item-value="value"
          label="Choose a player"
          prepend-icon="mdi-soccer"
          :loading="isLoadingPlayers"
          :disabled="isLoadingPlayers || isAssigning"
          variant="outlined"
          class="mb-4"
        />

        <v-text-field
          v-model="searchQuery"
          label="Search players..."
          prepend-icon="mdi-magnify"
          variant="outlined"
          clearable
          @input="filterPlayers"
          :disabled="isAssigning"
          class="mb-4"
        />

        <div v-if="filteredPlayersList.length > 0" class="player-list mt-4">
          <v-card
            v-for="player in filteredPlayersList"
            :key="player.playerId"
            variant="outlined"
            class="mb-2 cursor-pointer hover-card"
            :class="{ 'border-primary': selectedPlayerId === player.playerId }"
            @click="selectedPlayerId = player.playerId"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="font-weight-bold mb-0">
                    {{ player.firstName }} {{ player.lastName }}
                  </p>
                  <p class="text-body2 text-grey mb-0">
                    Grade: {{ player.grade }}
                  </p>
                </div>
                <v-radio
                  :model-value="selectedPlayerId"
                  :value="player.playerId"
                  @update:model-value="selectedPlayerId = $event"
                />
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-alert
          v-if="!isLoadingPlayers && filteredPlayersList.length === 0 && players.length > 0"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          No players match your search
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleSkip"
          :disabled="isAssigning"
        >
          Skip for Now
        </v-btn>
        <v-btn
          color="primary"
          variant="raised"
          @click="handleAssign"
          :loading="isAssigning"
          :disabled="!selectedPlayerId || isAssigning"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { playerService } from '../services/api';
import type { Player } from '../types';

interface Props {
  open: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'player-selected': [playerId: number];
  'skip': [];
}>();

const authStore = useAuthStore();
const isOpen = ref(props.open);
const selectedPlayerId = ref<number | null>(null);
const players = ref<Player[]>([]);
const searchQuery = ref('');
const isLoadingPlayers = ref(false);
const isAssigning = ref(false);
const errorMessage = ref('');

const playerOptions = computed(() => {
  return players.value.map(player => ({
    label: `${player.firstName} ${player.lastName} (Grade ${player.grade})`,
    value: player.playerId || 0,
  }));
});

const filteredPlayersList = computed(() => {
  if (!searchQuery.value) {
    return players.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return players.value.filter(player => 
    `${player.firstName} ${player.lastName}`.toLowerCase().includes(query) ||
    player.grade.toString().includes(query)
  );
});

const loadPlayers = async () => {
  isLoadingPlayers.value = true;
  errorMessage.value = '';
  
  try {
    const response = await playerService.getAll();
    players.value = response.data;
  } catch (error) {
    console.error('Failed to load players:', error);
    errorMessage.value = 'Failed to load available players. Please try again.';
  } finally {
    isLoadingPlayers.value = false;
  }
};

const filterPlayers = () => {
  // Filtering is handled by computed property
};

const handleAssign = async () => {
  if (!selectedPlayerId.value) {
    errorMessage.value = 'Please select a player';
    return;
  }

  isAssigning.value = true;
  errorMessage.value = '';

  try {
    await authStore.assignPlayer(selectedPlayerId.value);
    emit('player-selected', selectedPlayerId.value);
    props.onComplete?.();
    isOpen.value = false;
  } catch (error) {
    console.error('Failed to assign player:', error);
    errorMessage.value = 'Failed to assign player. Please try again.';
  } finally {
    isAssigning.value = false;
  }
};

const handleSkip = () => {
  emit('skip');
  props.onSkip?.();
  isOpen.value = false;
};

const handleDialogClose = (value: boolean) => {
  isOpen.value = value;
  emit('update:open', value);
};

watch(() => props.open, (newValue) => {
  isOpen.value = newValue;
});

onMounted(() => {
  loadPlayers();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.hover-card {
  transition: all 0.2s;
}

.hover-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgb(var(--v-theme-primary)) !important;
}

.border-primary {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}

.player-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
