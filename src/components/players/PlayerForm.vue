<template>
  <v-dialog v-model="isOpen" :max-width="isEdit ? '500' : '500'">
    <v-card class="rounded-xl shadow-xl">
      <!-- Header -->
      <v-card-title :class="['text-2xl', 'text-bold', 'py-lg', 'px-lg', 'text-white', 'rounded-t-xl', headerBgClass]">
        {{ isEdit ? 'Edit Player' : 'Add New Player' }}
      </v-card-title>

      <!-- Form Content -->
      <v-card-text class="pt-lg">
        <v-form ref="form" @submit.prevent="handleSubmit" class="flex flex-column gap-lg">
          <v-text-field
            v-model="formData.firstName"
            label="First Name"
            variant="outlined"
            required
            hide-details
            class="rounded-lg"
          />
          <v-text-field
            v-model="formData.lastName"
            label="Last Name"
            variant="outlined"
            required
            hide-details
            class="rounded-lg"
          />
          <v-text-field
            v-model.number="formData.grade"
            label="Grade"
            type="number"
            step="0.1"
            variant="outlined"
            required
            hide-details
            class="rounded-lg"
          />
        </v-form>
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
          :color="isEdit ? 'primary' : 'success'"
          @click="handleSubmit"
          :loading="loading"
          class="rounded-full"
        >
          {{ isEdit ? 'Save Changes' : 'Add Player' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Player } from '../../types';

interface FormData {
  firstName: string;
  lastName: string;
  grade: number;
}

interface Props {
  modelValue: boolean;
  isEdit?: boolean;
  player?: Player | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'save': [data: FormData];
  'cancel': [];
}>();

const form = ref();
const formData = ref<FormData>({
  firstName: '',
  lastName: '',
  grade: 7,
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const headerBgClass = computed(() => {
  return props.isEdit ? 'bg-primary' : 'bg-success';
});

watch(
  () => props.player,
  (player) => {
    if (player && props.isEdit) {
      formData.value = {
        firstName: player.firstName || '',
        lastName: player.lastName || '',
        grade: player.grade || 7,
      };
    } else {
      formData.value = {
        firstName: '',
        lastName: '',
        grade: 7,
      };
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (form.value) {
    const isValid = await form.value.validate();
    if (isValid) {
      emit('save', { ...formData.value });
    }
  }
};

const handleCancel = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    grade: 7,
  };
  isOpen.value = false;
  emit('cancel');
};
</script>
