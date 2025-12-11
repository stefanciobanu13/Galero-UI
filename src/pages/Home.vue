<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-6">
          <v-card-title class="text-h4 mb-4">
            Welcome to Football Competition Management
          </v-card-title>
          <v-card-text>
            <p class="text-body1 mb-4">
              Manage your football competition with ease. Track players, organize teams, and manage matches all in one place.
            </p>
            <p class="text-body2 text-grey">
              Get started by exploring the Players section or logging in with your Google account.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" lg="4">
        <v-card elevation="1" class="h-100">
          <v-card-title class="text-center">
            <v-icon size="40" color="primary" class="mb-2">mdi-soccer</v-icon>
          </v-card-title>
          <v-card-text class="text-center">
            <p class="text-h6">Players Management</p>
            <p class="text-body2 text-grey">View and manage all players in the competition.</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="4">
        <v-card elevation="1" class="h-100">
          <v-card-title class="text-center">
            <v-icon size="40" color="primary" class="mb-2">mdi-account</v-icon>
          </v-card-title>
          <v-card-text class="text-center">
            <p class="text-h6">Profile Management</p>
            <p class="text-body2 text-grey">View and update your profile information.</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="4">
        <v-card elevation="1" class="h-100">
          <v-card-title class="text-center">
            <v-icon size="40" color="primary" class="mb-2">mdi-shield-admin</v-icon>
          </v-card-title>
          <v-card-text class="text-center">
            <p class="text-h6">Admin Controls</p>
            <p class="text-body2 text-grey">Admin-only features for competition management.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!authStore.isLoggedIn" class="mt-8">
      <v-col cols="12" class="text-center">
        <v-btn
          to="/login"
          size="large"
          color="primary"
          prepend-icon="mdi-login"
        >
          Login with Google
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>
