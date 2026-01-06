<template>
  <v-dialog v-model="isOpen" max-width="400">
    <v-card class="rounded-xl shadow-xl">
      <!-- Header -->
      <v-card-title class="text-2xl text-bold py-lg px-lg bg-error text-white rounded-t-xl">
        Delete Player
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pt-lg text-base text-grey-600">
        Are you sure you want to delete <strong>{{ player?.firstName }} {{ player?.lastName }}</strong>?
        This action cannot be undone.
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="px-lg pb-lg gap-md justify-end">
        <v-btn
          variant="outlined"
          color="grey-600"
          @click="handleCancel"
          class="rounded-full"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          @click="handleConfirm"
          :loading="loading"
          class="rounded-full"
        >
          Delete Permanently
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Player } from '../../types';

interface Props {
  modelValue: boolean;
  player: Player | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'confirm': [];
  'cancel': [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  isOpen.value = false;
  emit('cancel');
};
</script>
