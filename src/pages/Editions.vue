<template>
  <v-container class="editions-page">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <h1>Editions</h1>
      </v-col>
    </v-row>

    <!-- Browse/Create Section -->
    <v-row class="mb-6" v-if="!selectedEditionForView && !isCreatingNew">
      <v-col cols="12">
        <v-card class="pa-6">
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <h2>Available Editions</h2>
            </v-col>
            <v-col cols="12" md="6">
              <v-row class="gap-2">
                <v-col cols="12">
                  <v-btn
                    @click="startCreatingNew"
                    color="primary"
                    block
                    prepend-icon="mdi-plus"
                  >
                    Add New Edition
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row v-if="existingEditions.length > 0">
            <v-col cols="12" md="6" lg="4" v-for="edition in existingEditions" :key="edition.editionId">
              <v-card class="edition-card">
                <v-card-text>
                  <h3 class="mb-2">Edition {{ edition.editionNumber }}</h3>
                  <p class="text-caption text-gray-600 mb-3">
                    {{ formatDate(edition.date) }}
                  </p>
                  <v-row class="gap-2">
                    <v-col cols="6">
                      <v-btn
                        color="info"
                        size="small"
                        block
                        @click="selectEdition(edition)"
                      >
                        View & Edit
                      </v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-btn
                        class="deleteBtn"
                        color="error"
                        rounded
                        block
                        @click="confirmDeleteEdition(edition)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col cols="12">
              <v-alert type="info">
                No editions created yet. Click "Add New Edition" to get started!
              </v-alert>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Back Button -->
    <v-row class="mb-4" v-if="selectedEditionForView || isCreatingNew">
      <v-col cols="12">
        <v-btn @click="goBack" variant="outlined" prepend-icon="mdi-arrow-left">
          Back to Editions
        </v-btn>
      </v-col>
    </v-row>

    <!-- Create New Edition Section -->
    <template v-if="isCreatingNew">
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="pa-6">
            <v-card-title class="mb-4">Create New Edition</v-card-title>

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
            <v-row v-if="teams.length === 0" class="mt-4">
              <v-col cols="12">
                <v-btn
                  @click="initializeEdition"
                  color="primary"
                  block
                  :disabled="!editionForm.date || !editionForm.editionNumber"
                  :loading="isInitializing"
                >
                  Initialize Edition
                </v-btn>
              </v-col>
            </v-row>

            <!-- Reset Button (only show if edition is initialized) -->
            <v-row v-if="teams.length > 0" class="mt-4">
              <v-col cols="12">
                <v-btn
                  @click="resetEdition"
                  variant="outlined"
                  color="warning"
                  block
                >
                  Reset & Start Over
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Main Content (Teams, Matches, Standings) - Show for both new and existing editions -->
    <template v-if="teams.length > 0">
      <!-- Team Setup Section -->
      <v-row class="mb-6">
        <v-col id="first2Teams" cols="12">
          <v-card>
            <v-card-text>
              <v-row>
                <v-col cols="6" v-for="team in teams" :key="team.teamId">
                  <v-card :style="{ borderLeft: `4px solid ${getColorValue(team.color)}` }" class="pa-4">
                    <h3 class="text-capitalize mb-2">{{ team.color }} Team</h3>
                    <v-divider class="mb-3" />
                    <div v-if="team.players.length > 0" class="d-flex flex-column gap-2">
                      <v-chip
                        v-for="player in team.players"
                        :key="player.playerId"
                        size="small"
                        class="w-100"
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
                      <span class="text-capitalize">{{ standing.color }}</span>
                    </td>
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

      <!-- Matches Section with Expansion Panels -->
      <v-row class="mb-6" v-if="editionsStore.matches.length > 0">
        <v-col cols="12">
          <v-card>
            <v-card-title>Matches</v-card-title>
            <v-card-text>
              <!-- Regular Matches Expansion Panel -->
              <v-expansion-panels v-if="regularMatches.length > 0" class="mb-4">
                <v-expansion-panel v-for="match in regularMatches" :key="match.matchId">
                  <v-expansion-panel-title>
                    <div class="d-flex justify-space-between align-center w-100">
                      <span class="font-weight-bold">Match {{ match.matchNumber }}</span>
                      <span class="text-caption">{{ homeTeamName(match) }} vs {{ awayTeamName(match) }}</span>
                      <span class="font-weight-bold" :class="{ 'text-grey': !match.isPlayed }">
                        {{ match.isPlayed ? `${match.homeTeamScore ?? 0} - ${match.awayTeamScore ?? 0}` : 'Not played' }}
                      </span>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <MatchCard :match="match" @goal-added="onGoalAdded" />
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Finals Expansion Panel -->
              <v-expansion-panels v-if="finalMatches.length > 0">
                <v-expansion-panel v-for="match in finalMatches" :key="match.matchId">
                  <v-expansion-panel-title>
                    <div class="d-flex justify-space-between align-center w-100">
                      <span class="font-weight-bold">{{ matchTypeLabel(match) }}</span>
                      <span class="text-caption">{{ homeTeamName(match) }} vs {{ awayTeamName(match) }}</span>
                      <span class="font-weight-bold" :class="{ 'text-grey': !match.isPlayed }">
                        {{ match.isPlayed ? `${match.homeTeamScore ?? 0} - ${match.awayTeamScore ?? 0}` : 'Not played' }}
                      </span>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <MatchCard :match="match" @goal-added="onGoalAdded" />
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Save Button at the Bottom (only for new editions) -->
      <v-row v-if="isCreatingNew" class="mb-4 sticky-save-button">
        <v-col cols="12">
          <v-btn
            @click="saveEdition"
            color="success"
            size="large"
            block
            :loading="isCreatingNew && editionsStore.loading"
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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Edition</v-card-title>
        <v-card-text>
          Are you sure you want to delete Edition {{ editionToDelete?.editionNumber }}? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteEdition" :loading="isDeleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEditionsStore } from '../stores/editions';
import { editionService, teamService, matchService, teamPlayerService, playerService, goalService } from '../services/api';
import MatchCard from '../components/MatchCard.vue';
import type { Edition } from '../types';

const editionsStore = useEditionsStore();
const isInitializing = ref(false);
const isCreatingNew = ref(false);
const selectedEditionForView = ref<Edition | null>(null);
const existingEditions = ref<Edition[]>([]);
const showDeleteDialog = ref(false);
const editionToDelete = ref<Edition | null>(null);
const isDeleting = ref(false);

const editionForm = ref({
  editionNumber: 1,
  date: '',
});

const teams = computed(() => editionsStore.teams);
const regularMatches = computed(() =>
  editionsStore.matches.filter(m => m.matchType === 'group')
);
const finalMatches = computed(() =>
  editionsStore.matches.filter(m => m.matchType !== 'group')
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

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const loadExistingEditions = async () => {
  try {
    const response = await editionService.getAll();
    existingEditions.value = response.data.sort((a, b) => (b.editionNumber || 0) - (a.editionNumber || 0));
  } catch (e) {
    console.error('Failed to load editions:', e);
  }
};

const startCreatingNew = () => {
  isCreatingNew.value = true;
  editionsStore.resetStore();
  editionsStore.setCreatingNewEdition(true);
  editionForm.value = {
    editionNumber: (existingEditions.value.length > 0 
      ? Math.max(...existingEditions.value.map(e => e.editionNumber || 0)) + 1 
      : 1),
    date: '',
  };
};

const selectEdition = async (edition: Edition) => {
  try {
    selectedEditionForView.value = edition;
    await editionsStore.initializeEdition(edition);
  } catch (e) {
    console.error('Failed to load edition:', e);
    alert('Failed to load edition');
    selectedEditionForView.value = null;
  }
};

const initializeEdition = async () => {
  try {
    isInitializing.value = true;

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
      const editionPlayers = allPlayers.data;

      // Distribute players to teams - 6 players per team
      const playersPerTeam = 6;
      let playerIndex = 0;

      for (const color of teamColors) {
        const teamIdx = editionsStore.teams.findIndex(t => t.color === color);
        if (teamIdx >= 0) {
          for (let i = 0; i < playersPerTeam && playerIndex < editionPlayers.length; i++) {
            editionsStore.teams[teamIdx].players.push(editionPlayers[playerIndex]);
            playerIndex++;
          }
        }
      }

      // Also populate the editionsStore.players with all players used in this edition
      editionsStore.players = editionPlayers.slice(0, playersPerTeam * teamColors.length);
    } catch (e) {
      console.warn('Could not fetch players:', e);
    }

    // Step 4: Create all matches locally
    const MATCH_ORDER = [
      { homeColor: 'green', awayColor: 'orange', number: 1, type: 'group' },
      { homeColor: 'blue', awayColor: 'gray', number: 2, type: 'group' },
      { homeColor: 'orange', awayColor: 'blue', number: 3, type: 'group' },
      { homeColor: 'gray', awayColor: 'green', number: 4, type: 'group' },
      { homeColor: 'green', awayColor: 'blue', number: 5, type: 'group' },
      { homeColor: 'orange', awayColor: 'gray', number: 6, type: 'group' },
      { homeColor: 'blue', awayColor: 'green', number: 7, type: 'group' },
      { homeColor: 'gray', awayColor: 'orange', number: 8, type: 'group' },
      { homeColor: 'green', awayColor: 'gray', number: 9, type: 'group' },
      { homeColor: 'blue', awayColor: 'orange', number: 10, type: 'group' },
      { homeColor: 'orange', awayColor: 'green', number: 11, type: 'group' },
      { homeColor: 'gray', awayColor: 'blue', number: 12, type: 'group' },
      { homeColor: '', awayColor: '', number: 13, type: 'small_final' },
      { homeColor: '', awayColor: '', number: 14, type: 'big_final' },
    ];

    let matchIdCounter = 1;
    for (const matchTemplate of MATCH_ORDER) {
      let homeTeamId: number | null = null;
      let awayTeamId: number | null = null;

      if (matchTemplate.type === 'group') {
        homeTeamId = teamIds[matchTemplate.homeColor];
        awayTeamId = teamIds[matchTemplate.awayColor];
      } else {
        // Finals: temporarily assign placeholder teams, will be updated based on standings
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
          homeTeamScore: null,
          awayTeamScore: null,
          isPlayed: false,
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
        teamColor: team.color,
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
        team1Id: teamIdMap[match.homeTeamId],
        team2Id: teamIdMap[match.awayTeamId],
        stage: match.matchNumber,
        team1Score: match.homeTeamScore || 0,
        team2Score: match.awayTeamScore || 0,
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
      await goalService.create(goalData);
    }

    alert('Edition saved successfully!');
    goBack();
  } catch (e: any) {
    console.error('Failed to save edition:', e);
    alert('Failed to save edition: ' + (e.message || 'Unknown error'));
  }
};

const goBack = () => {
  editionsStore.resetStore();
  editionsStore.setCreatingNewEdition(false);
  selectedEditionForView.value = null;
  isCreatingNew.value = false;
  loadExistingEditions();
};

const confirmDeleteEdition = (edition: Edition) => {
  editionToDelete.value = edition;
  showDeleteDialog.value = true;
};

const deleteEdition = async () => {
  try {
    if (!editionToDelete.value?.editionId) {
      alert('Invalid edition');
      return;
    }

    isDeleting.value = true;
    await editionService.delete(editionToDelete.value.editionId);
    
    showDeleteDialog.value = false;
    editionToDelete.value = null;
    await loadExistingEditions();
    alert('Edition deleted successfully');
  } catch (e: any) {
    console.error('Failed to delete edition:', e);
    alert('Failed to delete edition: ' + (e.message || 'Unknown error'));
  } finally {
    isDeleting.value = false;
  }
};

const onGoalAdded = () => {
  // Standings will update automatically due to computed property reactivity
};

const homeTeamName = (match: any): string => {
  const team = editionsStore.teams.find(t => t.teamId === match.homeTeamId);
  return team ? team.color : 'Unknown';
};

const awayTeamName = (match: any): string => {
  const team = editionsStore.teams.find(t => t.teamId === match.awayTeamId);
  return team ? team.color : 'Unknown';
};

const matchTypeLabel = (match: any): string => {
  if (match.matchType === 'small_final') return 'Small Final';
  if (match.matchType === 'big_final') return 'Big Final';
  return `Match ${match.matchNumber}`;
};

onMounted(async () => {
  editionsStore.resetStore();
  await loadExistingEditions();
});
</script>

<style scoped>
.editions-page {
  padding: 20px;
}

deleteBtn{
min-width: 5%!important;
width: 1px!important;
height: 2px!important;
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

.edition-card {
  transition: all 0.3s ease;
}

.edition-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
