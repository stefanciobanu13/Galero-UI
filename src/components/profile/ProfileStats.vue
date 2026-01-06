<template>
  <div v-if="isLoadingAny" class="flex justify-center py-2xl">
    <v-progress-circular indeterminate color="primary" size="80" />
  </div>

  <div v-else class="mb-lg">
    <!-- Main Stats Grid -->
    <v-row class="gap-sm mb-md">
      <!-- Goals -->
      <v-col cols="12" sm="6" md="3">
        <div class="p-md rounded-lg bg-gradient-to-br from-error-100 to-error-200 shadow-md">
          <div class="flex align-center justify-between mb-sm">
            <v-icon size="32" color="error">mdi-soccer-ball</v-icon>
            <span class="text-xs text-grey-600 font-bold">Goals</span>
          </div>
          <p class="text-3xl text-bold text-error mb-xs">{{ goalsScored }}</p>
          <p class="text-xs text-grey-600">Total goals</p>
        </div>
      </v-col>

      <!-- Championships -->
      <v-col cols="12" sm="6" md="3">
        <div class="p-md rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-md">
          <div class="flex align-center justify-between mb-sm">
            <v-icon size="32" color="warning">mdi-trophy</v-icon>
            <span class="text-xs text-grey-600 font-bold">Won</span>
          </div>
          <p class="text-3xl text-bold text-warning mb-xs">{{ winsCount }}</p>
          <p class="text-xs text-grey-600">Editions won</p>
        </div>
      </v-col>

      <!-- Editions Played -->
      <v-col cols="12" sm="6" md="3">
        <div class="p-md rounded-lg bg-gradient-to-br from-info-100 to-info-200 shadow-md">
          <div class="flex align-center justify-between mb-sm">
            <v-icon size="32" color="info">mdi-calendar</v-icon>
            <span class="text-xs text-grey-600 font-bold">Editions</span>
          </div>
          <p class="text-3xl text-bold text-info mb-xs">{{ editionsCount }}</p>
          <p class="text-xs text-grey-600">Participated</p>
        </div>
      </v-col>

      <!-- Win Rate -->
      <v-col cols="12" sm="6" md="3">
        <div class="p-md rounded-lg bg-gradient-to-br from-success-100 to-success-200 shadow-md">
          <div class="flex align-center justify-between mb-sm">
            <v-icon size="32" color="success">mdi-chart-line</v-icon>
            <span class="text-xs text-grey-600 font-bold">Rate</span>
          </div>
          <p class="text-3xl text-bold text-success mb-xs">{{ winRatePercent }}%</p>
          <p class="text-xs text-grey-600">Success ratio</p>
        </div>
      </v-col>
    </v-row>

    <!-- Podium Section -->
    <v-row class="gap-sm">
      <v-col cols="12">
        <div class="p-md rounded-lg bg-gradient-to-br from-grey-50 to-grey-100">
          <h3 class="text-lg text-bold text-grey-900 mb-md">Podium</h3>
          
          <v-row class="gap-sm">
            <!-- 1st Place -->
            <v-col cols="6" sm="3">
              <div class="p-sm rounded-lg bg-yellow-100 border-2 border-yellow-400 text-center shadow-sm">
                <v-icon size="36" color="warning" class="mb-xs">mdi-medal</v-icon>
                <p class="text-2xl text-bold text-warning mb-xs">{{ firstPlace }}</p>
                <p class="text-xs text-grey-700 font-bold">1st</p>
              </div>
            </v-col>

            <!-- 2nd Place -->
            <v-col cols="6" sm="3">
              <div class="p-sm rounded-lg bg-grey-200 border-2 border-grey-400 text-center shadow-sm">
                <v-icon size="36" color="grey" class="mb-xs">mdi-medal</v-icon>
                <p class="text-2xl text-bold text-grey-600 mb-xs">{{ secondPlace }}</p>
                <p class="text-xs text-grey-700 font-bold">2nd</p>
              </div>
            </v-col>

            <!-- 3rd Place -->
            <v-col cols="6" sm="3">
              <div class="p-sm rounded-lg text-center shadow-sm" style="background-color: rgba(205, 127, 50, 0.15); border: 2px solid rgb(205, 127, 50);">
                <v-icon size="36" class="mb-xs" style="color: rgb(205, 127, 50)">mdi-medal</v-icon>
                <p class="text-2xl text-bold mb-xs" style="color: rgb(205, 127, 50)">{{ thirdPlace }}</p>
                <p class="text-xs text-grey-700 font-bold">3rd</p>
              </div>
            </v-col>

            <!-- 4th Place -->
            <v-col cols="6" sm="3">
              <div class="p-sm rounded-lg bg-blue-100 border-2 border-blue-400 text-center shadow-sm">
                <v-icon size="36" color="info" class="mb-xs">mdi-medal</v-icon>
                <p class="text-2xl text-bold text-info mb-xs">{{ fourthPlace }}</p>
                <p class="text-xs text-grey-700 font-bold">4th</p>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  goalsScored: number;
  winsCount: number;
  editionsCount: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  fourthPlace: number;
  isLoadingAny: boolean;
}

const props = defineProps<Props>();

const winRatePercent = computed(() => {
  if (props.editionsCount === 0) return 0;
  return Math.round((props.winsCount / props.editionsCount) * 100);
});
</script>
