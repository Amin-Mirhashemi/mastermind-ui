import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Title, Text } from "@telegram-apps/telegram-ui";
import { ProfileService } from "@/services/api";
import {
  getTodayString,
  isStreakBroken,
  getDailyChallengeUrl,
} from "@/utils/dailyChallenge";
import { Page } from "@/components/Page.tsx";
import { initData, useSignal } from "@tma.js/sdk-react";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const userData = useSignal(initData.user);

  useEffect(() => {
    if (userData) {
      loadProfile(userData);
    }
  }, [userData]);

  const loadProfile = async (userData: any) => {
    try {
      // Store telegram ID for game completion tracking
      localStorage.setItem("telegramId", userData.id.toString());

      const today = getTodayString();
      const response = await ProfileService.createProfile({
        telegramId: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
        avatarUrl: userData.photo_url,
        date: today,
      });
      setProfile(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getStreakDisplay = () => {
    if (!profile?.streaks) return 0;

    const { currentStreak, lastGameDate } = profile.streaks;
    if (isStreakBroken(lastGameDate)) return 0;

    return currentStreak;
  };

  const getTodayGameStatus = () => {
    if (!profile?.games) return "not_played";

    const today = getTodayString();
    const todayGame = profile.games.find((game: any) =>
      game.completedat?.startsWith(today)
    );

    if (!todayGame) return "not_played";
    return todayGame.iswon ? "won" : "lost";
  };

  const handleChallengeClick = () => {
    const status = getTodayGameStatus();
    const streak = getStreakDisplay();

    if (status === "lost") {
      setShowInviteModal(true);
      return;
    }

    if (status === "won") {
      return; // Already won, button should be hidden
    }

    // Show challenge modal for first 3 days of streak
    if (streak < 3) {
      setShowChallengeModal(true);
    } else {
      startDailyChallenge();
    }
  };

  const startDailyChallenge = () => {
    const url = getDailyChallengeUrl();
    navigate(url);
  };

  if (loading) {
    return (
      <Page back={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Text>Loading...</Text>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page back={false}>
        <div className="text-center p-4">
          <Title level="2" className="text-red-600 mb-4">
            Error
          </Title>
          <Text>{error}</Text>
          <Button onClick={loadProfile} className="mt-4">
            Try Again
          </Button>
        </div>
      </Page>
    );
  }

  const streak = getStreakDisplay();
  const todayStatus = getTodayGameStatus();

  return (
    <Page back={false}>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">😎</div>
          <Title level="1" className="mb-2">
            Mastermind
          </Title>
          <Text className="opacity-75">
            Crack the secret color code! You have 12 attempts to guess the
            5-color combination.
          </Text>
        </div>

        {/* Streak and Challenge Section */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-8 shadow-lg border border-blue-100/50 dark:border-blue-800/50">
          <div className="text-center mb-6">
            <Text className="font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              🔥 Your Streaks
            </Text>
            <div className="flex justify-center items-center gap-6 my-3">
              {/* Current Streak */}
              <div className="text-center">
                <Text className="font-medium mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  Current
                </Text>
                <div
                  className={`ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-200 ${
                    streak > 0 && todayStatus !== "lost"
                      ? "bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white shadow-orange-300/50"
                      : "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-300 shadow-gray-400/50"
                  }`}
                >
                  {streak}
                </div>
              </div>

              {/* Best Streak */}
              <div className="text-center">
                <Text className="font-medium mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  Best
                </Text>
                <div className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full font-bold bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-300/50">
                  {profile?.streaks?.bestStreak || 0}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="text-center">
                <Text className="font-medium mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  Leaderboard
                </Text>
                <Button
                  mode="outline"
                  size="s"
                  onClick={() => navigate("/leaderboard")}
                  className="ml-2 border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/20 transform hover:scale-105 transition-all duration-200"
                >
                  🏆
                </Button>
              </div>
            </div>
          </div>

          {/* Challenge Button */}
          {todayStatus === "not_played" && (
            <div className="text-center">
              <Button
                mode="filled"
                size="l"
                onClick={handleChallengeClick}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold px-8"
              >
                Start Daily Challenge 🚀
              </Button>
            </div>
          )}

          {todayStatus === "won" && (
            <div className="text-center">
              <p>
                <Text className="font-semibold mb-2 text-green-700 dark:text-green-300">
                  ✅ Challenge Completed!
                </Text>
              </p>
              <Text className="text-sm opacity-75">
                Come back tomorrow for a new challenge
              </Text>
            </div>
          )}

          {todayStatus === "lost" && (
            <div className="text-center">
              <Text className="font-semibold text-red-700 dark:text-red-300">
                💔 Challenge Failed Today
              </Text>
              <Button
                mode="outline"
                onClick={handleChallengeClick}
                className="border-red-500 text-red-600 hover:bg-red-50 mt-3"
              >
                Invite Friend to Continue Streak
              </Button>
            </div>
          )}
        </div>

        {/* How to Play */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-6">
          <div className="mb-2">
            <Text className="font-semibold text-green-700 dark:text-green-300">
              🎯 How to Play:
            </Text>
          </div>
          <div className="space-y-1 text-left pl-4">
            <li>
              <Text>Choose 5 colors from the available options</Text>
            </li>
            <li>
              <Text>Black peg = correct color, correct position</Text>
            </li>
            <li>
              <Text>White peg = correct color, wrong position</Text>
            </li>
            <li>
              <Text>Beat the clock and minimize your guesses!</Text>
            </li>
          </div>
        </div>

        {/* Practice Games */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6">
          <div>
            <Text className="font-semibold mb-3 text-purple-700 dark:text-purple-300 text-center">
              🎮 Practice Games
            </Text>
          </div>
          <div className="mb-1">
            <Text className="text-sm text-center opacity-75">
              Practice with unlimited attempts to master the game!
            </Text>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Button
              mode="filled"
              size="m"
              onClick={() => navigate("/game/practice/easy")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              🟢 Easy Mode (Hints)
            </Button>
            <Button
              mode="filled"
              size="m"
              onClick={() => navigate("/game/practice/hard")}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              🔴 Hard Mode (No Hints)
            </Button>
          </div>
        </div>
      </div>

      {/* Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <Title level="2" className="mb-4 text-center">
              🎯 Daily Challenge
            </Title>
            <div className="mb-6">
              <div className="space-y-1 text-left pl-4">
                <li>
                  <Text>
                    This is your daily challenge to extend your streak!
                  </Text>
                </li>
                <li>
                  <Text>You have only ONE attempt per day</Text>
                </li>
                <li>
                  <Text>The game is in HARD MODE (hints are randomized)</Text>
                </li>
                <li>
                  <Text>You can't go back once you enter the game</Text>
                </li>
                <li>
                  <Text>Practice with regular games first if needed</Text>
                </li>
                <li>
                  <Text>Win to keep your streak alive! 🔥</Text>
                </li>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                mode="outline"
                onClick={() => setShowChallengeModal(false)}
                className="flex-1"
              >
                Practice First
              </Button>
              <Button
                mode="filled"
                onClick={() => {
                  setShowChallengeModal(false);
                  startDailyChallenge();
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600"
              >
                Start Challenge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <Title level="2" className="mb-4 text-center">
              💔 Streak Protection
            </Title>
            <div className="mb-6 space-y-3">
              <p>
                You can't play today's challenge again, but you can protect your
                streak!
              </p>
              <p>
                Invite one friend to join Mastermind today, and your streak will
                continue.
              </p>
              <p>Get your invite link from the bot: @play_mastermind_bot</p>
            </div>
            <div className="flex gap-3">
              <Button
                mode="outline"
                onClick={() => setShowInviteModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};
