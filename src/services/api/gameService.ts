import { supabase } from "./supabase";
import { GameCompletionRequest } from "./types";
import { getTodayString } from "@/utils/dailyChallenge";

export class GameService {
  static async recordGameCompletion(
    gameData: GameCompletionRequest,
  ): Promise<void> {
    try {
      // 1. Get user ID from telegram ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("telegramid", gameData.telegramId)
        .single();

      if (userError || !userData) {
        console.error("User not found:", userError);
        return;
      }

      const userId = userData.id;

      // 2. Insert game record
      const { error: gameError } = await supabase.from("games").insert({
        userid: userId,
        attempts: gameData.attempts,
        iscompleted: true,
        iswon: gameData.isWon,
        timetaken: gameData.timeTaken,
        completedat: new Date().toISOString(),
      });

      if (gameError) {
        console.error("Error inserting game:", gameError);
        return;
      }

      // 3. Update user's streak
      const { data: streakData, error: streakFetchError } = await supabase
        .from("streaks")
        .select("*")
        .eq("userid", userId)
        .single();

      if (streakFetchError && streakFetchError.code === "PGRST116") {
        // No streak record exists, create one
        const newStreak = gameData.isWon
          ? {
              currentstreak: 1,
              beststreak: 1,
              streakstartdate: getTodayString(),
            }
          : { currentstreak: 0, beststreak: 0, streakstartdate: null };

        await supabase.from("streaks").insert({
          userid: userId,
          ...newStreak,
          lastgamedate: getTodayString(),
        });
        return;
      }

      if (streakFetchError) {
        console.error("Error fetching streak:", streakFetchError);
        return;
      }

      // Calculate new streak values
      let newCurrentStreak: number;
      let newBestStreak = streakData.beststreak || 0;
      let newStreakStartDate = streakData.streakstartdate;

      if (gameData.isWon) {
        // Check if the previous streak is still valid (not broken)
        const lastGameDate = streakData.lastgamedate;
        const today = getTodayString();

        // Calculate if streak continues
        let streakContinues = false;
        if (lastGameDate) {
          const lastDate = new Date(lastGameDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          // Streak continues if last game was yesterday or today
          streakContinues = diffDays <= 1;
        }

        if (streakContinues) {
          newCurrentStreak = (streakData.currentstreak || 0) + 1;
        } else {
          // Start fresh streak
          newCurrentStreak = 1;
          newStreakStartDate = today;
        }

        // Update best streak if needed
        if (newCurrentStreak > newBestStreak) {
          newBestStreak = newCurrentStreak;
        }
      } else {
        // Lost - reset streak to 0
        newCurrentStreak = 0;
        newStreakStartDate = null;
      }

      // Update streak record
      const { error: updateError } = await supabase
        .from("streaks")
        .update({
          currentstreak: newCurrentStreak,
          beststreak: newBestStreak,
          lastgamedate: getTodayString(),
          streakstartdate: newStreakStartDate,
          updatedat: new Date().toISOString(),
        })
        .eq("userid", userId);

      if (updateError) {
        console.error("Error updating streak:", updateError);
      }
    } catch (error) {
      // Fire-and-forget: log error but don't throw or affect UI
      console.error("Failed to record game completion:", error);
    }
  }
}
