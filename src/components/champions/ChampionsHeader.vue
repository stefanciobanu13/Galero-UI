<template>
  <v-col cols="12" class="pa-0 mb-4">
    <h1 class="text-h5 text-sm-h4 font-weight-bold text-primary mb-2 d-flex align-center justify-center justify-sm-start">
      <span class="me-2">🏆</span>
      <span>{{ title }}</span>
    </h1>
    
    <p 
      v-if="subtitle" 
      class="text-body-2 text-sm-body-1 text-grey-darken-1 mb-0 text-center text-sm-left"
    >
      {{ subtitle }}
    </p>
  </v-col>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<style scoped>
/* Ne asigurăm că titlul lung nu rupe layout-ul pe ecrane foarte mici */
h1 {
  line-height: 1.2;
  word-break: break-word;
}
</style>