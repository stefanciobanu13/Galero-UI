<template>
  <v-container class="champions-page py-7">
    <v-row class="mb-1">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-1">🏆 {{ t('pages.champions.title') }}</h1>
      </v-col>
    </v-row>

    <!-- Top Edition Winners -->
    <v-row class="mb-6">
      <v-col cols="12">
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
            <div v-else-if="topWinners.length > 0">
              <!-- Top 3 Winners Display -->
              <div v-if="topWinners.length > 0" class="top-3-container mb-8">
                <!-- Second Place -->
                <div v-if="topWinners.length > 1" class="top-winner second-place">
                  <div class="medal">🥈</div>
                  <div class="winner-info">
                    <div class="rank-number">2</div>
                    <div class="player-name">{{ topWinners[1].firstName }} {{ topWinners[1].lastName }}</div>
                    <div class="wins-count">{{ topWinners[1].editionWinsCount }} {{ topWinners[1].editionWinsCount === 1 ? 'Win' : 'Wins' }} {{ 'of ' + topWinners[1]?.editionsPlayedCount }}</div>
                  </div>
                </div>

                <!-- First Place -->
                <div class="top-winner first-place">
                  <div class="medal">🥇</div>
                  <div class="winner-info">
                    <div class="rank-number">1</div>
                    <div class="player-name">{{ topWinners[0].firstName }} {{ topWinners[0].lastName }}</div>
                    <div class="wins-count">{{ topWinners[0].editionWinsCount }} {{ topWinners[0].editionWinsCount === 1 ? 'Win' : 'Wins' }} {{ 'of ' + topWinners[0]?.editionsPlayedCount }} </div>
                  </div>
                </div>

                <!-- Third Place -->
                <div v-if="topWinners.length > 2" class="top-winner third-place">
                  <div class="medal">🥉</div>
                  <div class="winner-info">
                    <div class="rank-number">3</div>
                    <div class="player-name">{{ topWinners[2].firstName }} {{ topWinners[2].lastName }}</div>
                    <div class="wins-count">{{ topWinners[2].editionWinsCount }} {{ topWinners[2].editionWinsCount === 1 ? 'Win' : 'Wins' }} {{ 'of ' + topWinners[2]?.editionsPlayedCount }}</div>
                  </div>
                </div>
              </div>

              <!-- Table for 4th place and onwards -->
              <div v-if="topWinners.length > 3" class="table-container">
                <v-divider class="mb-4" />
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
                    <tr v-for="(winner, index) in topWinners.slice(3)" :key="winner.playerId">
                      <td class="rank font-weight-bold">{{ index + 4 }}</td>
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
            </div>
            <v-alert v-else type="info">
              No winners data available yet.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- All-Time Top Scorers -->
      <v-col cols="12">
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
  return colorMap[color] || '#FFFFFF';
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

/* Top 3 Winners Styles */
.top-3-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 60px !important;
  min-height: 220px;
}

.top-winner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.top-winner .medal {
  font-size: 48px;
  margin-bottom: 8px;
}

.top-winner .winner-info {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 16px;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 118px;
}

.top-winner .rank-number {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 4px;
}

.top-winner .player-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  word-break: break-word;
}

.top-winner .wins-count {
  font-size: 12px;
  color: #666;
}

/* First Place - Tallest */
.first-place {
  transform: translateY(0px);
  order: 2;
}

.first-place .winner-info {
  min-width: 160px;
  background: linear-gradient(135deg, #dcd06b 0%, #dcd06b 100%);
  padding: 20px;
}

.first-place .rank-number {
  font-size: 32px;
}

.first-place .player-name {
  font-size: 16px;
}

/* Second Place - Medium */
.second-place {
  transform: translateY(50px);
  order: 1;
}

.second-place .winner-info {
  background: linear-gradient(135deg, #dedede 0%, #dedede 100%);
}

/* Third Place - Shortest */
.third-place {
  transform: translateY(100px);
  order: 3;
}

.third-place .winner-info {
  background: linear-gradient(135deg, #bda58f 0%, #bda58f 100%);
}

.third-place .rank-number,
.third-place .player-name,
.third-place .wins-count {
  color: white;
}

@media (max-width: 768px) {
  .top-3-container {
    gap: 12px;
    min-height: 180px;
    margin-bottom: 20px;
  }

  .top-winner .medal {
    font-size: 36px;
    margin-bottom: 6px;
  }

  .top-winner .winner-info {
    padding: 12px;
    min-width: 110px;
  }

  .first-place .winner-info {
    min-width: 130px;
    padding: 16px;
  }

  .first-place .rank-number {
    font-size: 24px;
  }

  .first-place .player-name {
    font-size: 14px;
  }

  .second-place {
    transform: translateY(35px);
  }

  .third-place {
    transform: translateY(70px);
  }
}

@media (max-width: 480px) {
  .top-3-container {
    gap: 8px;
    min-height: 150px;
  }

  .top-winner .medal {
    font-size: 28px;
  }

  .top-winner .winner-info {
    padding: 10px;
    min-width: 90px;
    font-size: 12px;
  }

  .first-place .winner-info {
    min-width: 100px;
  }

  .first-place .rank-number {
    font-size: 20px;
  }

  .second-place {
    transform: translateY(25px);
  }

  .third-place {
    transform: translateY(50px);
  }
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
