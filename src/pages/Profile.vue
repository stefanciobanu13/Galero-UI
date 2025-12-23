<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card elevation="2">
          <v-card-title class="text-h5 mb-4">
            Profile
          </v-card-title>

          <v-card-text>
            <div class="text-center mb-8">
              <v-avatar
                :image="authStore.user?.picture || 'https://cdn.vuetifyjs.com/images/avatars/1.jpg'"
                size="120"
                color="primary"
              />
            </div>

            <div class="mb-6">
              <p class="text-overline text-grey">Email</p>
              <p class="text-body1">{{ authStore.user?.email }}</p>
            </div>

            <div class="mb-6">
              <p class="text-overline text-grey">Full Name</p>
              <p class="text-body1">{{ authStore.user?.name }}</p>
              <p v-if="authStore.user?.playerId" class="text-body2 text-grey mt-2">
                Assigned Player: <span class="font-weight-bold text-primary">{{ assignedPlayerName }}</span> (ID: {{ authStore.user.playerId }})
              </p>
            </div>

            <v-divider class="my-6" />

            <div class="mb-6">
              <p class="text-overline text-grey">Account Status</p>
              <v-chip
                :color="authStore.isAdmin ? 'warning' : 'info'"
                text-color="white"
                class="mb-2"
              >
                {{ authStore.isAdmin ? 'Admin' : 'User' }}
              </v-chip>
            </div>

            <v-divider class="my-6" />

            <!-- Statistics Section -->
            <div class="mb-6">
              <p class="text-overline text-grey mb-3">Statistics</p>
              <v-card v-if="authStore.user?.playerId" variant="outlined" class="pa-4 mb-3">
                <div class="d-flex align-center justify-space-between">
                  <div style="flex: 1;">
                    <div v-if="!isLoadingGoals" class="d-flex align-center gap-2">
                      <v-icon color="primary" size="small">mdi-soccer</v-icon>
                      <p class="text-body2 font-weight-bold mb-0">
                        Goals: <span class="text-primary">{{ playerGoalCount }}</span>
                      </p>
                    </div>
                    <v-progress-circular
                      v-else
                      indeterminate
                      size="20"
                    />
                  </div>
                </div>
              </v-card>
              <div v-else class="d-flex align-center gap-2 mb-3">
                <v-icon color="warning">mdi-alert-circle</v-icon>
                <span class="text-body2 text-grey">No player assigned yet</span>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  v-if="authStore.user?.playerId"
                  size="small"
                  variant="outlined"
                  color="primary"
                  @click="showChangePlayerModal = true"
                  :loading="isChangingPlayer"
                >
                  Change Player
                </v-btn>
                <v-btn
                  v-else
                  size="small"
                  color="primary"
                  @click="showChangePlayerModal = true"
                >
                  Assign Player
                </v-btn>
                <v-btn
                  v-if="authStore.user?.playerId"
                  size="small"
                  variant="outlined"
                  color="error"
                  @click="handleUnassignPlayer"
                  :loading="isUnassigningPlayer"
                >
                  Unlink
                </v-btn>
              </div>
            </div>

            <v-divider class="my-6" />

            <!-- Edition History Section -->
            <div class="mb-6" v-if="authStore.user?.playerId">
              <p class="text-overline text-grey mb-3">Edition History (Last 5)</p>
              <v-progress-circular
                v-if="isLoadingHistory"
                indeterminate
                color="primary"
                size="24"
              />
              <div v-else-if="editionHistory.length > 0" class="d-flex gap-1">
                <div
                  v-for="edition in editionHistory"
                  :key="edition.editionId"
                  class="d-flex flex-column align-center"
                  style="font-size: 28px; cursor: pointer;"
                  :title="`Edition ${edition.editionNumber} - ${formatDate(edition.date)}`"
                >
                  <span>{{ getPlacementEmoji(edition.placement) }}</span>
                  <span style="font-size: 12px; color: #666; margin-top: 2px;">{{ edition.placement }}{{ edition.placement === 1 ? 'st' : edition.placement === 2 ? 'nd' : edition.placement === 3 ? 'rd' : 'th' }}</span>
                </div>
              </div>
              <div v-else class="d-flex align-center gap-2">
                <v-icon color="info" size="small">mdi-information</v-icon>
                <span class="text-body2 text-grey">No edition history yet</span>
              </div>
            </div>

            <v-divider class="my-6" />

            <div class="mt-6">
              <p class="text-body2 text-grey mb-4">
                Member since: {{ memberSinceDate }}
              </p>
            </div>

            <v-btn
              to="/players"
              color="primary"
              size="large"
              block
              class="mt-6"
              prepend-icon="mdi-soccer"
            >
              View Players
            </v-btn>

            <v-btn
              @click="logout"
              color="error"
              size="large"
              block
              variant="outlined"
              class="mt-4"
              prepend-icon="mdi-logout"
            >
              Logout
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

    <!-- Player Selection Modal for Changing Player -->
    <PlayerSelectionModal
      v-model:open="showChangePlayerModal"
      @player-selected="handlePlayerSelected"
      @skip="showChangePlayerModal = false"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { playerService, goalService } from '../services/api';
import PlayerSelectionModal from '../components/PlayerSelectionModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const showChangePlayerModal = ref(false);
const isChangingPlayer = ref(false);
const isUnassigningPlayer = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const playerGoalCount = ref<number>(0);
const isLoadingGoals = ref(false);
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

const loadEditionHistory = async () => {
  if (!authStore.user?.playerId) return;
  
  isLoadingHistory.value = true;
  try {
    const response = await playerService.getEditionHistory(authStore.user.playerId, 5);
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
  loadEditionHistory();
});

const handlePlayerSelected = async () => {
  successMessage.value = 'Player assigned successfully!';
  errorMessage.value = '';
  isChangingPlayer.value = false;
  showChangePlayerModal.value = false;
  
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

const handleUnassignPlayer = async () => {
  if (!confirm('Are you sure you want to unlink your player?')) {
    return;
  }

  isUnassigningPlayer.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await authStore.unassignPlayer();
    successMessage.value = 'Player unlinked successfully!';
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to unassign player:', error);
    errorMessage.value = 'Failed to unlink player. Please try again.';
  } finally {
    isUnassigningPlayer.value = false;
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  loadPlayerGoals();
  loadEditionHistory();
});
</script>

<style scoped>
</style>
