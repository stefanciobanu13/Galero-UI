<template>
  <v-card class="rounded-lg shadow-lg">
    <v-card-title class="text-lg text-bold py-lg px-lg">Top Scorers</v-card-title>
    <v-card-text class="py-lg px-lg">
      <div class="overflow-x-auto">
        <table class="w-100 text-sm">
          <thead class="bg-grey-50">
            <tr>
              <th class="px-lg py-md text-left text-xs text-bold text-muted text-uppercase">Rank</th>
              <th class="px-lg py-md text-left text-xs text-bold text-muted text-uppercase">Player</th>
              <th class="px-lg py-md text-center text-xs text-bold text-muted text-uppercase">Goals</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(scorer, index) in scorers" :key="scorer.playerId" class="border-b hover:bg-grey-50">
              <td class="px-lg py-md text-bold">{{ index + 1 }}</td>
              <td class="px-lg py-md">{{ scorer.playerName }}</td>
              <td class="px-lg py-md text-center text-bold text-primary">{{ scorer.goalCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Scorer {
  playerId: number;
  playerName: string;
  goalCount: number;
}

interface Props {
  scorers: Scorer[];
}

defineProps<Props>();
</script>
