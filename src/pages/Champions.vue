<template>
  <v-container class="champions-page py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">🏆 {{ t('pages.champions.title') }}</h1>
        <p class="text-body2 text-grey">{{ t('pages.champions.topWinners') }} & {{ t('pages.champions.topScorers') }}</p>
      </v-col>
    </v-row>

    <!-- Top Edition Winners -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center gap-2">
            <v-icon color="primary">mdi-trophy</v-icon>
            <span>{{ t('pages.champions.topWinners') }}</span>
          </v-card-title>
          <v-card-text>
            <v-progress-circular
              v-if="isLoadingWinners"
              indeterminate
              color="primary"
              class="d-block mx-auto"
            />
            <div v-else-if="topWinners.length > 0" class="table-container">
              <table class="responsive-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Wins</th>
                    <th>Editions</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(winner, index) in topWinners" :key="winner.playerId">
                    <td class="rank font-weight-bold">
                      <span v-if="index === 0">🥇</span>
                      <span v-else-if="index === 1">🥈</span>
                      <span v-else-if="index === 2">🥉</span>
                      <span v-else>{{ index + 1 }}</span>
                    </td>
                    <td class="player-name">{{ winner.firstName }} {{ winner.lastName }}</td>
                    <td class="text-center font-weight-bold text-primary">{{ winner.editionWinsCount }}</td>
                    <td class="text-center">{{ winner.editionsPlayedCount }}</td>
                    <td class="text-center">
                      <v-chip
                        size="small"
                        :color="getWinRateColor(winner.editionWinsCount, winner.editionsPlayedCount)"
                        text-color="white"
                      >
                        {{ getWinRate(winner.editionWinsCount, winner.editionsPlayedCount) }}%
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <v-alert v-else type="info">
              No winners data available yet.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- All-Time Top Scorers -->
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center gap-2">
            <v-icon color="orange">mdi-soccer</v-icon>
            <span>{{ t('pages.champions.topScorers') }}</span>
          </v-card-title>
          <v-card-text>
            <v-progress-circular
              v-if="isLoadingScorers"
              indeterminate
              color="primary"
              class="d-block mx-auto"
            />
            <div v-else-if="topScorers.length > 0" class="table-container">
              <table class="responsive-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Goals</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(scorer, index) in topScorers" :key="scorer.playerId">
                    <td class="rank font-weight-bold">
                      <span v-if="index === 0">🥇</span>
                      <span v-else-if="index === 1">🥈</span>
                      <span v-else-if="index === 2">🥉</span>
                      <span v-else>{{ index + 1 }}</span>
                    </td>
                    <td class="player-name">{{ scorer.firstName }} {{ scorer.lastName }}</td>
                    <td class="text-center font-weight-bold text-orange">{{ scorer.totalGoals }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <v-alert v-else type="info">
              No scorers data available yet.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { championsService } from '../services/api';

const { t } = useI18n();

const topWinners = ref<Array<{
  playerId: number;
  firstName: string;
  lastName: string;
  grade: number;
  editionWinsCount: number;
  editionsPlayedCount: number;
}>>([]);

const topScorers = ref<Array<{
  playerId: number;
  firstName: string;
  lastName: string;
  totalGoals: number;
}>>([]);

const isLoadingWinners = ref(false);
const isLoadingScorers = ref(false);

const colorMap: Record<string, string> = {
  green: '#4CAF50',
  orange: '#FF9800',
  gray: '#9E9E9E',
  blue: '#2196F3',
};

const getColorValue = (color: string): string => {
  return colorMap[color] || '#000';
};

const getWinRate = (wins: number, matches: number): string => {
  if (matches === 0) return '0';
  return Math.round((wins / matches) * 100).toString();
};

const getWinRateColor = (wins: number, matches: number): string => {
  const rate = matches === 0 ? 0 : (wins / matches) * 100;
  if (rate >= 75) return 'success';
  if (rate >= 50) return 'warning';
  return 'error';
};

const loadTopWinners = async () => {
  isLoadingWinners.value = true;
  try {
    const response = await championsService.getTopEditionWinners(10);
    topWinners.value = response.data;
  } catch (error) {
    console.error('Failed to load top winners:', error);
  } finally {
    isLoadingWinners.value = false;
  }
};

const loadTopScorers = async () => {
  isLoadingScorers.value = true;
  try {
    const response = await championsService.getAllTimeTopScorers(10);
    topScorers.value = response.data;
  } catch (error) {
    console.error('Failed to load top scorers:', error);
  } finally {
    isLoadingScorers.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    loadTopWinners(),
    loadTopScorers(),
  ]);
});
</script>

<style scoped>
.champions-page {
  padding: 20px;
}

h1 {
  color: #1976d2;
}

.grid-template-columns-repeat-3 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

@media (max-width: 960px) {
  .grid-template-columns-repeat-3 {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 600px) {
  .grid-template-columns-repeat-3 {
    grid-template-columns: 1fr;
  }
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.responsive-table thead {
  background-color: #f5f5f5;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.responsive-table th {
  padding: 12px 8px;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.responsive-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #eee;
}

.responsive-table tbody tr:hover {
  background-color: #f9f9f9;
}

.responsive-table .rank {
  width: 50px;
  text-align: center;
}

.responsive-table .player-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .responsive-table {
    font-size: 13px;
  }

  .responsive-table th {
    padding: 8px 4px;
    font-size: 11px;
  }

  .responsive-table td {
    padding: 8px 4px;
  }

  .responsive-table .player-name {
    max-width: 150px;
  }
}

@media (max-width: 430px) {
  .responsive-table {
    font-size: 12px;
  }

  .responsive-table th {
    padding: 6px 2px;
    font-size: 10px;
  }

  .responsive-table td {
    padding: 6px 2px;
  }

  .responsive-table .rank {
    width: 35px;
    font-size: 11px;
  }

  .responsive-table .player-name {
    max-width: 120px;
    font-size: 12px;
  }
}
</style>
