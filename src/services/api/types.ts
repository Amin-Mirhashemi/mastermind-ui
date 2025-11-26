// Profile API Types
export interface ProfileRequest {
  telegramId: number;
  date: string; // yyyy-mm-dd format
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  telegramid: string;
  username?: string;
  firstname?: string;
  lastname?: string | null;
  avatarurl?: string | null;
  language: string;
  isNewUser: boolean;
}

export interface GameRecord {
  id: string;
  userid: string;
  attempts: number;
  iscompleted: boolean;
  iswon: boolean;
  score?: number | null;
  timetaken: number;
  code: string;
  completedat: string;
}

export interface StreaksData {
  currentStreak: number;
  bestStreak: number;
  lastGameDate: string;
}

export interface ProfileResponse {
  user: UserProfile;
  games: GameRecord[];
  streaks: StreaksData;
  date: string;
}

export interface LeaderboardEntry {
  rank: number;
  attempts: number;
  timeTaken: number;
  user: {
    id: string;
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: {
    rank: number;
    attempts: number;
    timeTaken: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
