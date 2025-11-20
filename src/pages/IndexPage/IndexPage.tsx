import React, { useState, useEffect, useCallback } from "react";
import { Button, Title } from "@telegram-apps/telegram-ui";
import { openTelegramLink } from "@tma.js/sdk-react";

import { Page } from "@/components/Page.tsx";
import { GameBoard } from "@/components/GameBoard.tsx";
import { WelcomeOverlay } from "@/components/WelcomeOverlay.tsx";
import { SuccessOverlay } from "@/components/SuccessOverlay.tsx";
import { GameState, Guess, GameMode } from "@/types/game";
import {
  generateGameColors,
  calculateHints,
  isCorrectGuess,
  generateShareText,
} from "@/utils/gameLogic";

export const IndexPage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    secretCode: [],
    availableColors: [],
    guesses: [],
    currentGuess: [null, null, null, null, null],
    gameStatus: "welcome",
    gameMode: "easy" as GameMode,
    startTime: null,
    endTime: null,
    maxGuesses: 12,
  });

  const [elapsedTime, setElapsedTime] = useState(0);

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

  const startGame = useCallback((mode: GameMode = "easy") => {
    const { secretCode, availableColors } = generateGameColors();
    setGameState({
      secretCode,
      availableColors,
      guesses: [],
      currentGuess: [null, null, null, null, null],
      gameStatus: "playing",
      gameMode: mode,
      startTime: Date.now(),
      endTime: null,
      maxGuesses: 12,
    });
    setElapsedTime(0);
  }, []);

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

  const updateCurrentGuess = useCallback((index: number, color: any) => {
    setGameState((prev) => ({
      ...prev,
      currentGuess: prev.currentGuess.map((c, i) => (i === index ? color : c)),
    }));
  }, []);

  const handleShare = useCallback(() => {
    if (gameState.gameStatus !== "won") return;

    const shareText = generateShareText(
      gameState.guesses.length,
      elapsedTime,
      gameState.secretCode,
      gameState.gameMode
    );

    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(
      shareText
    )}`;
    openTelegramLink(shareUrl);
  }, [gameState, elapsedTime]);

  const resetGame = useCallback(() => {
    setGameState({
      secretCode: [],
      availableColors: [],
      guesses: [],
      currentGuess: [null, null, null, null, null],
      gameStatus: "welcome",
      gameMode: "easy",
      startTime: null,
      endTime: null,
      maxGuesses: 12,
    });
    setElapsedTime(0);
  }, []);

  return (
    <Page back={false}>
      <div className="relative h-screen overflow-hidden">
        {/* Game Board */}
        <GameBoard
          gameState={gameState}
          elapsedTime={elapsedTime}
          onGuessUpdate={updateCurrentGuess}
          onMakeGuess={makeGuess}
        />

        {/* Welcome Overlay */}
        {gameState.gameStatus === "welcome" && (
          <WelcomeOverlay onStart={startGame} />
        )}

        {/* Success Overlay */}
        {gameState.gameStatus === "won" && (
          <SuccessOverlay
            guesses={gameState.guesses.length}
            time={elapsedTime}
            gameMode={gameState.gameMode}
            onShare={handleShare}
            onPlayAgain={resetGame}
          />
        )}

        {/* Game Over Overlay */}
        {gameState.gameStatus === "lost" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full text-center">
              <Title level="2" className="mb-4 text-red-600">
                Game Over! 🎯
              </Title>
              <p className="mb-4">
                You couldn't crack the code in {gameState.maxGuesses} attempts.
              </p>

              {/* Show the correct answer */}
              <div className="mb-4">
                <p className="text-sm opacity-75 mb-2">The correct code was:</p>
                <div className="flex justify-center gap-2">
                  {gameState.secretCode.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border border-gray-300"
                      style={{ backgroundColor: `var(--mastermind-${color})` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button mode="outline" onClick={resetGame} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};
