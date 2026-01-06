<template>
  <v-card elevation="0" class="rounded-xl border w-100">
    <v-card-title class="d-flex align-center gap-2 text-subtitle-1 text-sm-h6 pa-4">
      <v-icon color="orange-darken-2">mdi-soccer</v-icon>
      <span class="font-weight-bold">{{ title }}</span>
    </v-card-title>

    <v-card-text class="pa-2 pa-sm-4">
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="orange"
        size="40"
        class="d-block mx-auto my-8"
      />

      <v-alert v-else-if="!scorers || scorers.length === 0" type="info" density="compact" variant="tonal">
        Nu există date despre marcatori.
      </v-alert>

      <div v-else class="table-container">
        <v-data-table
          :headers="tableHeaders"
          :items="scorers"
          density="compact"
          hide-default-footer
          class="bg-transparent custom-scorers-table"
        >
          <template #item.rank="{ index }">
            <div class="rank-wrapper">
              <span class="rank-emoji" :class="`rank-${index}`">
                {{ getRankEmoji(index) }}
              </span>
            </div>
          </template>

          <template #item.player="{ item, index }">
            <div class="player-info py-1">
              <span class="player-name text-truncate">{{ item.firstName }} {{ item.lastName }}</span>
              <span class="text-grey-darken-1 text-caption font-weight-light">#{{ index + 1 }}</span>
            </div>
          </template>

          <template #item.goals="{ item }">
            <div class="text-center d-flex align-center justify-center">
              <span class="font-weight-black text-body-1">{{ item.totalGoals }}</span>
              <span class="text-caption ml-1">⚽</span>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getRankEmoji } from '../../utils/championUtils';

interface Scorer {
  playerId: number;
  firstName: string;
  lastName: string;
  totalGoals: number;
}

interface Props {
  title: string;
  scorers: Scorer[] | null;
  isLoading: boolean;
}

defineProps<Props>();

const tableHeaders = computed(() => [
  { title: '#', key: 'rank', align: 'center' as const, width: '45px', sortable: false },
  { title: 'Jucător', key: 'player', align: 'start' as const },
  { title: 'Goluri', key: 'goals', align: 'center' as const, width: '80px' },
]);
</script>

<style scoped lang="scss">
.table-container {
  width: 100%;
  overflow-x: hidden; /* Evităm scroll-ul dacă nu e absolut necesar */
}

.custom-scorers-table {
  :deep(th) {
    text-transform: uppercase;
    font-size: 0.7rem !important;
    letter-spacing: 0.5px;
    font-weight: 700 !important;
    color: #64748b !important;
    border-bottom: 1px solid #f1f5f9 !important;
  }

  :deep(td) {
    border-bottom: 1px solid #f8fafc !important;
    height: 48px !important;
  }
}

.player-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.2;
  min-width: 0; /* Permite text-truncate să funcționeze în flex */
}

.player-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e293b;
  display: block;
  max-width: 140px; /* Previne împingerea coloanelor pe telefoane mici */

  @media (min-width: 600px) {
    max-width: none;
    font-size: 1rem;
  }
}

.rank-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-emoji {
  font-size: 1.25rem;
  
  @media (min-width: 600px) {
    font-size: 1.5rem;
  }

  &.rank-0 {
    filter: drop-shadow(0 0 2px rgba(255, 165, 0, 0.4));
  }
}

/* Reducem padding-ul celulelor pe mobil pentru a câștiga spațiu */
:deep(.v-data-table__td) {
  padding: 0 8px !important;
}
</style>