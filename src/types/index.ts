export interface Player {
  playerId?: number
  firstName: string
  lastName: string
  grade: number
}

export interface User {
  userId?: number
  email: string
  name: string
  picture: string
  isAdmin: boolean
  googleId?: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  playerId?: number
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Edition {
  editionId?: number
  editionNumber: number
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface Team {
  teamId?: number
  editionId: number
  color: 'verde' | 'portocaliu' | 'gri' | 'albastru'
  createdAt?: string
  updatedAt?: string
}

export interface TeamPlayer {
  teamPlayerId?: number
  teamId: number
  playerId: number
  createdAt?: string
  updatedAt?: string
}

export interface Match {
  matchId?: number
  editionId: number
  homeTeamId: number
  awayTeamId: number
  matchNumber: number
  matchType: 'group' | 'small_final' | 'big_final'
  homeTeamScore?: number | null
  awayTeamScore?: number | null
  isPlayed?: boolean // Indicates if match has started/been scored
  createdAt?: string
  updatedAt?: string
}

export interface Goal {
  goalId?: number
  matchId: number
  teamId: number
  playerId: number
  goalType: 'normal' | 'penalty' | 'own_goal'
  createdAt?: string
  updatedAt?: string
}

export interface Attendance {
  attendanceId?: number
  editionId: number
  playerId: number
  status?: 'inscris' | 'retras' | 'rezerva'
  createdAt?: string
  updatedAt?: string
}
