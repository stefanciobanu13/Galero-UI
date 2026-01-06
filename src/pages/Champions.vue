<template>
  <v-container fluid class="pa-0 pa-sm-4 bg-grey-lighten-5 fill-height d-flex flex-column">
    <v-row justify="center" no-gutters class="w-100">    
      <v-col cols="12" md="11" lg="11" xl="10">
        
        <header class="mb-4 mt-4 text-center px-4">
          <ChampionsHeader
            :title="t('pages.champions.title')"
            :subtitle="`${topWinners.length} campioni înregistrați`"
          />
        </header>

        <div class="px-2 px-sm-0">
          <v-card 
            flat 
            rounded="xl" 
            class="mb-4 pa-4 pa-sm-6 border"
          >
            <ChampionsTopWinners
              :title="t('pages.champions.topWinners')"
              :winners="topWinners"
              :is-loading="isLoadingWinners"
            />
          </v-card>

          <v-card 
            flat 
            rounded="xl" 
            class="pa-4 pa-sm-6 border"
          >
            <ChampionsTopScorers
              :title="t('pages.champions.topScorers')"
              :scorers="topScorers"
              :is-loading="isLoadingScorers"
            />
          </v-card>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useChampionStats } from '../composables/useChampionStats';
import { onMounted } from 'vue';
import ChampionsHeader from '../components/champions/ChampionsHeader.vue';
import ChampionsTopWinners from '../components/champions/ChampionsTopWinners.vue';
import ChampionsTopScorers from '../components/champions/ChampionsTopScorers.vue';

const { t } = useI18n();

const { topWinners, topScorers, isLoadingWinners, isLoadingScorers, loadAllChampionData } =
  useChampionStats();

onMounted(async () => {
  await loadAllChampionData(100);
});
</script>

<style scoped>
/* Asigurăm că fundalul acoperă tot viewport-ul chiar dacă conținutul e scurt */
.v-container {
  min-height: 100vh;
  width: 100%;
}
</style>