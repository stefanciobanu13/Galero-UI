<template>
  <v-card class="rounded-lg shadow-xl">
    <v-card-title class="text-2xl text-bold py-lg px-lg bg-primary text-white rounded-t-lg">
      Create New Edition
    </v-card-title>
    <v-card-text class="py-lg px-lg">
      <v-form @submit.prevent="handleSubmit" class="flex flex-column gap-lg">
        <v-row class="gap-lg">
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="form.editionNumber"
              type="number"
              label="Edition Number"
              outlined
              dense
              class="rounded-md"
              :rules="[v => v > 0 || 'Must be greater than 0']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.date"
              type="date"
              label="Edition Date"
              outlined
              dense
              class="rounded-md"
              :rules="[v => !!v || 'Date is required']"
            />
          </v-col>
        </v-row>

        <v-row class="gap-md">
          <v-col cols="12" md="6">
            <v-btn
              @click="handleInitialize"
              color="primary"
              block
              :disabled="!isValid || isInitializing"
              :loading="isInitializing"
              class="rounded-full"
            >
              Initialize Edition
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              @click="$emit('cancel')"
              variant="outlined"
              color="secondary"
              block
              class="rounded-full"
            >
              Cancel
            </v-btn>
          </v-col>
        </v-row>

        <v-alert v-if="errorMessage" type="error" class="rounded-md">
          {{ errorMessage }}
        </v-alert>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface EditionFormData {
  editionNumber: number;
  date: string;
}

interface Props {
  editionNumber?: number;
  isInitializing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isInitializing: false,
});

const emit = defineEmits<{
  'initialize': [form: EditionFormData];
  'cancel': [];
}>();

const form = ref<EditionFormData>({
  editionNumber: props.editionNumber || 1,
  date: '',
});

const errorMessage = ref('');

const isValid = computed(() => {
  return form.value.editionNumber > 0 && form.value.date;
});

const handleInitialize = async () => {
  if (isValid.value) {
    errorMessage.value = '';
    emit('initialize', form.value);
  }
};

const handleSubmit = () => {
  handleInitialize();
};
</script>
