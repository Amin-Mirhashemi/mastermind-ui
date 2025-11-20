import React from "react";
import { Button, Title } from "@telegram-apps/telegram-ui";
import { formatTime } from "@/utils/gameLogic";

interface SuccessOverlayProps {
  guesses: number;
  time: number;
  onShare: () => void;
  onPlayAgain: () => void;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  guesses,
  time,
  onShare,
  onPlayAgain,
}) => {
  const getPerformanceMessage = () => {
    if (guesses <= 5 && time <= 120) return "🚀 Mastermind Champion!";
    if (guesses <= 8 && time <= 300) return "🎯 Code Breaker!";
    if (guesses <= 10) return "🧠 Puzzle Solver!";
    return "🎨 Color Expert!";
  };

  const getStatsEmoji = () => {
    if (guesses <= 5) return "⭐⭐⭐⭐⭐";
    if (guesses <= 8) return "⭐⭐⭐⭐";
    if (guesses <= 10) return "⭐⭐⭐";
    return "⭐⭐";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <Title level="1" className="mb-2 text-green-600">
            Congratulations!
          </Title>
          <div className="text-lg font-semibold mb-2">
            {getPerformanceMessage()}
          </div>
          <div className="text-2xl mb-4">{getStatsEmoji()}</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-600">Guesses</div>
              <div className="text-2xl font-bold">{guesses}</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">Time</div>
              <div className="text-2xl font-bold">{formatTime(time)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center text-sm opacity-75">
            Challenge your friends to beat your score!
          </div>

          <Button
            mode="filled"
            size="l"
            onClick={onShare}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl"
          >
            🎉 Share Your Victory! 🎉
          </Button>

          <Button
            mode="outline"
            size="l"
            onClick={onPlayAgain}
            className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            🔄 Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};
