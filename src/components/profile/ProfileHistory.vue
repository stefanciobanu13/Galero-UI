<template>
  <div class="mb-lg">
    <h2 class="text-lg text-bold text-grey-900 mb-md flex align-center gap-sm">
      <v-icon size="24" color="primary">mdi-history</v-icon>
      Edition History
    </h2>

    <div v-if="isLoading" class="flex justify-center py-md">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <div v-else-if="history.length > 0" class="rounded-lg bg-gradient-to-br from-grey-50 to-grey-100 p-md shadow-md">
      <!-- Scrollable history grid -->
      <div class="overflow-x-auto">
        <div class="flex gap-sm pb-sm" style="min-width: min-content;">
          <div
            v-for="(edition, idx) in history"
            :key="idx"
            class="flex-shrink-0 p-sm rounded-md bg-white shadow-sm border text-center"
            :class="placementBorderClass(edition.placement)"
            style="min-width: 100px;"
          >
            <p class="text-xs text-grey-600 font-bold mb-sm">Ed {{ edition.editionNumber }}</p>
            <div class="text-2xl mb-sm">{{ placementEmoji(edition.placement) }}</div>
            <p class="text-xs text-grey-700 font-bold">{{ placementLabel(edition.placement) }}</p>
            <p class="text-xs text-grey-500 mt-xs">{{ formatDate(edition.date) }}</p>
          </div>
        </div>
      </div>

      <!-- Summary stats -->
      <v-divider class="my-md" />
      <v-row class="gap-sm mt-md">
        <v-col cols="6" sm="3">
          <div class="text-center p-sm rounded-md bg-yellow-50 border text-xs border-yellow-200">
            <p class="text-xl text-bold text-warning">{{ podiumCount }}</p>
            <p class="text-xs text-grey-600 font-bold">Podium</p>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="text-center p-sm rounded-md bg-info-50 border text-xs border-info-200">
            <p class="text-xl text-bold text-info">{{ topThreePercent }}%</p>
            <p class="text-xs text-grey-600 font-bold">Top 3</p>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="text-center p-sm rounded-md bg-success-50 border text-xs border-success-200">
            <p class="text-xl text-bold text-success">{{ avgRank }}</p>
            <p class="text-xs text-grey-600 font-bold">Avg Rank</p>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="text-center p-sm rounded-md bg-grey-100 border text-xs border-grey-300">
            <p class="text-xl text-bold text-grey-700">{{ history.length }}</p>
            <p class="text-xs text-grey-600 font-bold">Editions</p>
          </div>
        </v-col>
      </v-row>
    </div>

    <div v-else class="flex align-center gap-sm p-md rounded-lg bg-warning-lighter border border-warning text-sm">
      <v-icon color="warning" size="24">mdi-information</v-icon>
      <div>
        <p class="text-xs text-bold text-grey-900">No history yet</p>
        <p class="text-xs text-grey-600">Placements will appear here</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface EditionHistoryEntry {
  editionNumber: number;
  placement: number;
  date: string;
}

interface Props {
  history: EditionHistoryEntry[];
  isLoading: boolean;
}

const props = defineProps<Props>();

const podiumCount = computed(() => {
  return props.history.filter(e => e.placement <= 3).length;
});

const topThreePercent = computed(() => {
  if (props.history.length === 0) return 0;
  return Math.round((podiumCount.value / props.history.length) * 100);
});

const avgRank = computed(() => {
  if (props.history.length === 0) return 0;
  const sum = props.history.reduce((acc, e) => acc + e.placement, 0);
  return (sum / props.history.length).toFixed(1);
});

const placementEmoji = (placement: number) => {
  switch (placement) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '⭐';
  }
};

const placementLabel = (placement: number) => {
  switch (placement) {
    case 1: return '1st Place';
    case 2: return '2nd Place';
    case 3: return '3rd Place';
    default: return `${placement}th Place`;
  }
};

const placementBorderClass = (placement: number) => {
  switch (placement) {
    case 1: return 'border-yellow-400';
    case 2: return 'border-grey-400';
    case 3: return 'border-orange-300';
    default: return 'border-blue-400';
  }
};

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};
</script>
