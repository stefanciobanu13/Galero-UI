<template>
  <v-card class="rounded-lg shadow-lg">
    <v-card-title class="text-lg text-bold py-lg px-lg">Matches</v-card-title>
    <v-card-text class="py-lg px-lg">
      <!-- Regular Matches -->
      <v-expansion-panels v-if="regularMatches.length > 0" class="mb-lg">
        <v-expansion-panel v-for="match in regularMatches" :key="match.matchId">
          <v-expansion-panel-title class="text-bold">
            <div class="flex flex-between align-center w-100 gap-lg">
              <span>Match {{ match.matchNumber }}</span>
              <span class="text-xs text-muted">
                {{ homeTeamName(match) }} vs {{ awayTeamName(match) }}
              </span>
              <span class="text-bold" :class="{ 'text-muted': !match.isPlayed }">
                {{ match.isPlayed ? `${match.homeTeamScore ?? 0} - ${match.awayTeamScore ?? 0}` : 'Not played' }}
              </span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <MatchCard :match="match" :can-edit="canEdit" @goal-added="$emit('goal-added', $event)" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Finals -->
      <div v-if="finalMatches.length > 0" class="mt-lg">
        <h4 class="text-base text-bold mb-lg">Finals</h4>
        <v-expansion-panels>
          <v-expansion-panel v-for="match in finalMatches" :key="match.matchId">
            <v-expansion-panel-title class="text-bold">
              <div class="flex flex-between align-center w-100 gap-lg">
                <span>{{ matchTypeLabel(match) }}</span>
                <span class="text-xs text-muted">
                  {{ homeTeamName(match) }} vs {{ awayTeamName(match) }}
                </span>
                <span class="text-bold" :class="{ 'text-muted': !match.isPlayed }">
                  {{ match.isPlayed ? `${match.homeTeamScore ?? 0} - ${match.awayTeamScore ?? 0}` : 'Not played' }}
                </span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <MatchCard :match="match" :can-edit="canEdit" @goal-added="$emit('goal-added', $event)" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import MatchCard from '../MatchCard.vue';
import type { Team, Match, Goal } from '../../types';

interface Props {
  regularMatches: Match[];
  finalMatches: Match[];
  teams: Team[];
  canEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
});

defineEmits<{
  'goal-added': [goal: Goal | any];
}>();

const homeTeamName = (match: Match) => {
  const team = props.teams.find(t => t.teamId === match.homeTeamId);
  return team?.color || 'Unknown';
};

const awayTeamName = (match: Match) => {
  const team = props.teams.find(t => t.teamId === match.awayTeamId);
  return team?.color || 'Unknown';
};

const matchTypeLabel = (match: Match) => {
  const typeMap: Record<string, string> = {
    small_final: 'Finala Mică',
    big_final: 'Finala Mare',
  };
  return typeMap[match.matchType || ''] || 'Match';
};
</script>
