<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="4" class="pa-8">
          <v-card-title class="text-h4 text-center mb-8">
            Login
          </v-card-title>

          <v-card-text>
            <p class="text-center text-body2 mb-6 text-grey">
              Sign in to manage your football competition
            </p>

            <div class="text-center mb-6">
              <div id="google-signin-button" ref="googleButtonContainer" />
            </div>
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-6"
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
import PlayerSelectionModal from '../components/PlayerSelectionModal.vue';

declare global {
  interface Window {
    google: any;
  }
}

const router = useRouter();
const authStore = useAuthStore();
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

const handleGoogleError = () => {
  errorMessage.value = 'Google sign-in failed. Please try again.';
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

const isGoogleClientIdConfigured = (): boolean => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return clientId && !clientId.includes('YOUR_GOOGLE_CLIENT_ID');
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

<style scoped>
.fill-height {
  height: 100vh;
}

.w-100 {
  width: 100%;
}
</style>
