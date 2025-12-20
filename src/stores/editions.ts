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
  const isCreatingNewEdition = ref(false);

  // Local storage persistence key
  const STORAGE_KEY = 'galero_editions_state';

  const MATCH_ORDER = [
    { homeColor: 'Green', awayColor: 'Orange', number: 1, type: 'REGULAR' as const },
    { homeColor: 'Blue', awayColor: 'Gray', number: 2, type: 'REGULAR' as const },
    { homeColor: 'Orange', awayColor: 'Blue', number: 3, type: 'REGULAR' as const },
    { homeColor: 'Gray', awayColor: 'Green', number: 4, type: 'REGULAR' as const },
    { homeColor: 'Green', awayColor: 'Blue', number: 5, type: 'REGULAR' as const },
    { homeColor: 'Orange', awayColor: 'Gray', number: 6, type: 'REGULAR' as const },
    { homeColor: 'Blue', awayColor: 'Green', number: 7, type: 'REGULAR' as const },
    { homeColor: 'Gray', awayColor: 'Orange', number: 8, type: 'REGULAR' as const },
    { homeColor: 'Green', awayColor: 'Gray', number: 9, type: 'REGULAR' as const },
    { homeColor: 'Blue', awayColor: 'Orange', number: 10, type: 'REGULAR' as const },
    { homeColor: 'Orange', awayColor: 'Green', number: 11, type: 'REGULAR' as const },
    { homeColor: 'Gray', awayColor: 'Blue', number: 12, type: 'REGULAR' as const },
    { homeColor: 'placeholder', awayColor: 'placeholder', number: 13, type: 'SEMI_FINAL' as const }, // Small final - determined by standings
    { homeColor: 'placeholder', awayColor: 'placeholder', number: 14, type: 'FINAL' as const }, // Big final - determined by standings
  ];

  // Computed standings - Only based on REGULAR matches for determining final placements
  const standings = computed(() => {
    const teamStandings = teams.value.map(team => {
      const teamMatches = matches.value.filter(
        m => (m.homeTeamId === team.teamId || m.awayTeamId === team.teamId) && 
             m.matchType === 'REGULAR' &&
             // Only count matches that are marked as played
             m.isPlayed === true
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
        played: teamMatches.length,
      };
    });

    // Sort by points (descending), then by goal difference (descending)
    return teamStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalDifference - a.goalDifference;
    });
  });

  // Update final match teams based on current standings
  const updateFinalMatchTeams = () => {
    const sorted = standings.value;
    if (sorted.length < 4) return;

    // Update Small Final (SEMI_FINAL): 3rd vs 4th
    const smallFinal = matches.value.find(m => m.matchType === 'SEMI_FINAL');
    if (smallFinal && sorted[2]?.teamId && sorted[3]?.teamId) {
      smallFinal.homeTeamId = sorted[2].teamId;
      smallFinal.awayTeamId = sorted[3].teamId;
    }

    // Update Big Final (FINAL): 1st vs 2nd
    const bigFinal = matches.value.find(m => m.matchType === 'FINAL');
    if (bigFinal && sorted[0]?.teamId && sorted[1]?.teamId) {
      bigFinal.homeTeamId = sorted[0].teamId;
      bigFinal.awayTeamId = sorted[1].teamId;
    }
  };

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
        // Ensure isPlayed is set for each match (for backwards compatibility)
        matches.value = (state.matches || []).map((m: any) => ({
          ...m,
          isPlayed: m.isPlayed ?? false,
        }));
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
        isPlayed: false, // Will be updated based on goals
        goals: [],
      }));

      // Fetch goals for all matches
      const goalsResponse = await goalService.getAll();
      goals.value = goalsResponse.data.filter(g => 
        matches.value.some(m => m.matchId === g.matchId)
      );

      // Mark matches as played if they have goals
      matches.value.forEach(match => {
        const hasGoals = goals.value.some(g => g.matchId === match.matchId);
        if (hasGoals) {
          match.isPlayed = true;
        }
      });

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

      // If creating new edition, just add to local state
      if (isCreatingNewEdition.value) {
        // Generate a temporary negative ID for local goals (to distinguish from database IDs)
        const tempId = Math.min(...goals.value.filter(g => g.goalId && g.goalId < 0).map(g => g.goalId || 0), 0) - 1;
        goalData.goalId = tempId;
        goals.value.push(goalData);
      } else {
        // If editing existing edition, save to database
        const response = await goalService.create(goalData);
        goals.value.push(response.data);
      }

      // Automatically mark the match as played when a goal is added
      const match = matches.value.find(m => m.matchId === matchId);
      if (match && !match.isPlayed) {
        match.isPlayed = true;
      }

      // Update match scores
      updateMatchScores();

      saveState();
      return goalData;
    } catch (e: any) {
      error.value = e.message || 'Failed to add goal';
      throw e;
    }
  };

  // Remove goal
  const removeGoal = async (goalId: number) => {
    try {
      // If creating new edition, just remove from local state
      if (isCreatingNewEdition.value) {
        goals.value = goals.value.filter(g => g.goalId !== goalId);
      } else {
        // If editing existing edition, delete from database
        await goalService.delete(goalId);
        goals.value = goals.value.filter(g => g.goalId !== goalId);
      }

      // Update match scores
      updateMatchScores();

      saveState();
    } catch (e: any) {
      error.value = e.message || 'Failed to remove goal';
      throw e;
    }
  };

  // Update match scores based on goals (only for played matches)
  const updateMatchScores = () => {
    matches.value.forEach(match => {
      const matchGoals = goals.value.filter(g => g.matchId === match.matchId);
      match.goals = matchGoals;
      
      // Only calculate scores for matches that are marked as played
      if (match.isPlayed) {
        // Count regular goals for each team
        const homeGoals = matchGoals.filter(g => g.teamId === match.homeTeamId && g.goalType !== 'OWN_GOAL').length;
        const awayGoals = matchGoals.filter(g => g.teamId === match.awayTeamId && g.goalType !== 'OWN_GOAL').length;
        
        // Count own goals - credited to the opposing team
        const homeOwnGoals = matchGoals.filter(g => g.teamId === match.awayTeamId && g.goalType === 'OWN_GOAL').length;
        const awayOwnGoals = matchGoals.filter(g => g.teamId === match.homeTeamId && g.goalType === 'OWN_GOAL').length;

        match.homeTeamScore = homeGoals + homeOwnGoals;
        match.awayTeamScore = awayGoals + awayOwnGoals;
      } else {
        // Keep scores as null for unplayed matches
        match.homeTeamScore = null;
        match.awayTeamScore = null;
      }
    });

    // Update final match teams based on current standings
    updateFinalMatchTeams();
  };

  // Mark a match as played (enables score tracking)
  const markMatchAsPlayed = (matchId: number, isPlayed: boolean = true) => {
    const match = matches.value.find(m => m.matchId === matchId);
    if (match) {
      match.isPlayed = isPlayed;
      updateMatchScores();
      saveState();
    }
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
    isCreatingNewEdition.value = false;
  };

  // Set creating new edition mode
  const setCreatingNewEdition = (creating: boolean) => {
    isCreatingNewEdition.value = creating;
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
    markMatchAsPlayed,
    updateFinalMatchTeams,
    saveEdition,
    getTeamColor,
    getTeamPlayers,
    loadState,
    resetStore,
    setCreatingNewEdition,
    $reset: resetStore,
  };
});
