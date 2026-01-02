<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h5 mb-4">
            {{ t('pages.profile.title') }}
          </v-card-title>

          <v-card-text>
            <div class="text-center mb-1">
              <v-avatar
                :image="authStore.user?.profilePictureUrl || authStore.user?.picture || 'https://cdn.vuetifyjs.com/images/avatars/1.jpg'"
                size="100"
                color="primary"
              />
            </div>

            <div class="mb-1 info-row">
              <p class="text-overline text-grey mb-0 info-label">{{ t('pages.profile.email') }}:</p>
              <p class="text-body1 mb-0 info-value">{{ authStore.user?.email }}</p>
            </div>

            <div class="mb-1">
              <div class="info-row">
                <p class="text-overline text-grey mb-0 info-label">{{ t('pages.profile.name') }}:</p>
                <p class="text-body1 mb-0 info-value">{{ authStore.user?.name }}</p>
              </div>
              <p v-if="authStore.user?.playerId" class="text-body2 text-grey mt-2 assigned-player">
                {{ t('pages.profile.assignedPlayer') }}: <span class="font-weight-bold text-primary">{{ assignedPlayerName }}</span> (ID: {{ authStore.user.playerId }})
              </p>
            </div>


            <div class="mb-1 info-row align-items-center">
              <p class="text-overline text-grey mb-0 info-label">{{ t('pages.profile.accountStatus') }}:</p>
              <v-chip
                :color="authStore.isAdmin ? 'warning' : 'info'"
                text-color="white"
                size="small"
              >
                {{ authStore.isAdmin ? t('pages.profile.admin') : t('pages.profile.user') }}
              </v-chip>
            </div>

            <v-divider class="my-6" />

            <!-- Statistics Section -->
            <div class="mb-6">
              <p class="text-overline text-grey mb-4">{{ t('pages.profile.statistics') }}</p>
              <div v-if="authStore.user?.playerId" class="stats-container">
                <v-progress-circular
                  v-if="isLoadingStats || isLoadingGoals"
                  indeterminate
                  color="primary"
                  class="d-block mx-auto"
                />
                <div v-else class="stats-grid">
                  <!-- Goals Card -->
                  <div class="stat-card goals-card">
                    <div class="stat-icon">⚽</div>
                    <div class="stat-content">
                      <p class="stat-label">{{ t('pages.profile.goals') }}</p>
                      <p class="stat-value">{{ playerGoalCount }}</p>
                    </div>
                  </div>
                  
                  <!-- Wins Card -->
                  <div class="stat-card wins-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                      <p class="stat-label">Wins</p>
                      <p class="stat-value">{{ playerWinsCount }}</p>
                    </div>
                  </div>
                  
                  <!-- Editions Card -->
                  <div class="stat-card editions-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                      <p class="stat-label">Editions</p>
                      <p class="stat-value">{{ playerEditionsCount }}</p>
                    </div>
                  </div>
                  
                  <!-- Win Rate Card -->
                  <div class="stat-card rate-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                      <p class="stat-label">Win Rate</p>
                      <v-chip
                        :color="getWinRateColor(playerWinsCount, playerEditionsCount)"
                        text-color="white"
                        class="stat-value-chip"
                      >
                        {{ getWinRate(playerWinsCount, playerEditionsCount) }}%
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="d-flex align-center gap-2 mb-3">
                <v-icon color="warning">mdi-alert-circle</v-icon>
                <span class="text-body2 text-grey">{{ t('pages.profile.noPlayerAssigned') }}</span>
              </div>
            </div>

            <v-divider class="my-6" />

            <!-- Placement Statistics Section -->
            <div class="mb-6" v-if="authStore.user?.playerId">
              <p class="text-overline text-grey mb-6">Statistics of the editions played</p>
              <div class="placement-stats-container">
                <v-progress-circular
                  v-if="isLoadingPlacementStats"
                  indeterminate
                  color="primary"
                  class="d-block mx-auto"
                />

                <div v-else class="placement-podium-container">

                  <!-- 1st Place -->
                  <div class="placement-podium first-place">
                    <div class="medal">🥇</div>
                    <div class="placement-info">
                      <div class="place-count">{{ firstPlaceCount }}</div>
                    </div>
                  </div>

                  <!-- 2nd Place -->
                  <div class="placement-podium second-place">
                    <div class="medal">🥈</div>
                    <div class="placement-info">
                      <div class="place-count">{{ secondPlaceCount }}</div>
                    </div>
                  </div>


                  <!-- 3rd Place -->
                  <div class="placement-podium third-place">
                    <div class="medal">🥉</div>
                    <div class="placement-info">
                      <div class="place-count">{{ thirdPlaceCount }}</div>
                    </div>
                  </div>

                  <!-- 4th Place -->
                  <div class="placement-podium fourth-place">
                    <img :src="fourthPlaceImage" alt="4th Place" class="medal-image" />
                    <div class="placement-info">
                      <div class="place-count">{{ fourthPlaceCount }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="my-6" />
            <div class="mb-6" v-if="authStore.user?.playerId">
              <p class="text-overline text-grey mb-3">{{ t('pages.profile.editionHistory') }}</p>
              <v-progress-circular
                v-if="isLoadingHistory"
                indeterminate
                color="primary"
                size="24"
              />
              <div v-else-if="editionHistory.length > 0" class="edition-history-scroll">
                <div class="edition-history-container">
                  <div
                    v-for="edition in editionHistory"
                    :key="edition.editionId"
                    class="d-flex flex-column align-center edition-item"
                    :title="`Edition ${edition.editionNumber} - ${formatDate(edition.date)}`"
                  >
                                      <span class="edition-number"> Editia {{ edition.editionNumber }}</span>

                    <img v-if="edition.placement === 4" :src="fourthPlaceImage" alt="4th Place" class="medal-image-edition" />
                    <span v-else class="edition-emoji">{{ getPlacementEmoji(edition.placement) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="d-flex align-center gap-2">
                <v-icon color="info" size="small">mdi-information</v-icon>
                <span class="text-body2 text-grey">{{ t('pages.profile.noHistory') }}</span>
              </div>
            </div>

            <v-divider class="my-6" />

            <v-btn
              @click="logout"
              color="error"
              size="large"
              block
              variant="outlined"
              class="mt-4"
              prepend-icon="mdi-logout"
            >
              {{ t('common.logout') }}
            </v-btn>

            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mt-4"
            >
              {{ successMessage }}
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';
import { playerService, goalService, championsService } from '../services/api';
import fourthPlaceImage from '../assets/4thPlace.png';

const { t } = useI18n();const router = useRouter();
const authStore = useAuthStore();
const successMessage = ref('');
const errorMessage = ref('');
const playerGoalCount = ref<number>(0);
const isLoadingGoals = ref(false);
const playerWinsCount = ref<number>(0);
const playerEditionsCount = ref<number>(0);
const isLoadingStats = ref(false);
const firstPlaceCount = ref<number>(0);
const secondPlaceCount = ref<number>(0);
const thirdPlaceCount = ref<number>(0);
const fourthPlaceCount = ref<number>(0);
const isLoadingPlacementStats = ref(false);
const editionHistory = ref<Array<{
  editionId: number;
  editionNumber: number;
  date: string;
  placement: number;
  finalType: 'big_final' | 'small_final' | null;
  opponentColor: string;
  playerTeamScore: number;
  opponentScore: number;
}>>([]);
const isLoadingHistory = ref(false);

const assignedPlayerName = computed(() => {
  if (authStore.user?.firstName && authStore.user?.lastName) {
    return `${authStore.user.firstName} ${authStore.user.lastName}`;
  }
  return 'Unknown Player';
});

const memberSinceDate = computed(() => {
  if (authStore.user?.createdAt) {
    const date = new Date(authStore.user.createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  const date = new Date();
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

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

const loadPlayerGoals = async () => {
  if (!authStore.user?.playerId) return;
  
  isLoadingGoals.value = true;
  try {
    const response = await goalService.getPlayerGoalCount(authStore.user.playerId);
    playerGoalCount.value = response.data.goalCount;
  } catch (error) {
    console.error('Failed to load player goals:', error);
  } finally {
    isLoadingGoals.value = false;
  }
};

const loadPlayerStats = async () => {
  if (!authStore.user?.playerId) return;
  
  isLoadingStats.value = true;
  try {
    const response = await championsService.getTopEditionWinners(1000);
    const playerStats = response.data.find(p => p.playerId === authStore.user?.playerId);
    if (playerStats) {
      playerWinsCount.value = playerStats.editionWinsCount;
      playerEditionsCount.value = playerStats.editionsPlayedCount;
    }
  } catch (error) {
    console.error('Failed to load player stats:', error);
  } finally {
    isLoadingStats.value = false;
  }
};

const loadPlacementStats = async () => {
  if (!authStore.user?.playerId) return;
  
  isLoadingPlacementStats.value = true;
  try {
    const response = await playerService.getPlacementStats(authStore.user.playerId);
    firstPlaceCount.value = response.data.firstPlaceCount;
    secondPlaceCount.value = response.data.secondPlaceCount;
    thirdPlaceCount.value = response.data.thirdPlaceCount;
    fourthPlaceCount.value = response.data.fourthPlaceCount;
  } catch (error) {
    console.error('Failed to load placement stats:', error);
  } finally {
    isLoadingPlacementStats.value = false;
  }
};

const loadEditionHistory = async () => {
  if (!authStore.user?.playerId) return;
  
  isLoadingHistory.value = true;
  try {
    const response = await playerService.getEditionHistory(authStore.user.playerId, 1000);
    editionHistory.value = response.data;
  } catch (error) {
    console.error('Failed to load edition history:', error);
  } finally {
    isLoadingHistory.value = false;
  }
};

const getPlacementColor = (placement: number) => {
  switch (placement) {
    case 1: return '#FFD700'; // Gold
    case 2: return '#C0C0C0'; // Silver
    case 3: return '#CD7F32'; // Bronze
    default: return '#9E9E9E'; // Gray
  }
};

const getPlacementEmoji = (placement: number) => {
  switch (placement) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    case 4: return '🏅';
    default: return `#${placement}`;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Watch for changes in assigned player and reload goals and history
watch(() => authStore.user?.playerId, () => {
  loadPlayerGoals();
  loadPlayerStats();
  loadPlacementStats();
  loadEditionHistory();
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  loadPlayerGoals();
  loadPlayerStats();
  loadPlacementStats();
  loadEditionHistory();
});
</script>

<style scoped>

.userInformation {
  font-size: small;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.info-label {
  font-weight: 600;
  min-width: fit-content;
}

.info-value {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.assigned-player {
  margin-left: 0;
}

.stats-container {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.stat-card.goals-card {
  background: linear-gradient(135deg, #b5d8f5 0%, #90caf9 100%);
  border-left: 4px solid #22588e;
}

.stat-card.wins-card {
  background: linear-gradient(135deg, #f3d19e 0%, #fec166 100%);
  border-left: 4px solid #f57c00;
}

.stat-card.editions-card {
  background: linear-gradient(135deg, #d5ffd7 0%, #a5d6a7 100%);
  border-left: 4px solid #388e3c;
}

.stat-card.rate-card {
  background: linear-gradient(135deg, #fcfcaf 0%, #f3fd67 100%);
  border-left: 4px solid #998113;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-content {
  width: 100%;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 6px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
}

.stat-value-chip {
  font-weight: 700;
  font-size: 16px !important;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px 12px;
  }
  
  .stat-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}

/* Placement Statistics Styles */
.placement-stats-container {
  width: 100%;
}

.placement-podium-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  min-height: auto;
  flex-wrap: wrap;
}

.placement-podium {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.placement-podium .medal {
  font-size: 48px;
  margin-bottom: 8px;
}

.medal-image {
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  object-fit: contain;
}

.placement-podium .placement-info {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 140px;
}

.placement-podium .place-number {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 4px;
}

.placement-podium .place-label {
  font-weight: 600;
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.placement-podium .place-count {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* First Place */
.first-place {
  transform: none;
  order: 1;
}

.first-place .placement-info {
  min-width: 160px;
  background: #f5f5f5;
  padding: 20px;
}

.first-place .place-number {
  font-size: 32px;
}

.first-place .place-label {
  font-size: 13px;
}

.first-place .place-count {
  font-size: 24px;
}
/* Edition History Styles */
.edition-history-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.edition-history-container {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  min-width: min-content;
}

.edition-item {
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 8px;
  border-radius: 8px;
  background: #f5f5f5;
  min-width: 70px;
  justify-content: center;
}

.edition-item:hover {
  transform: scale(1.05);
  background: #efefef;
}

.edition-emoji {
  font-size: 28px;
  margin-bottom: 4px;
}

.medal-image-edition {
  width: 28px;
  height: 28px;
  margin-bottom: 4px;
  object-fit: contain;
}

.edition-number {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Custom scrollbar styling */
.edition-history-scroll::-webkit-scrollbar {
  height: 6px;
}

.edition-history-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.edition-history-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.edition-history-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}
/* Second Place */
.second-place {
  transform: none;
  order: 2;
}

.second-place .placement-info {
  background: #f5f5f5;
}

/* Third Place */
.third-place {
  transform: none;
  order: 3;
}

.third-place .placement-info {
  background: #f5f5f5;
}

.third-place .place-number,
.third-place .place-label,
.third-place .place-count {
  color: #333;
}

/* Fourth Place */
.fourth-place {
  transform: none;
  order: 4;
}

.fourth-place .placement-info {
  background: #f5f5f5;
  min-width: 130px;
}

@media (max-width: 768px) {
  .placement-podium-container {
    gap: 12px;
    min-height: auto;
    margin-bottom: 20px;
  }

  .placement-podium .medal {
    font-size: 36px;
    margin-bottom: 6px;
  }

  .medal-image {
    width: 44px;
    height: 44px;
    margin-bottom: 6px;
  }

  .placement-podium .placement-info {
    padding: 12px;
    min-width: 110px;
    max-width: 110px;
  }

  .first-place .placement-info {
    min-width: 130px;
    max-width: 130px;
  }

  .placement-podium .place-number {
    font-size: 20px;
  }

  .first-place .place-number {
    font-size: 28px;
  }

  .placement-podium .place-label {
    font-size: 11px;
  }

  .placement-podium .place-count {
    font-size: 18px;
  }

  .first-place .place-count {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .placement-podium-container {
    gap: 8px;
    min-height: auto;
  }

  .placement-podium {
    flex: 1;
    min-width: 80px;
  }

  .placement-podium .medal {
    font-size: 28px;
    margin-bottom: 4px;
  }

  .medal-image {
    width: 36px;
    height: 36px;
    margin-bottom: 4px;
  }

  .placement-podium .placement-info {
    padding: 10px;
    min-width: 90px;
    max-width: 90px;
  }

  .first-place .placement-info {
    min-width: 80px;
    max-width: 80px;
  }

  .placement-podium .place-number {
    font-size: 18px;
  }

  .first-place .place-number {
    font-size: 22px;
  }

  .placement-podium .place-count {
    font-size: 16px;
  }

  .first-place .place-count {
    font-size: 18px;
  }
}

</style>
