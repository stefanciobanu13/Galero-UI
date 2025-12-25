<template>
  <v-container class="py-8 px-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Welcome Section -->
        <div class="text-center mb-8">
          <h1 class="text-h3 font-weight-bold mb-4">
            {{ t('pages.home.welcome') }}
          </h1>
          <p class="text-body1 text-grey-darken-1 mb-6">
            {{ t('pages.home.description') }}
          </p>
        </div>

        <!-- What Can You Do Section -->
        <v-card elevation="2" class="pa-6">
          <h2 class="text-h5 font-weight-bold mb-6">
            {{ t('pages.home.whatCanYouDo') }}
          </h2>

          <v-list class="pa-0">
            <v-list-item class="mb-4 pl-0">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-4">mdi-lock</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-body1 mb-0">
                  {{ t('pages.home.authenticate') }}
                </p>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mb-4 pl-0">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-4">mdi-users</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-body1 mb-0">
                  {{ t('pages.home.createTeam') }}
                </p>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mb-4 pl-0">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-4">mdi-chart-line</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-body1 mb-0">
                  {{ t('pages.home.followStats') }}
                </p>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="pl-0">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-4">mdi-calendar-check</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-body1 mb-0">
                  {{ t('pages.home.seeWinner') }}
                </p>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Login Button -->
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
