<template>
  <v-container class="editions-page">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <h1>Create & Manage Edition</h1>
      </v-col>
    </v-row>

    <!-- Edition Creation Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="pa-6">
          <v-card-title class="mb-4">Edition Details</v-card-title>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="editionForm.editionNumber"
                type="number"
                label="Edition Number"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editionForm.date"
                type="date"
                label="Edition Date"
                outlined
                dense
              />
            </v-col>
          </v-row>

          <!-- Initialize Button -->
          <v-row v-if="teams.length === 0">
            <v-col cols="12">
              <v-btn
                @click="initializeEdition"
                color="primary"
                block
                :disabled="!editionForm.date || !editionForm.editionNumber"
                :loading="isInitializing"
              >
                Initialize Edition (Create Teams & Matches)
              </v-btn>
            </v-col>
          </v-row>

          <!-- Reset Button (only show if edition is initialized) -->
          <v-row v-if="teams.length > 0">
            <v-col cols="12">
              <v-btn
                @click="resetEdition"
                variant="outlined"
                color="warning"
                block
              >
                Reset & Create New Edition
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content (Teams, Matches, Standings) - Always show after edition initialized -->
    <template v-if="teams.length > 0">
      <!-- Team Setup Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card>
            <v-card-title>Team Setup</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6" lg="3" v-for="team in teams" :key="team.teamId">
                  <v-card :style="{ borderLeft: `4px solid ${getColorValue(team.color)}` }" class="pa-4">
                    <h3 class="text-capitalize mb-2">{{ team.color }} Team</h3>
                    <v-divider class="mb-3" />
                    <div v-if="team.players.length > 0">
                      <p class="text-caption mb-2">Players:</p>
                      <v-chip
                        v-for="player in team.players"
                        :key="player.playerId"
                        size="small"
                        class="mr-1 mb-1"
                      >
                        {{ player.firstName }} {{ player.lastName }}
                      </v-chip>
                    </div>
                    <p v-else class="text-caption text-gray-500">No players assigned yet</p>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Standings Section -->
      <v-row class="mb-6" v-if="editionsStore.standings.length > 0">
        <v-col cols="12">
          <v-card>
            <v-card-title>Standings</v-card-title>
            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th class="text-left">Position</th>
                    <th class="text-left">Team</th>
                    <th class="text-center">Played</th>
                    <th class="text-center">Points</th>
                    <th class="text-center">For</th>
                    <th class="text-center">Against</th>
                    <th class="text-center">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(standing, index) in editionsStore.standings"
                    :key="standing.teamId"
                    :style="{ backgroundColor: getColorValue(standing.color) + '20' }"
                  >
                    <td class="font-weight-bold">{{ index + 1 }}</td>
                    <td>
                      <span
                        class="d-inline-block"
                        :style="{
                          width: '16px',
                          height: '16px',
                          backgroundColor: getColorValue(standing.color),
                          borderRadius: '2px',
                          marginRight: '8px',
                        }"
                      />
                      <span class="text-capitalize">{{ standing.color }}</span>
                    </td>
                    <td class="text-center">{{ standing.played }}</td>
                    <td class="text-center font-weight-bold">{{ standing.points }}</td>
                    <td class="text-center">{{ standing.goalsFor }}</td>
                    <td class="text-center">{{ standing.goalsAgainst }}</td>
                    <td class="text-center">{{ standing.goalDifference > 0 ? '+' : '' }}{{ standing.goalDifference }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Matches Section -->
      <v-row class="mb-6" v-if="editionsStore.matches.length > 0">
        <v-col cols="12">
          <v-card>
            <v-card-title>Matches</v-card-title>
            <v-card-text>
              <!-- Round Robin Matches -->
              <div v-if="regularMatches.length > 0" class="mb-6">
                <h3 class="mb-4">Regular Matches</h3>
                <v-row>
                  <v-col cols="12" md="6" lg="4" v-for="match in regularMatches" :key="match.matchId">
                    <MatchCard :match="match" @goal-added="onGoalAdded" />
                  </v-col>
                </v-row>
              </div>

              <!-- Finals -->
              <div v-if="finalMatches.length > 0">
                <h3 class="mb-4">Finals</h3>
                <v-row>
                  <v-col cols="12" md="6" v-for="match in finalMatches" :key="match.matchId">
                    <MatchCard :match="match" @goal-added="onGoalAdded" />
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Save Button at the Bottom -->
      <v-row class="mb-4 sticky-save-button">
        <v-col cols="12">
          <v-btn
            @click="saveEdition"
            color="success"
            size="large"
            block
            :loading="editionsStore.loading"
          >
            Save Edition (All Teams, Matches & Goals)
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- Error Message -->
    <v-row v-if="editionsStore.error">
      <v-col cols="12">
        <v-alert type="error" closable>
          {{ editionsStore.error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="editionsStore.loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEditionsStore } from '../stores/editions';
import { editionService, teamService, matchService, teamPlayerService, attendanceService, playerService } from '../services/api';
import MatchCard from '../components/MatchCard.vue';
import type { Edition } from '../types';

const editionsStore = useEditionsStore();
const isInitializing = ref(false);

const editionForm = ref({
  editionNumber: 1,
  date: '',
});

const teams = computed(() => editionsStore.teams);
const regularMatches = computed(() => 
  editionsStore.matches.filter(m => m.matchType === 'REGULAR')
);
const finalMatches = computed(() =>
  editionsStore.matches.filter(m => m.matchType !== 'REGULAR')
);

const colorMap: Record<string, string> = {
  green: '#4CAF50',
  orange: '#FF9800',
  gray: '#9E9E9E',
  blue: '#2196F3',
};

const getColorValue = (color: string): string => {
  return colorMap[color] || '#000';
};

const initializeEdition = async () => {
  try {
    isInitializing.value = true;

    // Step 1: Get players from attendance (we don't save edition yet)
    // For now, we'll just work with mock edition data locally
    // We'll create the actual edition when saving
    
    // Step 2: Create the 4 teams locally in store
    const teamColors: Array<'green' | 'orange' | 'gray' | 'blue'> = ['green', 'orange', 'gray', 'blue'];
    const teamIds: Record<string, number> = {};
    let teamIdCounter = 1;

    for (const color of teamColors) {
      const teamData = {
        teamId: teamIdCounter,
        editionId: 0, // Will be set when saved
        color: color,
        players: [],
      };
      editionsStore.teams.push(teamData);
      teamIds[color] = teamIdCounter;
      teamIdCounter++;
    }

    // Step 3: Assign players from attendance to teams
    try {
      const allPlayers = await playerService.getAll();
      const editionPlayers = allPlayers.data.slice(0, 12); // Take first 12 players for demo

      // Distribute players to teams (round-robin style)
      let playerIndex = 0;
      for (const color of teamColors) {
        const teamIdx = editionsStore.teams.findIndex(t => t.color === color);
        const playersPerTeam = Math.ceil(editionPlayers.length / 4);
        for (let i = 0; i < playersPerTeam && playerIndex < editionPlayers.length; i++) {
          if (teamIdx >= 0) {
            editionsStore.teams[teamIdx].players.push(editionPlayers[playerIndex]);
          }
          playerIndex++;
        }
      }
    } catch (e) {
      console.warn('Could not fetch players:', e);
    }

    // Step 4: Create all matches locally
    const MATCH_ORDER = [
      { homeColor: 'green', awayColor: 'orange', number: 1, type: 'REGULAR' },
      { homeColor: 'blue', awayColor: 'gray', number: 2, type: 'REGULAR' },
      { homeColor: 'orange', awayColor: 'blue', number: 3, type: 'REGULAR' },
      { homeColor: 'gray', awayColor: 'green', number: 4, type: 'REGULAR' },
      { homeColor: 'green', awayColor: 'blue', number: 5, type: 'REGULAR' },
      { homeColor: 'orange', awayColor: 'gray', number: 6, type: 'REGULAR' },
      { homeColor: 'blue', awayColor: 'green', number: 7, type: 'REGULAR' },
      { homeColor: 'gray', awayColor: 'orange', number: 8, type: 'REGULAR' },
      { homeColor: 'green', awayColor: 'gray', number: 9, type: 'REGULAR' },
      { homeColor: 'blue', awayColor: 'orange', number: 10, type: 'REGULAR' },
      { homeColor: 'orange', awayColor: 'green', number: 11, type: 'REGULAR' },
      { homeColor: 'gray', awayColor: 'blue', number: 12, type: 'REGULAR' },
      { homeColor: '', awayColor: '', number: 13, type: 'SEMI_FINAL' },
      { homeColor: '', awayColor: '', number: 14, type: 'FINAL' },
    ];

    let matchIdCounter = 1;
    for (const matchTemplate of MATCH_ORDER) {
      let homeTeamId: number | null = null;
      let awayTeamId: number | null = null;

      if (matchTemplate.type === 'REGULAR') {
        homeTeamId = teamIds[matchTemplate.homeColor];
        awayTeamId = teamIds[matchTemplate.awayColor];
      } else {
        homeTeamId = teamIds['green'];
        awayTeamId = teamIds['orange'];
      }

      if (homeTeamId && awayTeamId) {
        const matchData = {
          matchId: matchIdCounter,
          editionId: 0,
          homeTeamId,
          awayTeamId,
          matchNumber: matchTemplate.number,
          matchType: matchTemplate.type,
          homeTeamScore: 0,
          awayTeamScore: 0,
          goals: [],
        };
        editionsStore.matches.push(matchData);
        matchIdCounter++;
      }
    }

    // Set current edition to mark as initialized
    editionsStore.currentEdition = {
      editionNumber: editionForm.value.editionNumber,
      date: editionForm.value.date,
    };
  } catch (e: any) {
    console.error('Failed to initialize edition:', e);
    alert('Error initializing edition: ' + (e.message || 'Unknown error'));
  } finally {
    isInitializing.value = false;
  }
};

const resetEdition = () => {
  editionsStore.resetStore();
  editionForm.value = {
    editionNumber: (editionForm.value.editionNumber || 0) + 1,
    date: '',
  };
};

const saveEdition = async () => {
  try {
    if (!editionsStore.currentEdition) {
      alert('Please initialize an edition first');
      return;
    }

    // Step 1: Create the edition
    const newEdition: Edition = {
      editionNumber: editionForm.value.editionNumber,
      date: editionForm.value.date,
    };
    const editionResponse = await editionService.create(newEdition);
    const createdEdition = editionResponse.data;

    // Step 2: Create teams in backend with the real edition ID
    const teamIdMap: Record<number, number> = {};
    for (const team of editionsStore.teams) {
      const teamData = {
        editionId: createdEdition.editionId!,
        color: team.color,
      };
      const teamResponse = await teamService.create(teamData);
      teamIdMap[team.teamId!] = teamResponse.data.teamId!;
    }

    // Step 3: Assign players to teams
    for (const team of editionsStore.teams) {
      const newTeamId = teamIdMap[team.teamId!];
      for (const player of team.players) {
        await teamPlayerService.addPlayerToTeam(newTeamId, player.playerId!);
      }
    }

    // Step 4: Create matches in backend
    const matchIdMap: Record<number, number> = {};
    for (const match of editionsStore.matches) {
      const matchData = {
        editionId: createdEdition.editionId!,
        homeTeamId: teamIdMap[match.homeTeamId],
        awayTeamId: teamIdMap[match.awayTeamId],
        matchNumber: match.matchNumber,
        matchType: match.matchType,
      };
      const matchResponse = await matchService.create(matchData);
      matchIdMap[match.matchId!] = matchResponse.data.matchId!;
    }

    // Step 5: Create goals in backend
    for (const goal of editionsStore.goals) {
      const goalData = {
        matchId: matchIdMap[goal.matchId],
        teamId: teamIdMap[goal.teamId],
        playerId: goal.playerId,
        goalType: goal.goalType,
      };
      await (editionsStore.goalService || goalService).create(goalData);
    }

    alert('Edition saved successfully!');
    resetEdition();
  } catch (e: any) {
    console.error('Failed to save edition:', e);
    alert('Failed to save edition: ' + (e.message || 'Unknown error'));
  }
};

const onGoalAdded = () => {
  // Standings will update automatically due to computed property reactivity
};

onMounted(async () => {
  editionsStore.resetStore();
});
</script>

<style scoped>
.editions-page {
  padding: 20px;
}

h1 {
  color: #1976d2;
  margin-bottom: 30px;
}

h2 {
  color: #333;
  font-size: 1.3rem;
}

h3 {
  color: #555;
  font-size: 1.1rem;
}

.text-capitalize {
  text-transform: capitalize;
}

.sticky-save-button {
  position: sticky;
  bottom: 0;
  background-color: white;
  padding: 16px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
</style>
