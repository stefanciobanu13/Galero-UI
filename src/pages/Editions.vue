<template>
  <v-container class="pa-lg">
    <!-- LIST VIEW -->
    <EditionList
      v-if="!selectedEditionForView && !isCreatingNew"
      :editions="existingEditions"
      @create-new="handleStartCreatingNew"
      @view="handleSelectEdition"
      @delete="handleConfirmDeleteEdition"
    />

    <!-- CREATE/EDIT VIEW -->
    <EditionForm
      v-if="isCreatingNew"
      :edition-number="editionForm.editionNumber"
      :is-initializing="isInitializing"
      @initialize="handleInitializeForm"
      @cancel="handleGoBack"
    />

    <!-- VIEW EXISTING EDITION -->
    <EditionView
      v-if="selectedEditionForView && teams.length > 0"
      :edition="selectedEditionForView"
      :teams="teams"
      :standings="editionsStore.standings"
      :matches="editionsStore.matches"
      :goals="editionsStore.goals"
      :players="editionsStore.players"
      :is-editing="isCreatingNew"
      :is-saving="editionsStore.loading"
      @back="handleGoBack"
      @save="handleSaveEdition"
      @cancel="handleGoBack"
      @goal-added="onGoalAdded"
    />

    <!-- ERROR ALERT -->
    <v-alert v-if="editionsStore.error" type="error" closable class="mt-lg mb-lg rounded-md">
      {{ editionsStore.error }}
    </v-alert>

    <!-- LOADING STATE -->
    <div v-if="editionsStore.loading" class="flex justify-center align-center py-2xl">
      <v-progress-circular indeterminate color="primary" size="60" />
    </div>

    <!-- DELETE CONFIRMATION -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="rounded-lg">
        <v-card-title class="text-lg text-bold py-lg px-lg bg-primary text-white rounded-t-lg">
          Delete Edition
        </v-card-title>
        <v-card-text class="py-lg px-lg">
          Are you sure you want to delete Edition {{ editionToDelete?.editionNumber }}? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="gap-md px-lg pb-lg">
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteDialog = false" class="rounded-full">
            Cancel
          </v-btn>
          <v-btn color="error" @click="handleDeleteEdition" :loading="isDeleting" class="rounded-full">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useEditionsStore } from '../hooks/useEdition';
import { useEditionManagement } from '../composables/useEdition';
import EditionList from '../components/editions/EditionList.vue';
import EditionForm from '../components/editions/EditionForm.vue';
import EditionView from '../components/editions/EditionView.vue';
import type { Edition } from '../types';

// ===== STORES =====
const editionsStore = useEditionsStore();

// ===== COMPOSABLES =====
const {
  existingEditions,
  isCreatingNew,
  selectedEditionForView,
  editionToDelete,
  showDeleteDialog,
  isDeleting,
  isInitializing,
  editionForm,
  loadExistingEditions,
  initializeEdition,
  saveEdition: composableSaveEdition,
  goBack,
  onGoalAdded,
} = useEditionManagement();

// ===== DERIVED STATE =====
const teams = computed(() => editionsStore.teams);

// ===== LOCAL STATE =====
const isResumingEdition = ref(false);

// ===== EVENT HANDLERS =====
const handleStartCreatingNew = () => {
  isCreatingNew.value = true;
  editionsStore.setCreatingNewEdition(true);

  // Try to load saved state
  editionsStore.loadState();

  // If there's saved state, ask user if they want to resume
  if (editionsStore.currentEdition && editionsStore.teams.length > 0) {
    isResumingEdition.value = confirm('You have unsaved edition data. Would you like to resume editing it?');
    if (isResumingEdition.value) {
      editionForm.value.editionNumber = editionsStore.currentEdition.editionNumber || 1;
      editionForm.value.date = editionsStore.currentEdition.date || '';
      editionsStore.setupAutoSave();
      return;
    }
  }

  // Reset and start new
  editionsStore.resetStore();
  editionsStore.setCreatingNewEdition(true);
  editionForm.value = {
    editionNumber:
      existingEditions.value.length > 0
        ? Math.max(...existingEditions.value.map((e: Edition) => e.editionNumber || 0)) + 1
        : 1,
    date: '',
  };
};

const handleInitializeForm = async (form: any) => {
  editionForm.value = form;
  await initializeEdition();
};

const handleSelectEdition = async (edition: Edition) => {
  selectedEditionForView.value = edition;
  await editionsStore.initializeEdition(edition);
};

const handleConfirmDeleteEdition = (edition: Edition) => {
  editionToDelete.value = edition;
  showDeleteDialog.value = true;
};

const handleDeleteEdition = async () => {
  try {
    if (!editionToDelete.value?.editionId) {
      alert('Invalid edition');
      return;
    }

    isDeleting.value = true;
    const { editionService } = await import('../services/editionService');
    await editionService.delete(editionToDelete.value.editionId);

    showDeleteDialog.value = false;
    editionToDelete.value = null;
    await loadExistingEditions();
    alert('Edition deleted successfully');
  } catch (e: any) {
    console.error('Failed to delete edition:', e);
    alert('Failed to delete edition: ' + (e.message || 'Unknown error'));
  } finally {
    isDeleting.value = false;
  }
};

const handleSaveEdition = async () => {
  await composableSaveEdition(
    editionsStore.teams,
    editionsStore.matches,
    editionsStore.goals,
    editionForm.value.editionNumber,
    editionForm.value.date
  );
  handleGoBack();
};

const handleGoBack = async () => {
  goBack();
  editionsStore.resetStore();
  editionsStore.setCreatingNewEdition(false);
  isResumingEdition.value = false;
  await loadExistingEditions();
};

// ===== LIFECYCLE =====
onMounted(async () => {
  editionsStore.resetStore();
  await loadExistingEditions();
});
</script>


