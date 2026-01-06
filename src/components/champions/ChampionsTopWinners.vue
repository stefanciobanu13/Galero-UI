<template>
  <v-card elevation="0" class="rounded-xl border w-100">
    <v-card-title class="d-flex align-center gap-2 text-subtitle-1 text-sm-h6 pa-4">
      <v-icon color="primary">mdi-trophy</v-icon>
      <span class="font-weight-bold">{{ title }}</span>
    </v-card-title>

    <v-card-text class="pa-2 pa-sm-4">
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="primary"
        size="40"
        class="d-block mx-auto my-8"
      />

      <v-alert v-else-if="!winners || winners.length === 0" type="info" density="compact" variant="tonal">
        No winners data available yet.
      </v-alert>

      <div v-else>
        <div class="top-3-container">
          <div v-if="winners.length > 1" class="top-winner second-place">
            <div class="medal-badge">🥈</div>
            <div class="winner-info">
              <div class="player-name">{{ winners[1]?.firstName }}</div>
              <div class="wins-count text-primary">{{ winners[1]?.editionWinsCount }}</div>
              <div class="wins-label">Win{{ winners[1]?.editionWinsCount === 1 ? '' : 's' }}</div>
            </div>
          </div>

          <div v-if="winners.length > 0" class="top-winner first-place">
            <div class="medal-badge">🥇</div>
            <div class="winner-info">
              <div class="player-name">{{ winners[0]?.firstName }}</div>
              <div class="wins-count text-primary">{{ winners[0]?.editionWinsCount }}</div>
              <div class="wins-label">Win{{ winners[0]?.editionWinsCount === 1 ? '' : 's' }}</div>
            </div>
          </div>

          <div v-if="winners.length > 2" class="top-winner third-place">
            <div class="medal-badge">🥉</div>
            <div class="winner-info">
              <div class="player-name">{{ winners[2]?.firstName }}</div>
              <div class="wins-count text-primary">{{ winners[2]?.editionWinsCount }}</div>
              <div class="wins-label">Win{{ winners[2]?.editionWinsCount === 1 ? '' : 's' }}</div>
            </div>
          </div>
        </div>

        <div v-if="winners.length > 3" class="mt-4 overflow-hidden">
          <v-divider class="mb-4" />
          <div class="table-responsive">
            <v-data-table
              :headers="tableHeaders"
              :items="winners.slice(3)"
              density="compact"
              hide-default-footer
              class="bg-transparent custom-table"
            >
              <template #item.rank="{ index }">
                <span class="font-weight-bold text-grey-darken-1">{{ index + 4 }}</span>
              </template>
              <template #item.player="{ item }">
                <span class="text-truncate d-inline-block font-weight-medium" style="max-width: 120px;">
                  {{ item.firstName }} {{ item.lastName }}
                </span>
              </template>
              <template #item.wins="{ item }">
                <span class="font-weight-bold text-primary">{{ item.editionWinsCount }}</span>
              </template>
              <template #item.rate="{ item }">
                <v-chip
                  size="x-small"
                  :color="getWinRateColor(item.editionWinsCount, item.editionsPlayedCount)"
                  class="font-weight-bold"
                >
                  {{ getWinRate(item.editionWinsCount, item.editionsPlayedCount) }}%
                </v-chip>
              </template>
            </v-data-table>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getWinRate, getWinRateColor } from '../../utils/championUtils';

// Props & Interface rămân la fel...
interface Winner {
  playerId: number; firstName: string; lastName: string;
  editionWinsCount: number; editionsPlayedCount: number;
}
interface Props { title: string; winners: Winner[] | null; isLoading: boolean; }
defineProps<Props>();

const tableHeaders = computed(() => [
  { title: '#', key: 'rank', align: 'center' as const, width: '40px' },
  { title: 'Jucător', key: 'player', align: 'start' as const },
  { title: 'W', key: 'wins', align: 'center' as const, width: '50px' },
  { title: 'Ed.', key: 'editions', align: 'center' as const, width: '50px' },
  { title: '%', key: 'rate', align: 'center' as const, width: '70px' },
]);
</script>

<style scoped lang="scss">
.top-3-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 8px; /* Gap micșorat pentru mobil */
  margin-bottom: 24px;
  height: 220px; /* Înălțime fixă mai mică */
  padding-bottom: 10px;

  @media (min-width: 600px) {
    gap: 24px;
    height: 280px;
  }
}

.top-winner {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1; /* Forțăm lățime egală */
  min-width: 0; /* Important pentru text-truncate */
  padding: 12px 4px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s;

  &.first-place {
    height: 100%;
    order: 2;
    background: linear-gradient(135deg, #fffdf0 0%, #fff9c4 100%);
    border-color: #fde047;
    .medal-badge { font-size: 2.5rem; }
    .wins-count { font-size: 1.5rem; }
  }

  &.second-place {
    height: 85%;
    order: 1;
    .medal-badge { font-size: 2rem; }
  }

  &.third-place {
    height: 75%;
    order: 3;
    .medal-badge { font-size: 2rem; }
  }

  @media (min-width: 600px) {
    padding: 20px;
    &.first-place .medal-badge { font-size: 4rem; }
    &.first-place .wins-count { font-size: 2rem; }
  }
}

.winner-info {
  text-align: center;
  width: 100%;
  overflow: hidden;
}

.player-name {
  font-weight: 700;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (min-width: 600px) {
    font-size: 1rem;
    white-space: normal;
  }
}

.wins-count {
  font-weight: 900;
  font-size: 1.2rem;
  line-height: 1;
}

.wins-label {
  font-size: 0.65rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.custom-table {
  :deep(th) {
    text-transform: uppercase;
    font-size: 0.7rem !important;
    letter-spacing: 0.5px;
    color: #64748b !important;
  }
}
</style>