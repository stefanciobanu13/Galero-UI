import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Edition, Team, Match, Goal, Player } from '../types';
import { editionService, teamService, matchService, goalService, attendanceService, playerService } from '../services/api';

interface TeamWithPlayers extends Team {
  players: Player[];
}

interface MatchData extends Match {
  homeTeam?: Team;
  awayTeam?: Team;
  goals: Goal[];
}

export const useEditionsStore = defineStore('editions', () => {
  const currentEdition = ref<Edition | null>(null);
  const teams = ref<TeamWithPlayers[]>([]);
  const matches = ref<MatchData[]>([]);
  const goals = ref<Goal[]>([]);
  const players = ref<Player[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Local storage persistence key
  const STORAGE_KEY = 'galero_editions_state';

  const MATCH_ORDER = [
    { homeColor: 'green', awayColor: 'orange', number: 1, type: 'REGULAR' as const },
    { homeColor: 'blue', awayColor: 'gray', number: 2, type: 'REGULAR' as const },
    { homeColor: 'orange', awayColor: 'blue', number: 3, type: 'REGULAR' as const },
    { homeColor: 'gray', awayColor: 'green', number: 4, type: 'REGULAR' as const },
    { homeColor: 'green', awayColor: 'blue', number: 5, type: 'REGULAR' as const },
    { homeColor: 'orange', awayColor: 'gray', number: 6, type: 'REGULAR' as const },
    { homeColor: 'blue', awayColor: 'green', number: 7, type: 'REGULAR' as const },
    { homeColor: 'gray', awayColor: 'orange', number: 8, type: 'REGULAR' as const },
    { homeColor: 'green', awayColor: 'gray', number: 9, type: 'REGULAR' as const },
    { homeColor: 'blue', awayColor: 'orange', number: 10, type: 'REGULAR' as const },
    { homeColor: 'orange', awayColor: 'green', number: 11, type: 'REGULAR' as const },
    { homeColor: 'gray', awayColor: 'blue', number: 12, type: 'REGULAR' as const },
    { homeColor: 'placeholder', awayColor: 'placeholder', number: 13, type: 'SEMI_FINAL' as const }, // Small final - determined by standings
    { homeColor: 'placeholder', awayColor: 'placeholder', number: 14, type: 'FINAL' as const }, // Big final - determined by standings
  ];

  // Computed standings
  const standings = computed(() => {
    const teamStandings = teams.value.map(team => {
      const teamMatches = matches.value.filter(
        m => (m.homeTeamId === team.teamId || m.awayTeamId === team.teamId) && 
             (m.matchType === 'REGULAR' || m.matchType === 'SEMI_FINAL' || m.matchType === 'FINAL')
      );

      let points = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;

      teamMatches.forEach(match => {
        const isHome = match.homeTeamId === team.teamId;
        const teamScore = isHome ? (match.homeTeamScore || 0) : (match.awayTeamScore || 0);
        const opponentScore = isHome ? (match.awayTeamScore || 0) : (match.homeTeamScore || 0);

        goalsFor += teamScore;
        goalsAgainst += opponentScore;

        if (teamScore > opponentScore) {
          points += 3;
        } else if (teamScore === opponentScore) {
          points += 1;
        }
      });

      return {
        teamId: team.teamId!,
        color: team.color,
        points,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        played: teamMatches.filter(m => m.homeTeamScore !== undefined && m.awayTeamScore !== undefined).length,
      };
    });

    // Sort by points (descending), then by goal difference (descending)
    return teamStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalDifference - a.goalDifference;
    });
  });

  // Save state to localStorage
  const saveState = () => {
    try {
      const state = {
        currentEdition: currentEdition.value,
        teams: teams.value,
        matches: matches.value,
        goals: goals.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save editions state:', e);
    }
  };

  // Load state from localStorage
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        currentEdition.value = state.currentEdition;
        teams.value = state.teams;
        matches.value = state.matches;
        goals.value = state.goals;
      }
    } catch (e) {
      console.error('Failed to load editions state:', e);
    }
  };

  // Initialize edition with teams and matches
  const initializeEdition = async (edition: Edition) => {
    try {
      loading.value = true;
      error.value = null;
      currentEdition.value = edition;

      // Fetch teams for this edition
      const teamsResponse = await teamService.getByEdition(edition.editionId!);
      teams.value = teamsResponse.data.map(team => ({
        ...team,
        players: [],
      }));

      // Fetch attendance records to get players for this edition
      const attendanceResponse = await attendanceService.getAttendanceByEdition(edition.editionId!);
      const playerIds = new Set(attendanceResponse.data.map(a => a.playerId));
      
      // Fetch player details
      const allPlayers = await playerService.getAll();
      players.value = allPlayers.data.filter(p => playerIds.has(p.playerId!));

      // Fetch matches for this edition
      const matchesResponse = await matchService.getByEdition(edition.editionId!);
      matches.value = matchesResponse.data.map(match => ({
        ...match,
        goals: [],
      }));

      // Fetch goals for all matches
      const goalsResponse = await goalService.getAll();
      goals.value = goalsResponse.data.filter(g => 
        matches.value.some(m => m.matchId === g.matchId)
      );

      // Update match scores based on goals
      updateMatchScores();

      saveState();
    } catch (e: any) {
      error.value = e.message || 'Failed to initialize edition';
      console.error('Error initializing edition:', e);
    } finally {
      loading.value = false;
    }
  };

  // Create matches for edition if they don't exist
  const createMatches = async (edition: Edition) => {
    try {
      loading.value = true;
      
      for (const matchTemplate of MATCH_ORDER) {
        let homeTeamId: number | null = null;
        let awayTeamId: number | null = null;

        // Find team IDs by color
        if (matchTemplate.type === 'REGULAR') {
          const homeTeam = teams.value.find(t => t.color === matchTemplate.homeColor);
          const awayTeam = teams.value.find(t => t.color === matchTemplate.awayColor);
          homeTeamId = homeTeam?.teamId || null;
          awayTeamId = awayTeam?.teamId || null;
        } else if (matchTemplate.type === 'SEMI_FINAL') {
          // Small final: 3rd vs 4th
          const sorted = standings.value;
          homeTeamId = sorted[2]?.teamId || null;
          awayTeamId = sorted[3]?.teamId || null;
        } else if (matchTemplate.type === 'FINAL') {
          // Big final: 1st vs 2nd
          const sorted = standings.value;
          homeTeamId = sorted[0]?.teamId || null;
          awayTeamId = sorted[1]?.teamId || null;
        }

        if (homeTeamId && awayTeamId) {
          const matchData: Match = {
            editionId: edition.editionId!,
            homeTeamId,
            awayTeamId,
            matchNumber: matchTemplate.number,
            matchType: matchTemplate.type,
          };

          const response = await matchService.create(matchData);
          matches.value.push({
            ...response.data,
            goals: [],
          });
        }
      }

      saveState();
    } catch (e: any) {
      error.value = e.message || 'Failed to create matches';
      console.error('Error creating matches:', e);
    } finally {
      loading.value = false;
    }
  };

  // Add goal to match
  const addGoal = async (matchId: number, playerId: number, teamId: number, goalType: 'NORMAL' | 'PENALTY' | 'OWN_GOAL' = 'NORMAL') => {
    try {
      const goalData: Goal = {
        matchId,
        playerId,
        teamId,
        goalType,
      };

      const response = await goalService.create(goalData);
      goals.value.push(response.data);

      // Update match scores
      updateMatchScores();

      saveState();
      return response.data;
    } catch (e: any) {
      error.value = e.message || 'Failed to add goal';
      throw e;
    }
  };

  // Remove goal
  const removeGoal = async (goalId: number) => {
    try {
      await goalService.delete(goalId);
      goals.value = goals.value.filter(g => g.goalId !== goalId);

      // Update match scores
      updateMatchScores();

      saveState();
    } catch (e: any) {
      error.value = e.message || 'Failed to remove goal';
      throw e;
    }
  };

  // Update match scores based on goals
  const updateMatchScores = () => {
    matches.value.forEach(match => {
      const matchGoals = goals.value.filter(g => g.matchId === match.matchId);
      
      const homeGoals = matchGoals.filter(g => g.teamId === match.homeTeamId && g.goalType !== 'OWN_GOAL').length;
      const awayGoals = matchGoals.filter(g => g.teamId === match.awayTeamId && g.goalType !== 'OWN_GOAL').length;
      
      // Add own goals
      const homeOwnGoals = matchGoals.filter(g => g.teamId === match.awayTeamId && g.goalType === 'OWN_GOAL').length;
      const awayOwnGoals = matchGoals.filter(g => g.teamId === match.homeTeamId && g.goalType === 'OWN_GOAL').length;

      match.homeTeamScore = homeGoals + awayOwnGoals;
      match.awayTeamScore = awayGoals + homeOwnGoals;
      match.goals = matchGoals;
    });
  };

  // Save all changes to backend
  const saveEdition = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Update all matches
      for (const match of matches.value) {
        if (match.matchId) {
          await matchService.update(match.matchId, {
            ...match,
            homeTeamScore: match.homeTeamScore || 0,
            awayTeamScore: match.awayTeamScore || 0,
          });
        }
      }

      // Goals are already saved individually when added
      saveState();
    } catch (e: any) {
      error.value = e.message || 'Failed to save edition';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Get team color
  const getTeamColor = (teamId: number) => {
    return teams.value.find(t => t.teamId === teamId)?.color || '';
  };

  // Get team players
  const getTeamPlayers = (teamId: number) => {
    const team = teams.value.find(t => t.teamId === teamId);
    return team?.players || [];
  };

  // Reset store state
  const resetStore = () => {
    currentEdition.value = null;
    teams.value = [];
    matches.value = [];
    goals.value = [];
    players.value = [];
    error.value = null;
  };

  return {
    currentEdition,
    teams,
    matches,
    goals,
    players,
    standings,
    loading,
    error,
    initializeEdition,
    createMatches,
    addGoal,
    removeGoal,
    saveEdition,
    getTeamColor,
    getTeamPlayers,
    loadState,
    resetStore,
    $reset: resetStore,
  };
});
