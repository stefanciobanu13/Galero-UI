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
              <v-btn
                id="google-signin-button"
                size="large"
                color="primary"
                variant="outlined"
                class="w-100"
                prepend-icon="mdi-google"
                @click="handleGoogleSignIn"
              >
                Sign in with Google
              </v-btn>
            </div>

            <v-divider class="my-6" />

            <div class="mt-6">
              <p class="text-center text-body2 text-grey">
                For demo purposes, you can also:
              </p>
              <v-btn
                size="small"
                color="info"
                variant="text"
                class="mt-2 w-100"
                @click="loginAsUser"
              >
                Demo: Login as User
              </v-btn>
              <v-btn
                size="small"
                color="warning"
                variant="text"
                class="mt-2 w-100"
                @click="loginAsAdmin"
              >
                Demo: Login as Admin
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ref } from 'vue';

const router = useRouter();
const authStore = useAuthStore();
const showError = ref(false);
const errorMessage = ref('');

const handleGoogleSignIn = async () => {
  // For development/demo, we'll simulate Google Sign-In
  // In production, integrate with actual Google OAuth
  loginAsUser();
};

const loginAsUser = () => {
  const demoUser = {
    email: 'user@example.com',
    name: 'Demo User',
    picture: 'https://cdn.vuetifyjs.com/images/avatars/2.jpg',
  };

  localStorage.setItem('user', JSON.stringify(demoUser));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('isAdmin', 'false');
  
  authStore.login(demoUser);
  authStore.setAdmin(false);
  
  router.push('/');
};

const loginAsAdmin = () => {
  const demoAdmin = {
    email: 'admin@example.com',
    name: 'Demo Admin',
    picture: 'https://cdn.vuetifyjs.com/images/avatars/3.jpg',
  };

  localStorage.setItem('user', JSON.stringify(demoAdmin));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('isAdmin', 'true');
  
  authStore.login(demoAdmin);
  authStore.setAdmin(true);
  
  router.push('/');
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.w-100 {
  width: 100%;
}
</style>
