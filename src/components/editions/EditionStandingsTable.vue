<template>
  <v-card class="rounded-lg shadow-lg">
    <v-card-title class="text-lg text-bold py-lg px-lg">Standings</v-card-title>
    <v-card-text class="py-lg px-lg">
      <div class="overflow-x-auto">
        <table class="w-100 text-sm">
          <thead class="bg-grey-50">
            <tr>
              <th class="px-lg py-md text-left text-xs text-bold text-muted text-uppercase">Place</th>
              <th class="px-lg py-md text-left text-xs text-bold text-muted text-uppercase">Team</th>
              <th class="px-lg py-md text-center text-xs text-bold text-muted text-uppercase">Points</th>
              <th class="px-lg py-md text-center text-xs text-bold text-muted text-uppercase">GF</th>
              <th class="px-lg py-md text-center text-xs text-bold text-muted text-uppercase">GA</th>
              <th class="px-lg py-md text-center text-xs text-bold text-muted text-uppercase">GD</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(standing, index) in standings"
              :key="standing.teamId"
              :style="{ backgroundColor: getColorValue(standing.color) }"
              class="border-b"
            >
              <td class="px-lg py-md text-bold">{{ index + 1 }}</td>
              <td class="px-lg py-md text-capitalize">{{ standing.color }}</td>
              <td class="px-lg py-md text-center text-bold">{{ standing.points }}</td>
              <td class="px-lg py-md text-center">{{ standing.goalsFor }}</td>
              <td class="px-lg py-md text-center">{{ standing.goalsAgainst }}</td>
              <td class="px-lg py-md text-center text-bold" :class="standing.goalDifference > 0 ? 'text-success' : standing.goalDifference < 0 ? 'text-error' : ''">
                {{ standing.goalDifference > 0 ? '+' : '' }}{{ standing.goalDifference }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { getColorValue } from '../../utils/editionUtils';

interface Standing {
  teamId: number;
  color: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface Props {
  standings: Standing[];
}

defineProps<Props>();
</script>
