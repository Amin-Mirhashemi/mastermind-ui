import { supabase } from "./supabase";
import {
  ProfileRequest,
  ProfileResponse,
  GameRecord,
  StreaksData,
} from "./types";
import { getTodayString, isStreakBroken } from "@/utils/dailyChallenge";

export class ProfileService {
  /**
   * Create or update user profile and fetch their games and streaks
   */
  static async createProfile(
    request: ProfileRequest,
  ): Promise<ProfileResponse> {
    const telegramIdStr = request.telegramId.toString();

    // 1. Upsert user in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          telegramid: telegramIdStr,
          username: request.username || null,
          firstname: request.firstName || null,
          lastname: request.lastName || null,
          avatarurl: request.avatarUrl || null,
          updatedat: new Date().toISOString(),
        },
        {
          onConflict: "telegramid",
        },
      )
      .select()
      .single();

    if (userError) {
      console.error("Error upserting user:", userError);
      throw new Error(userError.message);
    }

    const userId = userData.id;
    const isNewUser =
      new Date(userData.createdat).getTime() > Date.now() - 5000; // Created in last 5 seconds

    // 2. Fetch user's games (most recent first)
    const { data: gamesData, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .eq("userid", userId)
      .order("completedat", { ascending: false })
      .limit(50);

    if (gamesError) {
      console.error("Error fetching games:", gamesError);
    }

    const games: GameRecord[] = gamesData || [];

    // 3. Fetch or create user's streak
    let { data: streakData, error: streakError } = await supabase
      .from("streaks")
      .select("*")
      .eq("userid", userId)
      .single();

    if (streakError && streakError.code === "PGRST116") {
      // No streak record exists, create one
      const { data: newStreak, error: createError } = await supabase
        .from("streaks")
        .insert({
          userid: userId,
          currentstreak: 0,
          beststreak: 0,
          lastgamedate: null,
          streakstartdate: null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating streak:", createError);
      }
      streakData = newStreak;
    } else if (streakError) {
      console.error("Error fetching streak:", streakError);
    }

    // Calculate effective streak (reset if broken)
    let effectiveCurrentStreak = streakData?.currentstreak || 0;
    if (streakData?.lastgamedate && isStreakBroken(streakData.lastgamedate)) {
      effectiveCurrentStreak = 0;
    }

    const streaks: StreaksData = {
      currentStreak: effectiveCurrentStreak,
      bestStreak: streakData?.beststreak || 0,
      lastGameDate: streakData?.lastgamedate || null,
    };

    return {
      user: {
        id: userData.id,
        telegramid: userData.telegramid,
        username: userData.username,
        firstname: userData.firstname,
        lastname: userData.lastname,
        avatarurl: userData.avatarurl,
        language: userData.language || "en",
        isNewUser,
      },
      games,
      streaks,
      date: getTodayString(),
    };
  }
}
