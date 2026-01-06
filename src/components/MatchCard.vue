<template>
  <v-card class="rounded-xl shadow-xl" elevation="2">
    <v-card-text class="pa-0">
      <!-- Match Header -->
      <div class="py-md px-lg bg-grey-50 border-b text-center">
        <span class="text-lg text-bold text-primary">Match {{ match.matchNumber }}</span>
      </div>

      <!-- Status Badge -->
      <div class="text-center py-md px-lg">
        <v-chip 
          :color="match.isPlayed ? 'success' : 'grey'" 
          size="small"
          variant="tonal"
        >
          {{ match.isPlayed ? 'Played' : 'Not played' }}
        </v-chip>
      </div>

      <!-- Teams & Score Section -->
      <div class="flex align-center justify-center py-md px-lg">
        <!-- Home Team -->
        <div class="flex flex-column align-center gap-md flex-1">
          <span class="text-base text-capitalize"> </span>
          <div class="rounded-full" :style="{ backgroundColor: getHomeTeamColor, width: '48px', height: '48px' }"></div>
        </div>

        <!-- Score -->
        <div class="flex gap-sm align-center px-lg">
          <span class="text-5xl text-bold text-primary">{{ match.isPlayed ? (match.homeTeamScore ?? 0) : '-' }}</span>
          <span class="text-xl text-muted">-</span>
          <span class="text-5xl text-bold text-primary">{{ match.isPlayed ? (match.awayTeamScore ?? 0) : '-' }}</span>
        </div>

        <!-- Away Team -->
        <div class="flex flex-column align-center gap-md flex-1 text-right">
          <div class="rounded-full" :style="{ backgroundColor: getAwayTeamColor, width: '48px', height: '48px' }"></div>
          <span class="text-base text-capitalize"> </span>
        </div>
      </div>

      <!-- Goals Section -->
      <div class="flex justify-between py-md px-lg border-t">
        <!-- Home Team Goals -->
        <div class="flex flex-column gap-sm flex-1">
          <div v-for="goal in homeTeamGoals" :key="goal.goalId" class="text-sm text-grey-70 flex gap-xs">
            <span class="text-bold">{{ getPlayerName(goal.playerId) }}</span>
            <span v-if="goal.goalType === 'penalty'" class="text-xs text-muted">(P)</span>
            <span v-if="goal.goalType === 'own_goal'" class="text-xs text-error">(OG)</span>
            <span class="text-xs">⚽</span>
            <v-btn
              v-if="canEdit"
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="error"
              @click="removeGoal(goal.goalId!)"
              class="ml-auto opacity-60 hover-opacity-100"
            />
          </div>
        </div>

        <!-- Away Team Goals -->
        <div class="flex flex-column gap-sm flex-1 text-right">
          <div v-for="goal in awayTeamGoals" :key="goal.goalId" class="text-sm text-grey-70 flex gap-xs justify-end">
            <v-btn
              v-if="canEdit"
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="error"
              @click="removeGoal(goal.goalId!)"
              class="opacity-60 hover-opacity-100"
            />
            <span v-if="goal.goalType === 'penalty'" class="text-xs text-muted">(P)</span>
            <span v-if="goal.goalType === 'own_goal'" class="text-xs text-error">(OG)</span>
            <span class="text-bold">{{ getPlayerName(goal.playerId) }}</span>
            <span class="text-xs">⚽</span>
          </div>
        </div>
      </div>

      <!-- Mark as Played Button (for 0-0 draws) -->
      <div class="text-center py-lg" v-if="totalGoals === 0 && !match.isPlayed && canEdit">
        <v-btn
          @click="toggleMatchPlayed"
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-play-circle"
          class="rounded-full"
        >
          Mark as Played (0-0)
        </v-btn>
      </div>

      <!-- Add Goal Section -->
      <div v-if="canEdit" class="flex gap-lg py-lg px-lg border-t">
        <!-- Home Team Add Goal -->
        <div class="flex-1">
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
            class="rounded-md"
          />
        </div>

        <!-- Away Team Add Goal -->
        <div class="flex-1">
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
            class="rounded-md"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
1234``
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditionsStore } from '../hooks/useEdition';
import type { Match } from '../services/matchService';
import type { Goal } from '../services/goalService';
import type { Team } from '../services/teamService';

interface Props {
  match: Match & { goals?: Goal[]; homeTeam?: Team; awayTeam?: Team };
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
 verde: '#9cff7a',
  portocaliu: '#fcb142',
  gri: '#e3e1e1',
  albastru: '#80d2ff',
};

// Teams and Players - Use embedded team data if available, otherwise lookup from store
const homeTeam = computed(() => {
  // First try embedded team data from the match
  if (props.match.homeTeam) {
    return props.match.homeTeam;
  }
  // Fall back to looking up from store
  return editionsStore.teams.find(t => t.teamId === props.match.homeTeamId);
});

const awayTeam = computed(() => {
  // First try embedded team data from the match
  if (props.match.awayTeam) {
    return props.match.awayTeam;
  }
  // Fall back to looking up from store
  return editionsStore.teams.find(t => t.teamId === props.match.awayTeamId);
});

const homeTeamPlayers = computed(() => {
  // Get team from store to access players
  const storeTeam = editionsStore.teams.find(t => t.teamId === props.match.homeTeamId);
  if (!storeTeam) return [];
  return (storeTeam.players || []).map((p: any) => ({
    playerId: p.playerId,
    playerDisplayName: `${p.firstName} ${p.lastName}`,
  }));
});

const awayTeamPlayers = computed(() => {
  // Get team from store to access players
  const storeTeam = editionsStore.teams.find(t => t.teamId === props.match.awayTeamId);
  if (!storeTeam) return [];
  return (storeTeam.players || []).map((p: any) => ({
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
  return colorMap[color] || '#ffffff';
});

const getAwayTeamColor = computed(() => {
  const color = awayTeam.value?.color || "";
  return colorMap[color] || '#ffffff';
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

