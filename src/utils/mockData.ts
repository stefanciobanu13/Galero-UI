// Mock data for testing edition creation and saving
// TODO: DELETE THIS FILE AFTER TESTING

import type { Edition, Team, Match, Goal, Player } from '../types';

export const mockEdition: Edition = {
  editionNumber: 1,
  date: '2025-12-20',
};

export const mockPlayers: Player[] = [
  // Green Team Players
  { firstName: 'John', lastName: 'Smith', grade: 1, playerId: 1 },
  { firstName: 'Michael', lastName: 'Johnson', grade: 2, playerId: 2 },
  { firstName: 'David', lastName: 'Williams', grade: 1, playerId: 3 },
  { firstName: 'James', lastName: 'Brown', grade: 2, playerId: 4 },
  { firstName: 'Robert', lastName: 'Jones', grade: 1, playerId: 5 },
  { firstName: 'William', lastName: 'Garcia', grade: 2, playerId: 6 },

  // Orange Team Players
  { firstName: 'Carlos', lastName: 'Martinez', grade: 1, playerId: 7 },
  { firstName: 'Luis', lastName: 'Rodriguez', grade: 2, playerId: 8 },
  { firstName: 'Diego', lastName: 'Lopez', grade: 1, playerId: 9 },
  { firstName: 'Juan', lastName: 'Gonzalez', grade: 2, playerId: 10 },
  { firstName: 'Miguel', lastName: 'Hernandez', grade: 1, playerId: 11 },
  { firstName: 'Antonio', lastName: 'Sanchez', grade: 2, playerId: 12 },

  // Gray Team Players
  { firstName: 'Thomas', lastName: 'Anderson', grade: 1, playerId: 13 },
  { firstName: 'Charles', lastName: 'Taylor', grade: 2, playerId: 14 },
  { firstName: 'Daniel', lastName: 'Thomas', grade: 1, playerId: 15 },
  { firstName: 'Christopher', lastName: 'Moore', grade: 2, playerId: 16 },
  { firstName: 'Matthew', lastName: 'Jackson', grade: 1, playerId: 17 },
  { firstName: 'Anthony', lastName: 'Martin', grade: 2, playerId: 18 },

  // Blue Team Players
  { firstName: 'Peter', lastName: 'Lee', grade: 1, playerId: 19 },
  { firstName: 'Paul', lastName: 'Harris', grade: 2, playerId: 20 },
  { firstName: 'Andrew', lastName: 'Clark', grade: 1, playerId: 21 },
  { firstName: 'Steven', lastName: 'Lewis', grade: 2, playerId: 22 },
  { firstName: 'Kenneth', lastName: 'Walker', grade: 1, playerId: 23 },
  { firstName: 'George', lastName: 'Hall', grade: 2, playerId: 24 },
];

export const mockTeams = (editionId: number): Team[] => [
  {
    editionId,
    color: 'green',
    teamId: 1,
  },
  {
    editionId,
    color: 'orange',
    teamId: 2,
  },
  {
    editionId,
    color: 'gray',
    teamId: 3,
  },
  {
    editionId,
    color: 'blue',
    teamId: 4,
  },
];

export const mockMatches = (editionId: number): Match[] => [
  // Regular Matches
  { matchId: 1, editionId, homeTeamId: 1, awayTeamId: 2, matchNumber: 1, matchType: 'REGULAR', homeTeamScore: 2, awayTeamScore: 1 },
  { matchId: 2, editionId, homeTeamId: 4, awayTeamId: 3, matchNumber: 2, matchType: 'REGULAR', homeTeamScore: 1, awayTeamScore: 1 },
  { matchId: 3, editionId, homeTeamId: 2, awayTeamId: 4, matchNumber: 3, matchType: 'REGULAR', homeTeamScore: 3, awayTeamScore: 2 },
  { matchId: 4, editionId, homeTeamId: 3, awayTeamId: 1, matchNumber: 4, matchType: 'REGULAR', homeTeamScore: 0, awayTeamScore: 2 },
  { matchId: 5, editionId, homeTeamId: 1, awayTeamId: 4, matchNumber: 5, matchType: 'REGULAR', homeTeamScore: 1, awayTeamScore: 0 },
  { matchId: 6, editionId, homeTeamId: 2, awayTeamId: 3, matchNumber: 6, matchType: 'REGULAR', homeTeamScore: 2, awayTeamScore: 2 },
  { matchId: 7, editionId, homeTeamId: 4, awayTeamId: 1, matchNumber: 7, matchType: 'REGULAR', homeTeamScore: 3, awayTeamScore: 1 },
  { matchId: 8, editionId, homeTeamId: 3, awayTeamId: 2, matchNumber: 8, matchType: 'REGULAR', homeTeamScore: 1, awayTeamScore: 0 },
  { matchId: 9, editionId, homeTeamId: 1, awayTeamId: 3, matchNumber: 9, matchType: 'REGULAR', homeTeamScore: 2, awayTeamScore: 1 },
  { matchId: 10, editionId, homeTeamId: 4, awayTeamId: 2, matchNumber: 10, matchType: 'REGULAR', homeTeamScore: 2, awayTeamScore: 3 },
  { matchId: 11, editionId, homeTeamId: 2, awayTeamId: 1, matchNumber: 11, matchType: 'REGULAR', homeTeamScore: 1, awayTeamScore: 1 },
  { matchId: 12, editionId, homeTeamId: 3, awayTeamId: 4, matchNumber: 12, matchType: 'REGULAR', homeTeamScore: 2, awayTeamScore: 0 },
  
  // Finals (will be updated based on standings)
  { matchId: 13, editionId, homeTeamId: 3, awayTeamId: 4, matchNumber: 13, matchType: 'SEMI_FINAL', homeTeamScore: null, awayTeamScore: null },
  { matchId: 14, editionId, homeTeamId: 1, awayTeamId: 2, matchNumber: 14, matchType: 'FINAL', homeTeamScore: null, awayTeamScore: null },
];

export const mockGoals = (): Goal[] => [
  // Match 1: Green 2-1 Orange
  { goalId: 1, matchId: 1, teamId: 1, playerId: 1, goalType: 'NORMAL' },
  { goalId: 2, matchId: 1, teamId: 1, playerId: 2, goalType: 'NORMAL' },
  { goalId: 3, matchId: 1, teamId: 2, playerId: 7, goalType: 'NORMAL' },

  // Match 2: Blue 1-1 Gray
  { goalId: 4, matchId: 2, teamId: 4, playerId: 19, goalType: 'NORMAL' },
  { goalId: 5, matchId: 2, teamId: 3, playerId: 13, goalType: 'NORMAL' },

  // Match 3: Orange 3-2 Blue
  { goalId: 6, matchId: 3, teamId: 2, playerId: 8, goalType: 'NORMAL' },
  { goalId: 7, matchId: 3, teamId: 2, playerId: 9, goalType: 'NORMAL' },
  { goalId: 8, matchId: 3, teamId: 2, playerId: 10, goalType: 'NORMAL' },
  { goalId: 9, matchId: 3, teamId: 4, playerId: 20, goalType: 'NORMAL' },
  { goalId: 10, matchId: 3, teamId: 4, playerId: 21, goalType: 'NORMAL' },

  // Match 4: Gray 0-2 Green
  { goalId: 11, matchId: 4, teamId: 1, playerId: 3, goalType: 'NORMAL' },
  { goalId: 12, matchId: 4, teamId: 1, playerId: 4, goalType: 'NORMAL' },

  // Match 5: Green 1-0 Blue
  { goalId: 13, matchId: 5, teamId: 1, playerId: 5, goalType: 'PENALTY' },

  // Match 6: Orange 2-2 Gray
  { goalId: 14, matchId: 6, teamId: 2, playerId: 11, goalType: 'NORMAL' },
  { goalId: 15, matchId: 6, teamId: 2, playerId: 12, goalType: 'NORMAL' },
  { goalId: 16, matchId: 6, teamId: 3, playerId: 14, goalType: 'NORMAL' },
  { goalId: 17, matchId: 6, teamId: 3, playerId: 15, goalType: 'NORMAL' },

  // Match 7: Blue 3-1 Green
  { goalId: 18, matchId: 7, teamId: 4, playerId: 22, goalType: 'NORMAL' },
  { goalId: 19, matchId: 7, teamId: 4, playerId: 23, goalType: 'NORMAL' },
  { goalId: 20, matchId: 7, teamId: 4, playerId: 24, goalType: 'NORMAL' },
  { goalId: 21, matchId: 7, teamId: 1, playerId: 6, goalType: 'NORMAL' },

  // Match 8: Gray 1-0 Orange
  { goalId: 22, matchId: 8, teamId: 3, playerId: 16, goalType: 'NORMAL' },

  // Match 9: Green 2-1 Gray
  { goalId: 23, matchId: 9, teamId: 1, playerId: 1, goalType: 'NORMAL' },
  { goalId: 24, matchId: 9, teamId: 1, playerId: 2, goalType: 'OWN_GOAL' }, // Own goal by Gray player 17
  { goalId: 25, matchId: 9, teamId: 3, playerId: 17, goalType: 'OWN_GOAL' },

  // Match 10: Blue 2-3 Orange
  { goalId: 26, matchId: 10, teamId: 4, playerId: 19, goalType: 'NORMAL' },
  { goalId: 27, matchId: 10, teamId: 4, playerId: 20, goalType: 'NORMAL' },
  { goalId: 28, matchId: 10, teamId: 2, playerId: 8, goalType: 'NORMAL' },
  { goalId: 29, matchId: 10, teamId: 2, playerId: 9, goalType: 'NORMAL' },
  { goalId: 30, matchId: 10, teamId: 2, playerId: 10, goalType: 'NORMAL' },

  // Match 11: Orange 1-1 Green
  { goalId: 31, matchId: 11, teamId: 2, playerId: 7, goalType: 'NORMAL' },
  { goalId: 32, matchId: 11, teamId: 1, playerId: 3, goalType: 'NORMAL' },

  // Match 12: Gray 2-0 Blue
  { goalId: 33, matchId: 12, teamId: 3, playerId: 13, goalType: 'NORMAL' },
  { goalId: 34, matchId: 12, teamId: 3, playerId: 14, goalType: 'NORMAL' },
];

// Final standings based on matches above:
// 1. Orange: 9 points (2W, 3D, 1L)
// 2. Green: 8 points (2W, 2D, 2L) 
// 3. Blue: 6 points (1W, 3D, 2L)
// 4. Gray: 5 points (1W, 2D, 3L)
