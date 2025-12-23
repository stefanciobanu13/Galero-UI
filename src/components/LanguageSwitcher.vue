<template>
  <div class="language-switcher">
    <v-menu offset="0" location="bottom end">
      <template #activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          variant="text"
          :title="t('common.language')"
        >
          <v-icon>mdi-translate</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="lang in languages"
          :key="lang.code"
          :active="currentLanguage === lang.code"
          @click="changeLanguage(lang.code)"
        >
          <v-list-item-title>{{ lang.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLanguage, getCurrentLanguage } from '../i18n';

const { t } = useI18n();

const languages = [
  { code: 'en' as const, name: 'English' },
  { code: 'ro' as const, name: 'Română' },
];

const currentLanguage = computed(() => getCurrentLanguage());

const changeLanguage = (lang: 'en' | 'ro') => {
  setLanguage(lang);
};
</script>

<style scoped>
.language-switcher {
  display: inline-block;
}
</style>
