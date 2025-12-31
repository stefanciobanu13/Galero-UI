import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Edition, Team, Match, Goal, Player } from '../types';
import { editionService, matchService, goalService } from '../services/api';

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
  let autoSaveSetup = false;

  const MATCH_ORDER = [
    { homeColor: 'green', awayColor: 'orange', number: 1, type: 'group' as const },
    { homeColor: 'blue', awayColor: 'gray', number: 2, type: 'group' as const },
    { homeColor: 'orange', awayColor: 'blue', number: 3, type: 'group' as const },
    { homeColor: 'gray', awayColor: 'green', number: 4, type: 'group' as const },
    { homeColor: 'green', awayColor: 'blue', number: 5, type: 'group' as const },
    { homeColor: 'orange', awayColor: 'gray', number: 6, type: 'group' as const },
    { homeColor: 'blue', awayColor: 'green', number: 7, type: 'group' as const },
    { homeColor: 'gray', awayColor: 'orange', number: 8, type: 'group' as const },
    { homeColor: 'green', awayColor: 'gray', number: 9, type: 'group' as const },
    { homeColor: 'blue', awayColor: 'orange', number: 10, type: 'group' as const },
    { homeColor: 'orange', awayColor: 'green', number: 11, type: 'group' as const },
    { homeColor: 'gray', awayColor: 'blue', number: 12, type: 'group' as const },
    { homeColor: 'placeholder', awayColor: 'placeholder', number: 13, type: 'small_final' as const }, // Small final - determined by standings
    { homeColor: 'placeholder', awayColor: 'placeholder', number: 14, type: 'big_final' as const }, // Big final - determined by standings
  ];

  // Helper function to calculate head-to-head stats between two teams
  const getHeadToHeadStats = (teamA: number, teamB: number, currentMatches: MatchData[]) => {
    const h2hMatches = currentMatches.filter(
      m => (m.homeTeamId === teamA || m.awayTeamId === teamA) &&
           (m.homeTeamId === teamB || m.awayTeamId === teamB) &&
           m.matchType === 'group' &&
           m.isPlayed === true
    );

    let points = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    h2hMatches.forEach(match => {
      const isHome = match.homeTeamId === teamA;
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

    return { points, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst };
  };

  // Helper function to compare teams with full tiebreaker rules
  const compareTeamsWithTiebreakers = (
    standingsA: any,
    standingsB: any,
    currentMatches: MatchData[]
  ): number => {
    // Rule 1: Compare points
    if (standingsB.points !== standingsA.points) {
      return standingsB.points - standingsA.points;
    }

    // Rule 2: Direct matches (head-to-head)
    const h2hA = getHeadToHeadStats(standingsA.teamId, standingsB.teamId, currentMatches);
    const h2hB = getHeadToHeadStats(standingsB.teamId, standingsA.teamId, currentMatches);

    if (h2hA.points !== h2hB.points) {
      return h2hB.points - h2hA.points;
    }

    // If head-to-head points are also equal, check head-to-head goal difference
    if (h2hA.goalDifference !== h2hB.goalDifference) {
      return h2hB.goalDifference - h2hA.goalDifference;
    }

    // Rule 3: Goal difference (overall)
    if (standingsB.goalDifference !== standingsA.goalDifference) {
      return standingsB.goalDifference - standingsA.goalDifference;
    }

    // Rule 4: Goals scored (overall)
    if (standingsB.goalsFor !== standingsA.goalsFor) {
      return standingsB.goalsFor - standingsA.goalsFor;
    }

    // If still tied, maintain original order (stable sort)
    return 0;
  };

  // Computed standings - Only based on REGULAR matches for determining final placements
  const standings = computed(() => {
    const teamStandings = teams.value.map(team => {
      const teamMatches = matches.value.filter(
        m => (m.homeTeamId === team.teamId || m.awayTeamId === team.teamId) && 
             m.matchType === 'group' &&
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

    // Sort with comprehensive tiebreaker rules
    return teamStandings.sort((a, b) => compareTeamsWithTiebreakers(a, b, matches.value));
  });

  // Calculate standings inline (used by updateFinalMatchTeams to avoid circular dependency)
  const calculateStandings = (currentMatches: MatchData[]) => {
    const teamStandings = teams.value.map(team => {
      const teamMatches = currentMatches.filter(
        m => (m.homeTeamId === team.teamId || m.awayTeamId === team.teamId) && 
             m.matchType === 'group' &&
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

    return teamStandings.sort((a, b) => compareTeamsWithTiebreakers(a, b, currentMatches));
  };

  // Update final match teams based on current standings
  const updateFinalMatchTeams = (currentMatches: MatchData[]) => {
    const sorted = calculateStandings(currentMatches);
    if (sorted.length < 4) return currentMatches;

    // Create new matches array with updated final match teams
    return currentMatches.map(match => {
      // Update Small Final: 3rd vs 4th
      if (match.matchType === 'small_final' && sorted[2]?.teamId && sorted[3]?.teamId) {
        return {
          ...match,
          homeTeamId: sorted[2].teamId,
          awayTeamId: sorted[3].teamId,
        };
      }

      // Update Big Final: 1st vs 2nd
      if (match.matchType === 'big_final' && sorted[0]?.teamId && sorted[1]?.teamId) {
        return {
          ...match,
          homeTeamId: sorted[0].teamId,
          awayTeamId: sorted[1].teamId,
        };
      }

      return match;
    });
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

      // Fetch full edition data from backend
      const fullEditionResponse = await editionService.getFull(edition.editionId!);
      const fullEditionData = fullEditionResponse.data;

      // Map teams from the response
      teams.value = fullEditionData.teams.map((team: any) => ({
        teamId: team.teamId,
        editionId: fullEditionData.editionId,
        color: (team.color || team.teamColor) as 'green' | 'orange' | 'gray' | 'blue',
        players: Array.isArray(team.players) ? team.players : [],
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      }));

      // Map matches from the response
      matches.value = fullEditionData.matches.map((match: any) => ({
        matchId: match.matchId,
        editionId: fullEditionData.editionId,
        homeTeamId: match.team1Id,
        awayTeamId: match.team2Id,
        homeTeam: match.team1 ? {
          teamId: match.team1.teamId,
          editionId: fullEditionData.editionId,
          color: (match.team1.color || match.team1.teamColor) as 'green' | 'orange' | 'gray' | 'blue',
        } : undefined,
        awayTeam: match.team2 ? {
          teamId: match.team2.teamId,
          editionId: fullEditionData.editionId,
          color: (match.team2.color || match.team2.teamColor) as 'green' | 'orange' | 'gray' | 'blue',
        } : undefined,
        matchNumber: match.stage,
        matchType: match.matchType as 'group' | 'small_final' | 'big_final',
        homeTeamScore: match.team1Score,
        awayTeamScore: match.team2Score,
        isPlayed: match.goals && match.goals.length > 0,
        goals: match.goals || [],
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      }));

      // Flatten all goals from matches
      goals.value = fullEditionData.matches.flatMap((match: any) =>
        (match.goals || []).map((goal: any) => ({
          goalId: goal.goalId,
          matchId: match.matchId,
          teamId: goal.teamId,
          playerId: goal.playerId,
          goalType: goal.goalType as 'normal' | 'penalty' | 'own_goal',
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
        }))
      );

      // Extract all players from teams
      players.value = fullEditionData.teams.flatMap((team: any) => team.players || []);

      // Update match scores based on goals (should already be in response, but recalculate to be sure)
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
        if (matchTemplate.type === 'group') {
          const homeTeam = teams.value.find(t => t.color === matchTemplate.homeColor);
          const awayTeam = teams.value.find(t => t.color === matchTemplate.awayColor);
          homeTeamId = homeTeam?.teamId || null;
          awayTeamId = awayTeam?.teamId || null;
        } else if (matchTemplate.type === 'small_final') {
          // Small final: 3rd vs 4th
          const sorted = standings.value;
          homeTeamId = sorted[2]?.teamId || null;
          awayTeamId = sorted[3]?.teamId || null;
        } else if (matchTemplate.type === 'big_final') {
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

  // Add watchers to auto-save state on changes
  const setupAutoSave = () => {
    // Only set up watchers once
    if (autoSaveSetup) return;
    autoSaveSetup = true;

    // Watch teams for changes
    watch(
      teams,
      () => {
        if (isCreatingNewEdition.value) {
          saveState();
        }
      },
      { deep: true }
    );

    // Watch matches for changes
    watch(
      matches,
      () => {
        if (isCreatingNewEdition.value) {
          saveState();
        }
      },
      { deep: true }
    );

    // Watch goals for changes
    watch(
      goals,
      () => {
        if (isCreatingNewEdition.value) {
          saveState();
        }
      },
      { deep: true }
    );

    // Watch current edition for changes
    watch(
      currentEdition,
      () => {
        if (isCreatingNewEdition.value) {
          saveState();
        }
      },
      { deep: true }
    );
  };

  // Add goal to match
  const addGoal = async (matchId: number, playerId: number, teamId: number, goalType: 'normal' | 'penalty' | 'own_goal' = 'normal') => {
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

      // Update match scores (this will automatically mark match as played when goals exist)
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
    // Create a new array to ensure Vue reactivity triggers properly
    matches.value = matches.value.map(match => {
      const matchGoals = goals.value.filter(g => g.matchId === match.matchId);
      
      // If we have goals, ALWAYS recalculate scores and mark as played
      if (matchGoals.length > 0) {
        // Count regular goals for each team
        const homeGoals = matchGoals.filter(g => g.teamId === match.homeTeamId && g.goalType !== 'own_goal').length;
        const awayGoals = matchGoals.filter(g => g.teamId === match.awayTeamId && g.goalType !== 'own_goal').length;
        
        // Count own goals - credited to the opposing team
        const homeOwnGoals = matchGoals.filter(g => g.teamId === match.awayTeamId && g.goalType === 'own_goal').length;
        const awayOwnGoals = matchGoals.filter(g => g.teamId === match.homeTeamId && g.goalType === 'own_goal').length;

        return {
          ...match,
          goals: matchGoals,
          homeTeamScore: homeGoals + homeOwnGoals,
          awayTeamScore: awayGoals + awayOwnGoals,
          isPlayed: true,
        };
      } else {
        // No goals - check if we have a score from backend
        const hasScore = match.homeTeamScore !== null && match.homeTeamScore !== undefined && 
                         match.awayTeamScore !== null && match.awayTeamScore !== undefined;
        
        if (hasScore) {
          // Keep the backend scores
          return {
            ...match,
            goals: matchGoals,
            isPlayed: true,
          };
        } else {
          // No goals and no score - match hasn't been played
          return {
            ...match,
            goals: matchGoals,
            homeTeamScore: null,
            awayTeamScore: null,
            isPlayed: false,
          };
        }
      }
    });

    // Update final match teams based on current standings
    matches.value = updateFinalMatchTeams(matches.value);
  };

  // Mark a match as played (enables score tracking for 0-0 draws)
  const markMatchAsPlayed = (matchId: number, isPlayed: boolean = true) => {
    // Update matches array with new isPlayed state to ensure reactivity
    matches.value = matches.value.map(m => 
      m.matchId === matchId 
        ? { ...m, isPlayed, homeTeamScore: isPlayed ? 0 : null, awayTeamScore: isPlayed ? 0 : null }
        : m
    );
    saveState();
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
    autoSaveSetup = false;
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
    setupAutoSave,
    $reset: resetStore,
  };
});
