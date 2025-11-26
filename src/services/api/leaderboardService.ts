import { apiClient } from "./client";
import { LeaderboardResponse } from "./types";

export class LeaderboardService {
  static async getLeaderboard(date: string): Promise<LeaderboardResponse> {
    return await apiClient.get<LeaderboardResponse>(`/leaderboard/${date}`);
  }
}
