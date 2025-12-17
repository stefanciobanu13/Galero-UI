export interface Player {
  playerId?: number;
  firstName: string;
  lastName: string;
  grade: number;
}

export interface User {
  userId?: number;
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
  googleId?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  playerId?: number;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
