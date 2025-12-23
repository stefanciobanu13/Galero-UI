<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-6">
          <v-card-title class="text-h4 mb-4">
            {{ t('pages.home.welcome') }}
          </v-card-title>
          <v-card-text>
            <p class="text-body1 mb-4">
              {{ t('pages.home.description') }}
            </p>
            <p class="text-body2 text-grey">
              {{ t('pages.home.getStarted') }}
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
            <p class="text-h6">{{ t('pages.home.playersManagement') }}</p>
            <p class="text-body2 text-grey">{{ t('pages.home.playersManagementDesc') }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="4">
        <v-card elevation="1" class="h-100">
          <v-card-title class="text-center">
            <v-icon size="40" color="primary" class="mb-2">mdi-account</v-icon>
          </v-card-title>
          <v-card-text class="text-center">
            <p class="text-h6">{{ t('pages.home.profileManagement') }}</p>
            <p class="text-body2 text-grey">{{ t('pages.home.profileManagementDesc') }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="4">
        <v-card elevation="1" class="h-100">
          <v-card-title class="text-center">
            <v-icon size="40" color="primary" class="mb-2">mdi-shield-admin</v-icon>
          </v-card-title>
          <v-card-text class="text-center">
            <p class="text-h6">{{ t('pages.home.adminControls') }}</p>
            <p class="text-body2 text-grey">{{ t('pages.home.adminControlsDesc') }}</p>
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
          {{ t('pages.home.loginWithGoogle') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth';

const { t } = useI18n();
const authStore = useAuthStore();
</script>
