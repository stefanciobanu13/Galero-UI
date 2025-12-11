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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const memberSinceDate = computed(() => {
  const date = new Date();
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
</style>
