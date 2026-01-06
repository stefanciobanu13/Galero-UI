<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center align-center py-4xl">
      <v-progress-circular indeterminate color="primary" size="80" />
    </div>

    <!-- Empty State -->
    <div v-else-if="players.length === 0" class="text-center py-4xl">
      <v-icon size="120" color="grey-300" class="mb-lg">mdi-soccer</v-icon>
      <p class="text-2xl text-bold text-grey-600 mb-sm">No players found</p>
      <p class="text-lg text-grey-500 mb-2xl">Add your first player to get started</p>
      <slot name="empty-action" />
    </div>

    <!-- Players Grid -->
    <v-row v-else class="gap-lg">
      <v-col
        v-for="player in players"
        :key="player.playerId"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <PlayerCard
          :player="player"
          :is-admin="isAdmin"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @view-stats="$emit('view-stats', $event)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import PlayerCard from './PlayerCard.vue';
import type { Player } from '../../types';

interface Props {
  players: Player[];
  isAdmin?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isAdmin: false,
  loading: false,
});

defineEmits<{
  'edit': [player: Player];
  'delete': [player: Player];
  'view-stats': [player: Player];
}>();
</script>
