import { apiClient } from "./client";

export interface GameCompletionRequest {
  telegramId: string;
  attempts: number;
  isWon: boolean;
  timeTaken: number;
  completedAt: string;
}

export class GameService {
  static async recordGameCompletion(
    gameData: GameCompletionRequest
  ): Promise<void> {
    try {
      await apiClient.post("/game", gameData);
    } catch (error) {
      // Fire-and-forget: log error but don't throw or affect UI
      console.error("Failed to record game completion:", error);
    }
  }
}
