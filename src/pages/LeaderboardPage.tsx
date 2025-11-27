import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Title, Text } from "@telegram-apps/telegram-ui";
import { Page } from "@/components/Page.tsx";
import { LeaderboardService, LeaderboardEntry } from "@/services/api";
import { getTodayString } from "@/utils/dailyChallenge";
import { formatTime } from "@/utils/gameLogic";

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{
    rank: number;
    attempts: number;
    timeTaken: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID from localStorage
    const telegramId = localStorage.getItem("telegramId");
    if (telegramId) {
      setCurrentUserId(telegramId);
    }

    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const today = getTodayString();
      const response = await LeaderboardService.getLeaderboard(today);
      setLeaderboard(response.leaderboard);
      setUserRank(response.userRank || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboardRows = () => {
    if (leaderboard.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <Title level="2" className="mb-2">
            No games played today yet
          </Title>
          <Text className="text-gray-600 dark:text-gray-400">
            Be the first to complete today's challenge!
          </Text>
        </div>
      );
    }

    const rows: JSX.Element[] = [];

    leaderboard.forEach((entry, index) => {
      const isCurrentUser = entry.user.id === currentUserId;
      const isEven = index % 2 === 0;

      rows.push(
        <div
          key={`entry-${entry.user.id}`}
          className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${
            isCurrentUser
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
              : isEven
              ? "bg-gray-50 dark:bg-gray-800"
              : "bg-white dark:bg-gray-900"
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Rank */}
            <div className="w-8 text-center">
              <Text
                className={`font-bold ${
                  isCurrentUser ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {entry.rank}
              </Text>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
              {entry.user.avatarUrl ? (
                <img
                  src={entry.user.avatarUrl}
                  alt={`${entry.user.firstName} ${
                    entry.user.lastName || ""
                  }`.trim()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Text className="text-lg">👤</Text>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <Text
                className={`font-medium truncate ${
                  isCurrentUser ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {`${entry.user.firstName} ${entry.user.lastName || ""}`.trim()}
              </Text>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-right">
            <div className="text-center">
              <Text
                className={`text-sm font-medium ${
                  isCurrentUser
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {entry.attempts}
              </Text>
            </div>
            <div className="text-center">
              <Text
                className={`text-sm font-medium ${
                  isCurrentUser
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {formatTime(entry.timeTaken)}
              </Text>
            </div>
          </div>
        </div>
      );
    });

    // If current user is not in top 50, show separator and their entry
    if (userRank && userRank.rank > 50) {
      rows.push(
        <div key="separator" className="flex justify-center py-4">
          <Text className="text-gray-500 dark:text-gray-400">...</Text>
        </div>
      );

      rows.push(
        <div
          key={`user-entry-${currentUserId}`}
          className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Rank */}
            <div className="w-8 text-center">
              <Text className="font-bold text-blue-600 dark:text-blue-400">
                {userRank.rank}
              </Text>
            </div>

            {/* Avatar placeholder for current user */}
            <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
              <Text className="text-lg">👤</Text>
            </div>

            {/* Name - You */}
            <div className="flex-1 min-w-0">
              <Text className="font-medium text-blue-600 dark:text-blue-400">
                You
              </Text>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-right">
            <div className="text-center">
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {userRank.attempts}
              </Text>
            </div>
            <div className="text-center">
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {formatTime(userRank.timeTaken)}
              </Text>
            </div>
          </div>
        </div>
      );
    }

    return rows;
  };

  if (loading) {
    return (
      <Page back={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Title level="3" className="text-blue-600">
              Loading Leaderboard...
            </Title>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page back={true}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-6xl mb-4">😵</div>
          <Title level="2" className="mb-2 text-center">
            Failed to load leaderboard
          </Title>
          <Text className="text-center mb-6 text-gray-600 dark:text-gray-400">
            {error}
          </Text>
          <Button mode="filled" onClick={loadLeaderboard}>
            Try Again
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page back={false}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <Button
              mode="outline"
              size="s"
              onClick={() => navigate("/")}
              className="border-gray-400 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              ← Back
            </Button>
            <Title level="1" className="flex-1 text-center mr-12">
              🏆 Leaderboard
            </Title>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="pb-4">
          {/* Today's Date */}
          <div className="text-center py-4 bg-gray-50 dark:bg-gray-800">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Today's Challenge - {new Date().toLocaleDateString()}
            </Text>
          </div>

          {/* Table Header */}
          <div className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8"></div>
              <div className="w-10"></div>
              <Text className="font-semibold text-gray-700 dark:text-gray-300">
                Player
              </Text>
            </div>
            <div className="flex items-center gap-4 text-right">
              <Text className="font-semibold text-gray-700 dark:text-gray-300">
                Attempts
              </Text>
              <Text className="font-semibold text-gray-700 dark:text-gray-300">
                Time
              </Text>
            </div>
          </div>

          {/* Leaderboard Rows */}
          {renderLeaderboardRows()}
        </div>
      </div>
    </Page>
  );
};
