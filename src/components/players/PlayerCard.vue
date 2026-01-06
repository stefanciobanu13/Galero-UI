<template>
  <v-card class="rounded-xl shadow-lg hover:shadow-2xl transition-shadow h-full flex flex-column">
    <!-- Card Header with Color Bar -->
    <div class="bg-gradient-primary h-24 rounded-t-xl" />
    
    <v-card-text class="pa-lg flex-1 flex flex-column gap-md">
      <!-- Player Name -->
      <div class="text-center">
        <p class="text-sm text-grey-500 mb-xs">Player Profile</p>
        <h2 class="text-2xl text-bold text-primary">
          {{ player.firstName }} {{ player.lastName }}
        </h2>
      </div>

      <!-- Divider -->
      <v-divider class="my-md" />

      <!-- Stats Section -->
      <div class="flex flex-column gap-lg flex-1">
        <!-- Grade Stat -->
        <div class="flex flex-column gap-xs">
          <label class="text-xs text-bold text-grey-600 uppercase tracking-wide">Grade</label>
          <div class="flex align-center gap-sm">
            <v-icon color="primary" size="sm">mdi-medal</v-icon>
            <span class="text-2xl text-bold text-primary">{{ player.grade }}</span>
          </div>
        </div>

        <!-- Placeholder Stats (can be connected to real data) -->
        <div class="grid grid-cols-2 gap-md">
          <div class="bg-primary-lighter rounded-lg pa-md text-center">
            <p class="text-xs text-grey-600 mb-xs">Goals</p>
            <p class="text-2xl text-bold text-primary">--</p>
          </div>
          <div class="bg-success-lighter rounded-lg pa-md text-center">
            <p class="text-xs text-grey-600 mb-xs">Matches</p>
            <p class="text-2xl text-bold text-success">--</p>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Card Actions -->
    <v-card-actions v-if="isAdmin" class="px-lg pb-lg gap-sm justify-between">
      <v-btn
        size="small"
        color="warning"
        variant="outlined"
        prepend-icon="mdi-chart-line"
        @click="$emit('view-stats', player)"
        class="rounded-full flex-1"
      >
        Stats
      </v-btn>
      <v-btn
        size="small"
        color="info"
        variant="outlined"
        prepend-icon="mdi-pencil"
        @click="$emit('edit', player)"
        class="rounded-full flex-1"
      >
        Edit
      </v-btn>
      <v-btn
        size="small"
        color="error"
        variant="outlined"
        prepend-icon="mdi-delete"
        @click="$emit('delete', player)"
        class="rounded-full flex-1"
      >
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Player } from '../../types';

interface Props {
  player: Player;
  isAdmin?: boolean;
}

withDefaults(defineProps<Props>(), {
  isAdmin: false,
});

defineEmits<{
  'edit': [player: Player];
  'delete': [player: Player];
  'view-stats': [player: Player];
}>();
</script>
