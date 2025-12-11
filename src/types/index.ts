export interface Player {
  playerId?: number;
  firstName: string;
  lastName: string;
  grade: number;
}

export interface User {
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
