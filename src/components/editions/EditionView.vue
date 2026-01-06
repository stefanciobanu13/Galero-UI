<template>
  <div class="flex flex-column gap-lg">
    <!-- Header -->
    <v-btn
      @click="$emit('back')"
      variant="outlined"
      prepend-icon="mdi-arrow-left"
      class="rounded-full mb-lg"
    >
      Back to Editions
    </v-btn>

    <!-- Edition Title -->
    <h1 class="text-4xl text-bold text-primary mb-lg">
      Edition {{ edition.editionNumber }}
    </h1>

    <!-- Teams Section -->
    <EditionTeamsView :teams="teamsWithPlayers" v-if="!isEditing" />

    <!-- Standings Section -->
    <EditionStandingsTable :standings="standings" v-if="standings.length > 0" />

    <!-- Matches Section -->
    <EditionMatchesView
      :regular-matches="regularMatches"
      :final-matches="finalMatches"
      :teams="teams"
      :can-edit="isEditing"
      @goal-added="$emit('goal-added', $event)"
    />

    <!-- Top Scorers Section -->
    <EditionTopScorersTable :scorers="topScorers" v-if="topScorers.length > 0" />

    <!-- Actions -->
    <v-row class="gap-md mt-lg">
      <v-col cols="12" md="6" v-if="isEditing">
        <v-btn
          @click="$emit('save')"
          color="success"
          size="large"
          block
          :loading="isSaving"
          class="rounded-full"
        >
          Save Edition
        </v-btn>
      </v-col>
      <v-col cols="12" md="6" v-if="isEditing">
        <v-btn
          @click="$emit('cancel')"
          variant="outlined"
          color="secondary"
          size="large"
          block
          class="rounded-full"
        >
          Cancel Editing
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EditionTeamsView from './EditionTeamsView.vue';
import EditionStandingsTable from './EditionStandingsTable.vue';
import EditionMatchesView from './EditionMatchesView.vue';
import EditionTopScorersTable from './EditionTopScorersTable.vue';
import { useEditionMatches } from '../../composables/useEditionMatches';
import { useEditionStats } from '../../composables/useEditionStats';
import type { Edition, Team, Match, Goal, Player } from '../../types';

interface Standing {
  teamId: number;
  color: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface TeamWithPlayers extends Team {
  players: Array<{ playerId?: number; firstName: string; lastName: string }>;
}

interface Props {
  edition: Edition;
  teams: Team[];
  standings: Standing[];
  matches: Match[];
  goals: Goal[];
  players: Player[];
  isEditing?: boolean;
  isSaving?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  isSaving: false,
});

defineEmits<{
  'back': [];
  'save': [];
  'cancel': [];
  'goal-added': [goal: Goal];
}>();

const { regularMatches, finalMatches } = useEditionMatches(
  () => props.matches
);

const { topScorers } = useEditionStats(
  props.goals,
  props.matches,
  props.players
);

const teamsWithPlayers = computed(() => {
  return props.teams as unknown as TeamWithPlayers[];
});
</script>
