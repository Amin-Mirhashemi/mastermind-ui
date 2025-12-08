import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Title, Text } from "@telegram-apps/telegram-ui";
import { GameService } from "@/services/api";
import { Page } from "@/components/Page.tsx";
import { GameBoard } from "@/components/GameBoard.tsx";
import { parseDailyChallenge } from "@/utils/dailyChallenge";
import { GameState, Guess } from "@/types/game";
import {
  calculateHints,
  isCorrectGuess,
  generateShareText,
} from "@/utils/gameLogic";
import { generateGameColors } from "@/utils/gameLogic";
import { openTelegramLink } from "@tma.js/sdk-react";
import { getTodayString } from "@/utils/dailyChallenge";

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { code, mode } = useParams<{ code: string; mode: string }>();
  const isDaily = mode === "daily";
  const isPractice = code === "practice";
  const gameMode = mode as "easy" | "hard";

  const [gameState, setGameState] = useState<GameState>({
    secretCode: [],
    availableColors: [],
    guesses: [],
    currentGuess: [null, null, null, null, null],
    gameStatus: "welcome",
    gameMode: "easy",
    startTime: null,
    endTime: null,
    maxGuesses: 20,
  });

  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize game based on URL params
  useEffect(() => {
    if (!code || !mode) return;

    if (isDaily) {
      // Daily challenge mode
      const challenge = parseDailyChallenge(code);
      if (challenge.isValid) {
        setGameState({
          secretCode: challenge.colors,
          availableColors: challenge.availableColors, // All 8 colors for selection
          guesses: [],
          currentGuess: [null, null, null, null, null],
          gameStatus: "playing",
          gameMode: "hard", // Daily challenges are hard mode
          startTime: Date.now(),
          endTime: null,
          maxGuesses: 20,
        });
      }
    } else if (isPractice && (mode === "easy" || mode === "hard")) {
      // Practice mode - generate random code
      const { secretCode, availableColors } = generateGameColors();
      setGameState({
        secretCode,
        availableColors,
        guesses: [],
        currentGuess: [null, null, null, null, null],
        gameStatus: "playing",
        gameMode,
        startTime: Date.now(),
        endTime: null,
        maxGuesses: 20,
      });
    } else {
      // Invalid URL, redirect to home
      navigate("/");
    }
  }, [code, mode, isDaily, isPractice, gameMode]);

  // Timer effect
  useEffect(() => {
    let interval: number | null = null;

    if (gameState.gameStatus === "playing" && gameState.startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameState.startTime!) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.gameStatus, gameState.startTime]);

  const makeGuess = useCallback(() => {
    if (!gameState.currentGuess.every((color) => color !== null)) return;

    const hints = calculateHints(
      gameState.currentGuess as any,
      gameState.secretCode,
      gameState.gameMode
    );
    const newGuess: Guess = {
      colors: [...gameState.currentGuess],
      hints,
      timestamp: Date.now(),
    };

    const newGuesses = [...gameState.guesses, newGuess];
    const isCorrect = isCorrectGuess(
      gameState.currentGuess as any,
      gameState.secretCode
    );

    if (isCorrect || newGuesses.length >= gameState.maxGuesses) {
      setGameState((prev) => ({
        ...prev,
        guesses: newGuesses,
        gameStatus: isCorrect ? "won" : "lost",
        endTime: Date.now(),
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        guesses: newGuesses,
        currentGuess: [null, null, null, null, null],
      }));
    }
  }, [gameState]);

  // Record game completion for daily challenges
  useEffect(() => {
    if (
      isDaily &&
      (gameState.gameStatus === "won" || gameState.gameStatus === "lost")
    ) {
      const telegramId = localStorage.getItem("telegramId");
      if (telegramId) {
        const gameData = {
          telegramId,
          attempts: gameState.guesses.length,
          isWon: gameState.gameStatus === "won",
          timeTaken: Math.floor(
            (gameState.endTime! - gameState.startTime!) / 1000
          ),
          completedAt: getTodayString(),
        };
        // Fire-and-forget: call API in background without affecting UI
        GameService.recordGameCompletion(gameData);
      }

      // Clear the daily challenge date from localStorage since game is completed
      localStorage.removeItem("dailyChallengeDate");
    }
  }, [
    gameState.gameStatus,
    gameState.guesses.length,
    gameState.endTime,
    gameState.startTime,
    isDaily,
  ]);

  const updateCurrentGuess = useCallback((index: number, color: any) => {
    setGameState((prev) => ({
      ...prev,
      currentGuess: prev.currentGuess.map((c, i) => (i === index ? color : c)),
    }));
  }, []);

  const handleShare = useCallback(() => {
    if (gameState.gameStatus !== "won") return;

    let shareText;
    if (isDaily) {
      // Different share text for daily challenges - inviting to the challenge
      shareText = `🎯 MASTERMIND DAILY CHALLENGE 🎯

I just cracked today's color code challenge! 🏆

Can you beat my time and extend your streak? 🔥

⏱️ My time: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60)
        .toString()
        .padStart(2, "0")}
🎲 My attempts: ${gameState.guesses.length}/20

Think you can solve today's mystery code? 🤔

🎮 Take the challenge: @play_mastermind_bot

#MastermindChallenge #DailyPuzzle #ColorCode`;
    } else {
      // Regular share text for practice games
      shareText = generateShareText(
        gameState.guesses.length,
        elapsedTime,
        gameState.secretCode
      );
    }

    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(
      shareText
    )}`;
    openTelegramLink(shareUrl);
  }, [gameState, elapsedTime, isDaily]);

  // Show loading while initializing game
  if (gameState.gameStatus === "welcome") {
    return (
      <Page back={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Title level="3" className="text-blue-600">
              Loading Game...
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 mt-2">
              Preparing your challenge
            </Text>
          </div>
        </div>
      </Page>
    );
  }

  if (!code) {
    return (
      <Page back={true}>
        <div className="text-center p-4">
          <Title level="2">Game Not Found</Title>
          <Text>Invalid game code.</Text>
        </div>
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div className="relative h-screen overflow-hidden">
        {/* Game Board */}
        <GameBoard
          gameState={gameState}
          elapsedTime={elapsedTime}
          onGuessUpdate={updateCurrentGuess}
          onMakeGuess={makeGuess}
          isPractice={isPractice}
        />

        {/* Success Overlay */}
        {gameState.gameStatus === "won" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <Title level="1" className="mb-2 text-green-600">
                  {isDaily ? "Challenge Complete!" : "Well Done!"}
                </Title>
                <Text className="text-lg font-semibold mb-2">
                  {isDaily
                    ? "You solved today's puzzle!"
                    : "You cracked the code!"}
                </Text>
                <div className="text-2xl mb-4">🏆</div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-green-600">Attempts</div>
                    <div className="text-2xl font-bold">
                      {gameState.guesses.length}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">Time</div>
                    <div className="text-2xl font-bold">
                      {Math.floor(elapsedTime / 60)}:
                      {(elapsedTime % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {gameMode !== "easy" && (
                  <Button
                    mode="filled"
                    size="l"
                    onClick={handleShare}
                    className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl"
                  >
                    🎉 Share Victory! 🎉
                  </Button>
                )}

                <Button
                  mode="filled"
                  size="l"
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
                >
                  Back to Home
                </Button>

                {!isDaily && (
                  <Button
                    mode="filled"
                    size="l"
                    onClick={() => window.location.reload()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
                  >
                    Play Again
                  </Button>
                )}

                {gameMode === "easy" && (
                  <Button
                    mode="outline"
                    onClick={() => navigate(`/game/practice/hard`)}
                    className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    Try Hard Mode
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState.gameStatus === "lost" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full text-center">
              <Title level="2" className="mb-4 text-red-600">
                {isDaily ? "Challenge Failed! 🎯" : "Game Over! 🎯"}
              </Title>
              <p className="mb-4">
                You couldn't crack the code in {gameState.maxGuesses} attempts.
              </p>
              {isDaily ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Try again tomorrow for a new challenge!
                  </p>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800 flex flex-col gap-2">
                    <Text className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                      💔 Protect Your Streak!
                    </Text>
                    <Text className="text-sm text-orange-700 dark:text-orange-300">
                      Invite a friend to join Mastermind and your streak will
                      continue. Get your invite link from the bot!
                    </Text>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-2">
                <Button
                  mode="filled"
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  Back to Home
                </Button>
                {isPractice && (
                  <Button
                    mode="outline"
                    onClick={() => navigate(`/game/practice/${gameMode}`)}
                    className="flex-1 border-2 border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};
