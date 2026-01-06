<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card class="rounded-xl shadow-xl">
      <!-- Header -->
      <div class="bg-gradient-primary rounded-t-xl px-lg pt-lg pb-md">
        <h2 class="text-3xl text-bold text-white mb-xs">
          {{ player?.firstName }} {{ player?.lastName }}
        </h2>
        <p class="text-base text-grey-100">Player Statistics & Performance</p>
      </div>

      <!-- Content -->
      <v-card-text class="pt-lg">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center align-center py-2xl">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else>
          <!-- Grade Comparison Section -->
          <div class="mb-lg">
            <v-row class="gap-md align-stretch">
              <!-- Current Grade -->
              <v-col cols="12" sm="6">
                <div class="p-lg rounded-lg bg-gradient-to-br from-info-lighter to-info-100 h-full">
                  <p class="text-xs text-grey-600 uppercase tracking-wide mb-sm">Current Grade</p>
                  <div class="flex align-center gap-md">
                    <div class="flex-1">
                      <p class="text-4xl text-bold text-info">{{ player?.grade || '—' }}</p>
                      <p class="text-xs text-grey-500 mt-xs">Given by admin</p>
                    </div>
                    <v-icon size="48" color="info" opacity="0.3">mdi-account-star</v-icon>
                  </div>
                </div>
              </v-col>
              
              <!-- Suggested Grade -->
              <v-col cols="12" sm="6">
                <div 
                  class="p-lg rounded-lg h-full"
                  :class="{
                    'bg-gradient-to-br from-success-lighter to-success-100': (props.stats.suggestedGrade >= (player?.grade || 0)),
                    'bg-gradient-to-br from-warning-lighter to-warning-100': (props.stats.suggestedGrade < (player?.grade || 0))
                  }"
                >
                  <p class="text-xs text-grey-600 uppercase tracking-wide mb-sm">Suggested Grade</p>
                  <div class="flex align-center gap-md">
                    <div class="flex-1">
                      <p class="text-4xl text-bold" :class="{
                        'text-success': (props.stats.suggestedGrade >= (player?.grade || 0)),
                        'text-warning': (props.stats.suggestedGrade < (player?.grade || 0))
                      }">{{ props.stats.suggestedGrade }}</p>
                      <p class="text-xs text-grey-500 mt-xs">Based on performance</p>
                    </div>
                    <v-icon 
                      size="48" 
                      opacity="0.3"
                      :color="(props.stats.suggestedGrade >= (player?.grade || 0)) ? 'success' : 'warning'"
                    >
                      {{ (props.stats.suggestedGrade >= (player?.grade || 0)) ? 'mdi-trending-up' : 'mdi-trending-down' }}
                    </v-icon>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Original Grade Section (moved lower) -->
          <div class="mb-lg p-md rounded-lg bg-primary-lighter">
            <div class="flex align-center gap-md justify-between flex-wrap">
              <div>
                <p class="text-xs text-grey-600 uppercase tracking-wide mb-xs">Player Rating</p>
                <p class="text-3xl text-bold text-primary">{{ player?.grade }}/10</p>
              </div>
              <v-icon size="64" color="primary" opacity="0.5">mdi-medal</v-icon>
            </div>
          </div>

          <!-- Stats Grid -->
          <v-row class="gap-md mb-lg">
            <!-- Matches Played -->
            <v-col cols="6">
              <div class="p-md rounded-lg bg-success-lighter">
                <p class="text-xs text-grey-600 uppercase tracking-wide mb-xs">Matches Played</p>
                <p class="text-2xl text-bold text-success">{{ props.stats.matchesPlayed }}</p>
                <p class="text-xs text-grey-500 mt-xs">Total appearances</p>
              </div>
            </v-col>

            <!-- Goals Scored -->
            <v-col cols="6">
              <div class="p-md rounded-lg bg-error-lighter">
                <p class="text-xs text-grey-600 uppercase tracking-wide mb-xs">Goals Scored</p>
                <p class="text-2xl text-bold text-error">{{ props.stats.goalsScored }}</p>
                <p class="text-xs text-grey-500 mt-xs">Total goals</p>
              </div>
            </v-col>

            <!-- Goals Per Match -->
            <v-col cols="6">
              <div class="p-md rounded-lg bg-warning-lighter">
                <p class="text-xs text-grey-600 uppercase tracking-wide mb-xs">Goals/Match Avg</p>
                <p class="text-2xl text-bold text-warning">{{ props.goalsPerMatch }}</p>
                <p class="text-xs text-grey-500 mt-xs">Per game average</p>
              </div>
            </v-col>
          </v-row>

          <!-- Championship Stats -->
          <v-row class="gap-md mb-lg">
            <!-- Edition Wins -->
            <v-col cols="6">
              <div class="p-md rounded-lg bg-purple-lighter">
                <p class="text-xs text-grey-600 uppercase tracking-wide mb-xs">Edition Wins</p>
                <p class="text-2xl text-bold" style="color: rgb(156, 39, 176)">{{ props.stats.editionWins }}</p>
                <p class="text-xs text-grey-500 mt-xs">Championships won</p>
              </div>
            </v-col>

            <!-- Total Editions -->
            <v-col cols="6">
              <div class="p-md rounded-lg bg-indigo-lighter">
                <p class="text-xs text-grey-600 uppercase tracking-wide mb-xs">Total Editions</p>
                <p class="text-2xl text-bold" style="color: rgb(63, 81, 181)">{{ props.stats.totalEditions }}</p>
                <p class="text-xs text-grey-500 mt-xs">Editions participated</p>
              </div>
            </v-col>
          </v-row>

          <!-- Podium Placements -->
          <div class="p-lg rounded-lg bg-grey-50 mb-lg">
            <h3 class="text-lg text-bold text-grey-900 mb-md">Podium Placements</h3>
            
            <v-row class="gap-md">
              <v-col cols="6" sm="3">
                <div class="text-center p-md rounded-lg bg-yellow-100">
                  <v-icon color="warning" size="32" class="mb-xs">mdi-medal</v-icon>
                  <p class="text-2xl text-bold text-warning">{{ props.stats.firstPlace }}</p>
                  <p class="text-xs text-grey-600 font-bold">1st Place</p>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-center p-md rounded-lg bg-grey-100">
                  <v-icon color="grey" size="32" class="mb-xs">mdi-medal</v-icon>
                  <p class="text-2xl text-bold text-grey-600">{{ props.stats.secondPlace }}</p>
                  <p class="text-xs text-grey-600 font-bold">2nd Place</p>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-center p-md rounded-lg" style="background-color: rgb(205, 127, 50, 0.2)">
                  <v-icon size="32" class="mb-xs" style="color: rgb(205, 127, 50)">mdi-medal</v-icon>
                  <p class="text-2xl text-bold" style="color: rgb(205, 127, 50)">{{ props.stats.thirdPlace }}</p>
                  <p class="text-xs text-grey-600 font-bold">3rd Place</p>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-center p-md rounded-lg bg-blue-100">
                  <v-icon color="info" size="32" class="mb-xs">mdi-medal</v-icon>
                  <p class="text-2xl text-bold text-info">{{ props.stats.fourthPlace }}</p>
                  <p class="text-xs text-grey-600 font-bold">4th Place</p>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Performance Metrics -->
          <div class="p-lg rounded-lg bg-grey-50 mb-lg">
            <h3 class="text-lg text-bold text-grey-900 mb-md">Performance Metrics</h3>
            
            <div class="flex flex-column gap-md">
              <!-- Attendance Rate -->
              <div class="flex align-center gap-md justify-between">
                <div>
                  <p class="text-sm text-bold text-grey-700">Attendance Rate</p>
                  <p class="text-xs text-grey-500">Editions participated</p>
                </div>
                <div class="flex align-center gap-sm">
                  <v-progress-linear
                    :value="props.stats.attendanceRate"
                    class="flex-1"
                    height="8"
                    color="success"
                    style="max-width: 150px"
                  />
                  <span class="text-sm text-bold text-success min-w-12">{{ props.stats.attendanceRate }}%</span>
                </div>
              </div>

              <!-- Consistency Score -->
              <div class="flex align-center gap-md justify-between">
                <div>
                  <p class="text-sm text-bold text-grey-700">Consistency Score</p>
                  <p class="text-xs text-grey-500">Performance stability</p>
                </div>
                <div class="flex align-center gap-sm">
                  <v-progress-linear
                    :value="props.stats.consistencyScore"
                    class="flex-1"
                    height="8"
                    color="info"
                    style="max-width: 150px"
                  />
                  <span class="text-sm text-bold text-info min-w-12">{{ props.stats.consistencyScore }}%</span>
                </div>
              </div>

              <!-- Sportsmanship Rating -->
              <div class="flex align-center gap-md justify-between">
                <div>
                  <p class="text-sm text-bold text-grey-700">Sportsmanship Rating</p>
                  <p class="text-xs text-grey-500">Behavior & conduct</p>
                </div>
                <div class="flex align-center gap-sm">
                  <v-progress-linear
                    :value="props.stats.sportsmanshipRating"
                    class="flex-1"
                    height="8"
                    color="warning"
                    style="max-width: 150px"
                  />
                  <span class="text-sm text-bold text-warning min-w-12">{{ props.stats.sportsmanshipRating }}%</span>
                </div>
              </div>
            </div>
          </div>

        
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="px-lg pb-lg gap-md justify-end">
        <v-btn
          variant="outlined"
          color="grey-600"
          @click="handleClose"
          class="rounded-full"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          @click="handleSaveNotes"
          :loading="isLoading"
          class="rounded-full"
        >
          Save Notes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Player } from '../../types';
import type { PlayerStatDetail } from '../../composables/usePlayerStatsDetail';

interface Props {
  modelValue: boolean;
  player: Player | null;
  stats?: PlayerStatDetail;
  goalsPerMatch?: string | number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stats: () => ({
    matchesPlayed: 0,
    goalsScored: 0,
    attendanceRate: 0,
    consistencyScore: 0,
    sportsmanshipRating: 0,
    editionWins: 0,
    totalEditions: 0,
    firstPlace: 0,
    secondPlace: 0,
    thirdPlace: 0,
    fourthPlace: 0,
    suggestedGrade: 0,
  }),
  goalsPerMatch: 0,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'save-notes': [notes: string];
}>();

const adminNotes = ref('');

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isLoading = computed(() => props.loading);

watch(
  () => isOpen.value,
  (newVal) => {
    if (newVal) {
      adminNotes.value = '';
    }
  }
);

const handleClose = () => {
  isOpen.value = false;
  adminNotes.value = '';
};

const handleSaveNotes = () => {
  emit('save-notes', adminNotes.value);
  handleClose();
};
</script>
