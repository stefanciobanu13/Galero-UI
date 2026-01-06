<template>
  <v-card class="rounded-lg shadow-lg">
    <v-card-title class="text-lg text-bold py-lg px-lg">Teams</v-card-title>
    <v-card-text class="py-lg px-lg">
      <v-row class="gap-lg">
        <v-col cols="12" sm="6" md="4" lg="" v-for="team in teams" :key="team.teamId">
          <v-card :style="{ backgroundColor: getColorValue(team.color) }" class="rounded-lg">
            <v-card-title class="text-center text-capitalize text-base text-bold py-md px-lg">
              {{ team.color }}
            </v-card-title>
            <v-divider />
            <v-card-text class="py-lg px-lg">
              <v-list density="compact" class="flex flex-column gap-sm">
                <v-list-item
                  v-for="(player, index) in team.players"
                  :key="index"
                  v-show="player.playerId"
                  class="rounded-md"
                >
                  <v-list-item-title class="text-xs text-bold">
                    {{ player.firstName }} {{ player.lastName }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { getColorValue } from '../../utils/editionUtils';
import type { Team } from '../../types';

interface TeamWithPlayers extends Team {
  players: Array<{ playerId?: number; firstName: string; lastName: string }>;
}

interface Props {
  teams: TeamWithPlayers[];
}

defineProps<Props>();
</script>
