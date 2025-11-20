import React, { useEffect, useRef } from "react";
import { Button, Title, Text } from "@telegram-apps/telegram-ui";
import { GameState } from "@/types/game";
import { formatTime } from "@/utils/gameLogic";
import { ColorPicker } from "./ColorPicker";
import { GuessRow } from "./GuessRow";

interface GameBoardProps {
  gameState: GameState;
  elapsedTime: number;
  onGuessUpdate: (index: number, color: any) => void;
  onMakeGuess: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  elapsedTime,
  onGuessUpdate,
  onMakeGuess,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when guesses change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [gameState.guesses.length]);

  if (gameState.gameStatus !== "playing") {
    return null;
  }

  const canMakeGuess = gameState.currentGuess.every((color) => color !== null);
  const remainingGuesses = gameState.maxGuesses - gameState.guesses.length;

  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable Game History */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 pb-6 scroll-smooth"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Title level="1" className="mb-2">
            😎 Mastermind
          </Title>
          <div className="flex justify-center gap-4">
            <Text className="opacity-75">⏱️ {formatTime(elapsedTime)}</Text>
            <Text className="opacity-75">
              🎲 {remainingGuesses} guesses left
            </Text>
          </div>
        </div>

        {/* Secret Code Display (Hidden) */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="text-center">
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 bg-gray-200 dark:bg-gray-700"
                  style={{ filter: "blur(2px)" }}
                />
              ))}
            </div>
            <Text className="opacity-60">Hidden Code</Text>
          </div>
        </div>

        {/* Previous Guesses */}
        <div className="space-y-2 mb-6">
          {gameState.guesses.map((guess, index) => (
            <GuessRow key={index} guess={guess} />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Section - Current Guess + Color Picker */}
      <div className="sticky bottom-0 bg-gradient-to-t from-white/98 via-white/95 to-white/90 dark:from-gray-900/98 dark:via-gray-900/95 dark:to-gray-900/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/10">
        {/* Current Guess */}
        <div className="border-b border-gray-200/30 dark:border-gray-700/30 p-4 pb-5">
          <div className="flex justify-center gap-2 mb-4">
            {gameState.currentGuess.map((color, index) => (
              <div
                key={index}
                className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                  color
                    ? "border-gray-400/60 shadow-md hover:shadow-lg"
                    : "border-dashed border-gray-400/60 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                }`}
                style={{
                  backgroundColor: color
                    ? gameState.availableColors.includes(color as any)
                      ? `var(--mastermind-${color})`
                      : "#gray"
                    : "transparent",
                }}
                onClick={() => onGuessUpdate(index, null)}
              />
            ))}
          </div>

          <div className="text-center flex gap-2 justify-center">
            <Button
              mode="filled"
              onClick={onMakeGuess}
              disabled={!canMakeGuess}
            >
              Make Guess
            </Button>

            <Button
              mode="outline"
              onClick={() => {
                // Find the last filled position and clear it
                const lastFilledIndex =
                  gameState.currentGuess.indexOf(null) - 1;
                if (lastFilledIndex >= 0) {
                  onGuessUpdate(lastFilledIndex, null);
                } else {
                  // Clear the last position if all are filled
                  const lastIndex = gameState.currentGuess.length - 1;
                  if (gameState.currentGuess[lastIndex] !== null) {
                    onGuessUpdate(lastIndex, null);
                  }
                }
              }}
              className="text-sm"
            >
              ↶ delete
            </Button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="p-4 pt-3">
          <ColorPicker
            availableColors={gameState.availableColors}
            onColorSelect={(color) => {
              const emptyIndex = gameState.currentGuess.findIndex(
                (c) => c === null
              );
              if (emptyIndex !== -1) {
                onGuessUpdate(emptyIndex, color);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
