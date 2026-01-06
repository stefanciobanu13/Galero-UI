<template>
  <v-container fluid class="pa-0 pa-sm-4 bg-grey-lighten-5 fill-height align-start">
    <v-row justify="center" no-gutters class="w-100">
      <v-col cols="12" md="11" lg="10" xl="8">
        
        <div class="pa-4 pa-sm-0">
          
          <ProfileHeader
            v-if="authStore.user"
            :full-name="fullName"
            :email="authStore.user.email"
            :profile-picture-url="authStore.user.profilePictureUrl || authStore.user.picture || 'https://cdn.vuetifyjs.com/images/avatars/1.jpg'"
            :user-id="authStore.user.userId || 0"
            :player-name="playerName"
            :is-admin="authStore.isAdmin"
            class="mb-6"
          />

          <ProfileStats
            :goals-scored="playerGoalCount"
            :wins-count="playerWinsCount"
            :editions-count="playerEditionsCount"
            :first-place="firstPlaceCount"
            :second-place="secondPlaceCount"
            :third-place="thirdPlaceCount"
            :fourth-place="fourthPlaceCount"
            :is-loading-any="isLoadingAny"
            class="mb-6"
          />

          <div v-if="authStore.user?.playerId" class="mb-8">
            <ProfileHistory
              :history="formattedHistory"
              :is-loading="isLoadingHistory"
            />
          </div>

          <div class="d-flex justify-center pb-8">
            <v-btn
              @click="logout"
              color="error"
              size="large"
              variant="tonal"
              prepend-icon="mdi-logout"
              class="rounded-xl px-8"
              :block="isMobile"
            >
              Logout
            </v-btn>
          </div>

        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify'; // Am adăugat useDisplay pentru detectare mobil
import { useAuthStore } from '../stores/auth';
import { usePlayerStats } from '../composables/usePlayerStats';
import { usePlayerHistory } from '../composables/usePlayerHistory';
import ProfileHeader from '../components/profile/ProfileHeader.vue';
import ProfileStats from '../components/profile/ProfileStats.vue';
import ProfileHistory from '../components/profile/ProfileHistory.vue';

const router = useRouter();
const authStore = useAuthStore();
const { xs } = useDisplay(); // Detectăm dacă e ecran de mobil

const isMobile = computed(() => xs.value);

// ===== COMPOSABLES & LOGIC (Rămân neschimbate) =====
const {
  playerGoalCount, playerWinsCount, playerEditionsCount,
  firstPlaceCount, secondPlaceCount, thirdPlaceCount, fourthPlaceCount,
  isLoadingAny, loadAllStats,
} = usePlayerStats(authStore.user as any);

const { editionHistory, isLoadingHistory, loadEditionHistory } =
  usePlayerHistory(authStore.user as any);

const fullName = computed(() => {
  if (authStore.user?.firstName && authStore.user?.lastName) {
    return `${authStore.user.firstName} ${authStore.user.lastName}`;
  }
  return authStore.user?.name || 'User';
});

const playerName = computed(() => {
  if (authStore.user?.firstName && authStore.user?.lastName) {
    return `${authStore.user.firstName} ${authStore.user.lastName}`;
  }
  return undefined;
});

const formattedHistory = computed(() => {
  return editionHistory.value.map(entry => ({
    editionNumber: entry.editionNumber,
    placement: entry.placement,
    date: entry.date,
  }));
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};

watch(
  () => authStore.user?.playerId,
  () => {
    if (authStore.user?.playerId) {
      loadAllStats();
      loadEditionHistory();
    }
  }
);

onMounted(() => {
  if (authStore.user?.playerId) {
    loadAllStats();
    loadEditionHistory();
  }
});
</script>

<style scoped>
/* Asigură fundalul complet chiar dacă datele se încarcă */
.v-container {
  min-height: 100vh;
}

/* Stil pentru secțiuni pentru a le uniformiza */
:deep(.v-card) {
  border: 1px solid #e0e0e0 !important;
  box-shadow: none !important;
  border-radius: 16px !important;
}
</style>