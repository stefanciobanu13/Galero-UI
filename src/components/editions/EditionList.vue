<template>
  <v-card class="rounded-lg shadow-xl">
    <v-card-title class="text-2xl text-bold py-lg px-lg bg-primary text-white rounded-t-lg">
      {{ t('pages.editions.title') }}
    </v-card-title>
    <v-card-text class="py-lg px-lg">
      <v-row class="mb-lg">
        <v-col cols="12" md="6">
          <p class="text-base text-muted">Manage all editions of the competition</p>
        </v-col>
        <v-col cols="12" md="6" v-if="canCreateEdition">
          <v-btn
            @click="$emit('create-new')"
            color="primary"
            block
            prepend-icon="mdi-plus"
            class="rounded-full"
          >
            {{ t('pages.editions.newEdition') }}
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="editions.length > 0" class="gap-md">
        <v-col cols="12" md="6" lg="4" v-for="edition in editions" :key="edition.editionId">
          <v-card class="rounded-lg shadow-lg hover-shadow transition-all h-100 flex flex-column">
            <v-card-text class="flex flex-column gap-md flex-1">
              <h3 class="text-lg text-bold text-primary">
                Edition {{ edition.editionNumber }}
              </h3>
              <p class="text-sm text-muted mb-0">
                {{ formatDate(edition.date) }}
              </p>
            </v-card-text>
            <v-card-actions class="pt-0">
              <v-btn
                color="info"
                size="small"
                variant="tonal"
                block
                @click="$emit('view', edition)"
                class="rounded-md"
              >
                View
              </v-btn>
              <v-btn
                v-if="canDeleteEdition"
                color="error"
                size="small"
                variant="tonal"
                icon="mdi-delete"
                @click="$emit('delete', edition)"
              />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-alert v-else type="info" class="rounded-md">
        No editions created yet. Click "Create New Edition" to get started!
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth';
import { formatDate } from '../../utils/editionUtils';
import type { Edition } from '../../types';

interface Props {
  editions: Edition[];
}

const props = defineProps<Props>();
defineEmits<{
  'create-new': [];
  'view': [edition: Edition];
  'delete': [edition: Edition];
}>();

const { t } = useI18n();
const authStore = useAuthStore();

const canCreateEdition = computed(() => authStore.isAdmin);
const canDeleteEdition = computed(() => authStore.isAdmin);
</script>
