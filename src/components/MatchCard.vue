<template>
  <v-card class="match-card" :style="{ borderTop: `4px solid ${getHomeTeamColor}` }">
    <v-card-text>
      <!-- Match Header -->
      <div class="d-flex justify-space-between align-center mb-4">
        <span class="text-caption font-weight-bold">Match {{ match.matchNumber }}</span>
        <span class="text-caption">{{ matchTypeLabel }}</span>
      </div>

      <!-- Teams & Score -->
      <div class="match-header d-flex justify-space-between align-center mb-4">
        <div class="team-info text-center flex-grow-1">
          <div class="team-color" :style="{ backgroundColor: getHomeTeamColor }" />
          <p class="text-caption font-weight-bold text-capitalize mt-2">
            {{ homeTeam?.color || 'Unknown' }}
          </p>
        </div>

        <div class="score-display mx-3">
          <div class="score-box">
            <span class="score">{{ match.homeTeamScore || 0 }}</span>
            <span class="divider">-</span>
            <span class="score">{{ match.awayTeamScore || 0 }}</span>
          </div>
        </div>

        <div class="team-info text-center flex-grow-1">
          <div class="team-color" :style="{ backgroundColor: getAwayTeamColor }" />
          <p class="text-caption font-weight-bold text-capitalize mt-2">
            {{ awayTeam?.color || 'Unknown' }}
          </p>
        </div>
      </div>

      <v-divider class="my-4" />

      <!-- Home Team Scorers -->
      <div class="mb-4">
        <h4 class="text-caption font-weight-bold mb-2">
          {{ homeTeam?.color }} Scorers
        </h4>
        <div class="scorers-list mb-2" v-if="homeTeamGoals.length > 0">
          <v-chip
            v-for="goal in homeTeamGoals"
            :key="goal.goalId"
            size="small"
            :color="getHomeTeamColor"
            text-color="white"
            closable
            @click:close="removeGoal(goal.goalId!)"
            class="mr-1 mb-1"
          >
            <span class="mr-1">{{ getPlayerName(goal.playerId) }}</span>
            <span v-if="goal.goalType === 'PENALTY'" class="text-xs">(P)</span>
            <span v-if="goal.goalType === 'OWN_GOAL'" class="text-xs">(OG)</span>
          </v-chip>
        </div>
        <div v-else class="text-caption text-gray-500 mb-2">No goals yet</div>

        <!-- Add Goal -->
        <div class="add-goal-section">
          <v-select
            v-model="homeTeamNewGoalPlayerId"
            :items="homeTeamPlayers"
            item-title="playerDisplayName"
            item-value="playerId"
            label="Select Player"
            density="compact"
            class="mb-2"
          />

          <v-select
            v-model="homeTeamGoalType"
            :items="goalTypes"
            label="Goal Type"
            density="compact"
            class="mb-2"
          />

          <v-btn
            @click="addHomeTeamGoal"
            size="small"
            variant="outlined"
            block
            :disabled="!homeTeamNewGoalPlayerId"
          >
            Add Goal
          </v-btn>
        </div>
      </div>

      <v-divider class="my-4" />

      <!-- Away Team Scorers -->
      <div>
        <h4 class="text-caption font-weight-bold mb-2">
          {{ awayTeam?.color }} Scorers
        </h4>
        <div class="scorers-list mb-2" v-if="awayTeamGoals.length > 0">
          <v-chip
            v-for="goal in awayTeamGoals"
            :key="goal.goalId"
            size="small"
            :color="getAwayTeamColor"
            text-color="white"
            closable
            @click:close="removeGoal(goal.goalId!)"
            class="mr-1 mb-1"
          >
            <span class="mr-1">{{ getPlayerName(goal.playerId) }}</span>
            <span v-if="goal.goalType === 'PENALTY'" class="text-xs">(P)</span>
            <span v-if="goal.goalType === 'OWN_GOAL'" class="text-xs">(OG)</span>
          </v-chip>
        </div>
        <div v-else class="text-caption text-gray-500 mb-2">No goals yet</div>

        <!-- Add Goal -->
        <div class="add-goal-section">
          <v-select
            v-model="awayTeamNewGoalPlayerId"
            :items="awayTeamPlayers"
            item-title="playerDisplayName"
            item-value="playerId"
            label="Select Player"
            density="compact"
            class="mb-2"
          />

          <v-select
            v-model="awayTeamGoalType"
            :items="goalTypes"
            label="Goal Type"
            density="compact"
            class="mb-2"
          />

          <v-btn
            @click="addAwayTeamGoal"
            size="small"
            variant="outlined"
            block
            :disabled="!awayTeamNewGoalPlayerId"
          >
            Add Goal
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditionsStore } from '../stores/editions';
import type { Match, Goal, Team, Player } from '../types';

interface Props {
  match: Match & { goals: Goal[] };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  goalAdded: [];
}>();

const editionsStore = useEditionsStore();

// State for new goals
const homeTeamNewGoalPlayerId = ref<number | null>(null);
const awayTeamNewGoalPlayerId = ref<number | null>(null);
const homeTeamGoalType = ref<'NORMAL' | 'PENALTY' | 'OWN_GOAL'>('NORMAL');
const awayTeamGoalType = ref<'NORMAL' | 'PENALTY' | 'OWN_GOAL'>('NORMAL');

const goalTypes = [
  { title: 'Normal Goal', value: 'NORMAL' },
  { title: 'Penalty', value: 'PENALTY' },
  { title: 'Own Goal', value: 'OWN_GOAL' },
];

const colorMap: Record<string, string> = {
  green: '#4CAF50',
  orange: '#FF9800',
  gray: '#9E9E9E',
  blue: '#2196F3',
};

// Teams and Players
const homeTeam = computed(() => 
  editionsStore.teams.find(t => t.teamId === props.match.homeTeamId)
);

const awayTeam = computed(() =>
  editionsStore.teams.find(t => t.teamId === props.match.awayTeamId)
);

const homeTeamPlayers = computed(() => {
  const team = homeTeam.value;
  if (!team) return [];
  return (team.players || []).map(p => ({
    playerId: p.playerId,
    playerDisplayName: `${p.firstName} ${p.lastName}`,
  }));
});

const awayTeamPlayers = computed(() => {
  const team = awayTeam.value;
  if (!team) return [];
  return (team.players || []).map(p => ({
    playerId: p.playerId,
    playerDisplayName: `${p.firstName} ${p.lastName}`,
  }));
});

// Goals
const homeTeamGoals = computed(() =>
  props.match.goals.filter(g => g.teamId === props.match.homeTeamId)
);

const awayTeamGoals = computed(() =>
  props.match.goals.filter(g => g.teamId === props.match.awayTeamId)
);

// Colors
const getHomeTeamColor = computed(() => {
  const color = homeTeam.value?.color || '';
  return colorMap[color] || '#000';
});

const getAwayTeamColor = computed(() => {
  const color = awayTeam.value?.color || '';
  return colorMap[color] || '#000';
});

const matchTypeLabel = computed(() => {
  if (props.match.matchType === 'REGULAR') return 'Regular';
  if (props.match.matchType === 'SEMI_FINAL') return 'Small Final';
  if (props.match.matchType === 'FINAL') return 'Big Final';
  return '';
});

// Methods
const getPlayerName = (playerId: number): string => {
  const player = editionsStore.players.find(p => p.playerId === playerId);
  return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
};

const addHomeTeamGoal = async () => {
  if (homeTeamNewGoalPlayerId.value && homeTeam.value) {
    try {
      await editionsStore.addGoal(
        props.match.matchId!,
        homeTeamNewGoalPlayerId.value,
        homeTeam.value.teamId!,
        homeTeamGoalType.value
      );
      homeTeamNewGoalPlayerId.value = null;
      homeTeamGoalType.value = 'NORMAL';
      emit('goalAdded');
    } catch (e) {
      console.error('Failed to add goal:', e);
    }
  }
};

const addAwayTeamGoal = async () => {
  if (awayTeamNewGoalPlayerId.value && awayTeam.value) {
    try {
      await editionsStore.addGoal(
        props.match.matchId!,
        awayTeamNewGoalPlayerId.value,
        awayTeam.value.teamId!,
        awayTeamGoalType.value
      );
      awayTeamNewGoalPlayerId.value = null;
      awayTeamGoalType.value = 'NORMAL';
      emit('goalAdded');
    } catch (e) {
      console.error('Failed to add goal:', e);
    }
  }
};

const removeGoal = async (goalId: number) => {
  try {
    await editionsStore.removeGoal(goalId);
    emit('goalAdded');
  } catch (e) {
    console.error('Failed to remove goal:', e);
  }
};
</script>

<style scoped>
.match-card {
  transition: all 0.3s ease;
}

.match-header {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.team-info {
  flex: 1;
}

.team-color {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.score-display {
  min-width: 80px;
}

.score-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.score {
  min-width: 32px;
  text-align: center;
}

.divider {
  color: #999;
}

.scorers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.add-goal-section {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.text-capitalize {
  text-transform: capitalize;
}

h4 {
  margin-bottom: 8px;
}
</style>
