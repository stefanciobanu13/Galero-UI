<template>
  <v-container class="py-xl">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="rounded-lg shadow-xl">
          <v-card-title class="text-2xl text-bold py-lg px-lg bg-primary text-white rounded-t-lg">
            Add New Player
          </v-card-title>

          <v-card-text class="py-lg px-lg">
            <v-alert
              v-if="playerStore.error"
              type="error"
              dismissible
              closable
              class="mb-lg rounded-md"
            >
              {{ playerStore.error }}
            </v-alert>

            <v-alert
              v-if="successMessage"
              type="success"
              dismissible
              closable
              class="mb-lg rounded-md"
            >
              {{ successMessage }}
            </v-alert>

            <v-form ref="form" @submit.prevent="submitForm" class="flex flex-column gap-lg">
              <v-text-field
                v-model="formData.firstName"
                label="First Name"
                prepend-icon="mdi-account"
                :rules="[rules.required]"
                variant="outlined"
                class="rounded-md"
              />

              <v-text-field
                v-model="formData.lastName"
                label="Last Name"
                prepend-icon="mdi-account"
                :rules="[rules.required]"
                variant="outlined"
                class="rounded-md"
              />

              <v-text-field
                v-model.number="formData.grade"
                label="Grade"
                prepend-icon="mdi-star"
                type="number"
                step="0.1"
                min="0"
                max="10"
                :rules="[rules.required, rules.gradeRange]"
                variant="outlined"
                class="rounded-md"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="playerStore.loading"
                prepend-icon="mdi-plus"
                class="rounded-full"
              >
                Add Player
              </v-btn>

              <v-btn
                to="/players"
                color="secondary"
                size="large"
                block
                variant="outlined"
                class="rounded-full"
              >
                Cancel
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../hooks/usePlayer';
import type { Player } from '../types';

const router = useRouter();
const playerStore = usePlayerStore();
const form = ref();
const successMessage = ref('');

const formData = ref<Player>({
  firstName: '',
  lastName: '',
  grade: 5,
});

const rules = {
  required: (v: any) => !!v || 'This field is required',
  gradeRange: (v: number) => (v >= 0 && v <= 10) || 'Grade must be between 0 and 10',
};

const submitForm = async () => {
  const { valid } = await form.value.validate();
  
  if (!valid) {
    return;
  }

  try {
    await playerStore.createPlayer(formData.value);
    successMessage.value = 'Player added successfully!';
    
    // Reset form
    formData.value = {
      firstName: '',
      lastName: '',
      grade: 5,
    };

    // Redirect to players page after 1.5 seconds
    setTimeout(() => {
      router.push('/players');
    }, 1500);
  } catch {
    // Error is handled by store
  }
};
</script>

