<template>
  <v-container class="py-xl px-lg">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Welcome Section -->
        <div class="text-center mb-2xl">
          <h1 class="text-5xl text-bold text-primary mb-lg">
            {{ t('pages.home.welcome') }}
          </h1>
          <p class="text-lg text-muted mb-xl">
            {{ t('pages.home.description') }}
          </p>
        </div>

        <!-- What Can You Do Section -->
        <v-card class="rounded-xl shadow-lg pa-xl">
          <h2 class="text-2xl text-bold mb-lg">
            {{ t('pages.home.whatCanYouDo') }}
          </h2>

          <v-list class="pa-0 gap-md flex flex-column">
            <v-list-item class="pl-0 rounded-md hover-shadow transition-all">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-lg">mdi-lock</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-base mb-0">
                  {{ t('pages.home.authenticate') }}
                </p>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="pl-0 rounded-md hover-shadow transition-all">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-lg">mdi-account-group</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-base mb-0">
                  {{ t('pages.home.createTeam') }}
                </p>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="pl-0 rounded-md hover-shadow transition-all">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-lg">mdi-chart-line</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-base mb-0">
                  {{ t('pages.home.followStats') }}
                </p>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="pl-0 rounded-md hover-shadow transition-all">
              <template #prepend>
                <v-icon size="24" color="primary" class="mr-lg">mdi-calendar-check</v-icon>
              </template>
              <v-list-item-content>
                <p class="text-base mb-0">
                  {{ t('pages.home.seeWinner') }}
                </p>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Login Button -->
        <v-row v-if="!authStore.isLoggedIn" class="mt-2xl">
          <v-col cols="12" class="text-center">
            <v-btn
              to="/login"
              size="large"
              color="primary"
              prepend-icon="mdi-login"
              class="px-xl rounded-full"
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
