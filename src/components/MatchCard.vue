<template>
  <v-card class="match-card" elevation="2">
    <v-card-text>
      <!-- Match Header -->
      <div class="match-title-header">
        <span class="match-title">Match {{ match.matchNumber }}</span>
      </div>

      <!-- Status Badge -->
      <div class="text-center mb-4">
        <v-chip 
          :color="match.isPlayed ? 'success' : 'grey'" 
          size="small"
          variant="tonal"
        >
          {{ match.isPlayed ? 'Played' : 'Not played' }}
        </v-chip>
      </div>

      <!-- Teams & Score Section -->
      <div class="teams-score-section">
        <!-- Home Team -->
        <div class="team-side home-side">
          <span class="team-name text-capitalize">{{ homeTeam?.color || 'Unknown' }}</span>
          <div class="team-color-circle" :style="{ backgroundColor: getHomeTeamColor }"></div>
        </div>

        <!-- Score -->
        <div class="score-section">
          <span class="score">{{ match.isPlayed ? (match.homeTeamScore ?? 0) : '-' }}</span>
          <span class="score-divider">-</span>
          <span class="score">{{ match.isPlayed ? (match.awayTeamScore ?? 0) : '-' }}</span>
        </div>

        <!-- Away Team -->
        <div class="team-side away-side">
          <div class="team-color-circle" :style="{ backgroundColor: getAwayTeamColor }"></div>
          <span class="team-name text-capitalize">{{ awayTeam?.color || 'Unknown' }}</span>
        </div>
      </div>

      <!-- Goals Section -->
      <div class="goals-section">
        <!-- Home Team Goals -->
        <div class="team-goals home-goals">
          <div v-for="goal in homeTeamGoals" :key="goal.goalId" class="goal-item">
            <span class="goal-player">{{ getPlayerName(goal.playerId) }}</span>
            <span v-if="goal.goalType === 'penalty'" class="goal-type">(P)</span>
            <span v-if="goal.goalType === 'own_goal'" class="goal-type own-goal">(OG)</span>
            <span class="goal-icon">⚽</span>
            <v-btn
              v-if="canEdit"
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="error"
              @click="removeGoal(goal.goalId!)"
              class="remove-goal-btn"
            />
          </div>
        </div>

        <!-- Away Team Goals -->
        <div class="team-goals away-goals">
          <div v-for="goal in awayTeamGoals" :key="goal.goalId" class="goal-item">
            <v-btn
              v-if="canEdit"
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="error"
              @click="removeGoal(goal.goalId!)"
              class="remove-goal-btn"
            />
            <span class="goal-icon">⚽</span>
            <span v-if="goal.goalType === 'penalty'" class="goal-type">(P)</span>
            <span v-if="goal.goalType === 'own_goal'" class="goal-type own-goal">(OG)</span>
            <span class="goal-player">{{ getPlayerName(goal.playerId) }}</span>
          </div>
        </div>
      </div>

      <!-- Mark as Played Button (for 0-0 draws) -->
      <div class="text-center my-4" v-if="totalGoals === 0 && !match.isPlayed && canEdit">
        <v-btn
          @click="toggleMatchPlayed"
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-play-circle"
        >
          Mark as Played (0-0)
        </v-btn>
      </div>

      <!-- Add Goal Section -->
      <div v-if="canEdit" class="add-goal-container">
        <!-- Home Team Add Goal -->
        <div class="add-goal-side">
          <v-select
            v-model="homeTeamSelectModel"
            :items="homeTeamPlayers"
            item-title="playerDisplayName"
            item-value="playerId"
            placeholder="+ Add goal"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            @update:modelValue="addGoalFromSelect('home', $event)"
            class="goal-select"
          />
        </div>

        <!-- Away Team Add Goal -->
        <div class="add-goal-side">
          <v-select
            v-model="awayTeamSelectModel"
            :items="awayTeamPlayers"
            item-title="playerDisplayName"
            item-value="playerId"
            placeholder="+ Add goal"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            @update:modelValue="addGoalFromSelect('away', $event)"
            class="goal-select"
          />
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
  canEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true
});
const emit = defineEmits<{
  goalAdded: [];
}>();

const editionsStore = useEditionsStore();

// State for select dropdowns
const homeTeamSelectModel = ref<number | null>(null);
const awayTeamSelectModel = ref<number | null>(null);

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

// Goals - Use store directly for reactivity, show regular goals in team's section, own goals in opponent's section
const matchGoals = computed(() =>
  editionsStore.goals.filter(g => g.matchId === props.match.matchId)
);

const homeTeamGoals = computed(() =>
  matchGoals.value.filter(g => 
    (g.teamId === props.match.homeTeamId && g.goalType !== 'own_goal') ||
    (g.teamId === props.match.awayTeamId && g.goalType === 'own_goal')
  )
);

const awayTeamGoals = computed(() =>
  matchGoals.value.filter(g =>
    (g.teamId === props.match.awayTeamId && g.goalType !== 'own_goal') ||
    (g.teamId === props.match.homeTeamId && g.goalType === 'own_goal')
  )
);

// Total goals in match (to determine if mark as played button should show)
const totalGoals = computed(() =>
  homeTeamGoals.value.length + awayTeamGoals.value.length
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
  if (props.match.matchType === 'group') return 'Regular';
  if (props.match.matchType === 'small_final') return 'Small Final';
  if (props.match.matchType === 'big_final') return 'Big Final';
  return '';
});

// Methods
const getPlayerName = (playerId: number): string => {
  const player = editionsStore.players.find(p => p.playerId === playerId);
  return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
};

const addGoalFromSelect = async (team: 'home' | 'away', playerId: number | null) => {
  if (!playerId) return;
  
  const teamData = team === 'home' ? homeTeam.value : awayTeam.value;
  if (!teamData) return;

  try {
    await editionsStore.addGoal(
      props.match.matchId!,
      playerId,
      teamData.teamId!,
      'normal'
    );
    
    // Clear selection
    if (team === 'home') {
      homeTeamSelectModel.value = null;
    } else {
      awayTeamSelectModel.value = null;
    }
    
    emit('goalAdded');
  } catch (e) {
    console.error('Failed to add goal:', e);
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

const toggleMatchPlayed = () => {
  editionsStore.markMatchAsPlayed(props.match.matchId!, !props.match.isPlayed);
  emit('goalAdded');
};
</script>

<style scoped>
.match-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  width: 100%;
}

:deep(.match-card .v-card-text) {
  padding: 0;
}

.match-title-header {
  background-color: #f0f4f8;
  margin: 0;
  padding: 14px 16px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.match-title {
  color: #1a237e;
  font-weight: 700;
  font-size: 1.1rem;
}

.teams-score-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px;
}

.team-side {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.home-side {
  justify-content: flex-start;
}

.away-side {
  justify-content: flex-end;
}

.team-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.team-color-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.score-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

.score {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}

.score-divider {
  font-size: 1.5rem;
  color: #999;
}

.goals-section {
  display: flex;
  justify-content: space-between;
  padding: 16px 16px;
  min-height: 40px;
  border-top: 1px solid #eee;
}

.team-goals {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.home-goals {
  align-items: flex-start;
}

.away-goals {
  align-items: flex-end;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: #555;
}

.goal-player {
  font-weight: 500;
}

.goal-icon {
  font-size: 0.75rem;
}

.goal-type {
  font-size: 0.7rem;
  color: #888;
}

.goal-type.own-goal {
  color: #ff5252;
}

.remove-goal-btn {
  opacity: 0.6;
}

.remove-goal-btn:hover {
  opacity: 1;
}

.add-goal-container {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 16px 16px;
  border-top: 1px solid #eee;
}

.add-goal-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.player-dropdown-menu {
  border-radius: 8px;
}

.goal-type-menu {
  border-radius: 8px;
}

.text-capitalize {
  text-transform: capitalize;
}
</style>
