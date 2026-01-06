<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="rounded-lg shadow-2xl pa-xl">
          <v-card-title class="text-4xl text-bold text-center mb-xl">
            {{ t('pages.login.title') }}
          </v-card-title>

          <v-card-text class="py-lg px-lg">
            <p class="text-center text-base text-muted mb-lg">
              {{ t('pages.login.welcome') }}
            </p>

            <div class="text-center mb-lg">
              <div id="google-signin-button" ref="googleButtonContainer" />
            </div>
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-md rounded-md"
            >
              {{ errorMessage }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Player Selection Modal -->
    <PlayerSelectionModal
      v-model:open="showPlayerModal"
      @player-selected="handlePlayerSelected"
      @skip="handleSkipPlayerSelection"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PlayerSelectionModal from '../components/PlayerSelectionModal.vue';

declare global {
  interface Window {
    google: any;
  }
}

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const googleButtonContainer = ref<HTMLDivElement | null>(null);
const showPlayerModal = ref(false);
const errorMessage = ref('');

const handleGoogleSuccess = async (response: any) => {
  try {
    errorMessage.value = '';
    const result = await authStore.loginWithGoogle(response.credential);
    
    if (result.needsPlayerSelection) {
      showPlayerModal.value = true;
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = 'Login failed. Please try again.';
  }
};



const handlePlayerSelected = () => {
  // Player has been assigned, redirect to home
  setTimeout(() => {
    router.push('/');
  }, 500);
};

const handleSkipPlayerSelection = () => {
  // User skipped player selection, redirect to home
  router.push('/');
};


onMounted(() => {
  // Initialize Google Sign-In button
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    errorMessage.value = 'Google OAuth is not configured. Use demo buttons to test or set VITE_GOOGLE_CLIENT_ID environment variable.';
    return;
  }
  
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleSuccess,
    });

    if (googleButtonContainer.value) {
      window.google.accounts.id.renderButton(
        googleButtonContainer.value,
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
        }
      );
    }
  }
});
</script>

