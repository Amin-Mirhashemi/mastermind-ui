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
  username?: string | null;
  firstname?: string | null;
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
  timetaken?: number | null;
  code?: string | null;
  completedat: string;
}

export interface StreaksData {
  currentStreak: number;
  bestStreak: number;
  lastGameDate: string | null;
}

export interface ProfileResponse {
  user: UserProfile;
  games: GameRecord[];
  streaks: StreaksData;
  date: string;
}

// Game Completion Types
export interface GameCompletionRequest {
  telegramId: string;
  attempts: number;
  isWon: boolean;
  timeTaken: number;
  completedAt: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  attempts: number;
  timetaken: number;
  user: {
    id: string;
    telegramid: string;
    firstname: string | null;
    lastname?: string | null;
    avatarurl?: string | null;
  };
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: {
    rank: number;
    attempts: number;
    timetaken: number;
  };
}
