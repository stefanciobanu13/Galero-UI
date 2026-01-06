<template>
  <v-dialog v-model="isOpen" persistent width="600" @update:model-value="handleDialogClose">
    <v-card>
      <v-card-title class="text-xl text-bold py-lg px-lg bg-primary text-white d-flex align-center gap-md rounded-t-lg">
        <v-icon>mdi-account-search</v-icon>
        Select Your Player
      </v-card-title>

      <v-card-text class="py-lg px-lg">
        <p class="text-base text-muted mb-lg">
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
          class="mb-md rounded-md"
        />

        <v-text-field
          v-model="searchQuery"
          label="Search players..."
          prepend-icon="mdi-magnify"
          variant="outlined"
          clearable
          @input="filterPlayers"
          :disabled="isAssigning"
          class="mb-md rounded-md"
        />

        <div v-if="filteredPlayersList.length > 0" class="overflow-y-auto" style="max-height: 400px">
          <v-card
            v-for="player in filteredPlayersList"
            :key="player.playerId"
            variant="outlined"
            class="mb-sm cursor-pointer transition-all rounded-md"
            :class="{ 'border-2 bg-grey-50 border-primary': selectedPlayerId === player.playerId }"
            @click="selectedPlayerId = player.playerId || null"
            @mouseenter="$event.currentTarget.classList.add('shadow-md')"
            @mouseleave="selectedPlayerId !== player.playerId && $event.currentTarget.classList.remove('shadow-md')"
          >
            <v-card-text class="p-md">
              <div class="flex flex-between align-center">
                <div>
                  <p class="text-base text-bold mb-0">
                    {{ player.firstName }} {{ player.lastName }}
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
          class="mt-md rounded-md"
        >
          No players match your search
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-md rounded-md"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="py-md px-lg gap-md justify-end">

        <v-btn
          color="primary"
          variant="elevated"
          @click="handleAssign"
          :loading="isAssigning"
          :disabled="!selectedPlayerId || isAssigning"
          class="px-lg rounded-full"
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
import { playerService } from '../services/playerService';
import type { Player } from '../types/index';


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
    label: `${player.firstName} ${player.lastName}`,
    value: player.playerId || 0,
  }));
});

const filteredPlayersList = computed(() => {
  if (!searchQuery.value) {
    return players.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return players.value.filter((player: { firstName: any; lastName: any; grade: { toString: () => string | string[]; }; }) => 
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

