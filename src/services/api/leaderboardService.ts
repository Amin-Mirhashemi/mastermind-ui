import { supabase } from "./supabase";
import { LeaderboardEntry, LeaderboardResponse } from "./types";

export class LeaderboardService {
  static async getLeaderboard(
    date: string,
    currentTelegramId?: string,
  ): Promise<LeaderboardResponse> {
    // Get today's date range (start and end of day)
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    // Fetch all won games for the given date, joined with user data
    // Ordered by attempts (ascending) and then by time taken (ascending)
    const { data: gamesData, error: gamesError } = await supabase
      .from("games")
      .select(
        `
        id,
        attempts,
        timetaken,
        completedat,
        userid,
        users!inner (
          id,
          telegramid,
          firstname,
          lastname,
          avatarurl
        )
      `,
      )
      .eq("iswon", true)
      .gte("completedat", startOfDay)
      .lte("completedat", endOfDay)
      .order("attempts", { ascending: true })
      .order("timetaken", { ascending: true })
      .limit(50);

    if (gamesError) {
      console.error("Error fetching leaderboard:", gamesError);
      throw new Error(gamesError.message);
    }

    // Transform data into leaderboard entries
    const leaderboard: LeaderboardEntry[] = (gamesData || []).map(
      (game: any, index: number) => ({
        rank: index + 1,
        attempts: game.attempts,
        timetaken: game.timetaken || 0,
        user: {
          id: game.users.id,
          telegramid: game.users.telegramid,
          firstname: game.users.firstname,
          lastname: game.users.lastname,
          avatarurl: game.users.avatarurl,
        },
      }),
    );

    // Find current user's rank if they have a game today
    let userRank: LeaderboardResponse["userRank"] = undefined;

    if (currentTelegramId) {
      // First get the user ID from telegram ID
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("telegramid", currentTelegramId)
        .single();

      if (userData) {
        // Check if user is in the leaderboard (compare by telegramid)
        const userInLeaderboard = leaderboard.find(
          (entry) => entry.user.telegramid === currentTelegramId,
        );

        if (userInLeaderboard) {
          userRank = {
            rank: userInLeaderboard.rank,
            attempts: userInLeaderboard.attempts,
            timetaken: userInLeaderboard.timetaken,
          };
        } else {
          // User might be outside top 50, fetch their game separately
          const { data: userGame } = await supabase
            .from("games")
            .select("attempts, timetaken")
            .eq("userid", userData.id)
            .eq("iswon", true)
            .gte("completedat", startOfDay)
            .lte("completedat", endOfDay)
            .single();

          if (userGame) {
            // Count how many users are better than this user
            const { count } = await supabase
              .from("games")
              .select("*", { count: "exact", head: true })
              .eq("iswon", true)
              .gte("completedat", startOfDay)
              .lte("completedat", endOfDay)
              .or(
                `attempts.lt.${userGame.attempts},and(attempts.eq.${userGame.attempts},timetaken.lt.${userGame.timetaken})`,
              );

            userRank = {
              rank: (count || 0) + 1,
              attempts: userGame.attempts,
              timetaken: userGame.timetaken || 0,
            };
          }
        }
      }
    }

    return {
      leaderboard,
      userRank,
    };
  }
}
