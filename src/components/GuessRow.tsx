import React from "react";
import { Guess, GameMode } from "@/types/game";

interface GuessRowProps {
  guess: Guess;
  gameMode: GameMode;
}

export const GuessRow: React.FC<GuessRowProps> = ({ guess, gameMode }) => {
  if (gameMode === "easy") {
    // Easy mode: Show hints in their corresponding positions
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        {/* Color pegs */}
        <div className="flex gap-1 flex-1">
          {guess.colors.map((color, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full border border-gray-300"
              style={{
                backgroundColor: color
                  ? `var(--mastermind-${color})`
                  : "transparent",
              }}
            />
          ))}
        </div>

        {/* Hint pegs in positions (easy mode) */}
        <div className="flex gap-1">
          {guess.hints.map((hint, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full flex items-center justify-center border-solid ${
                hint === "black"
                  ? "bg-black border-black"
                  : hint === "white"
                  ? "bg-slate-100 dark:bg-slate-300 border-gray-600 dark:border-gray-400"
                  : "bg-transparent border-gray-300 dark:border-white"
              }`}
              style={{
                borderWidth: hint ? "2px" : "1px",
              }}
              title={
                hint === "black"
                  ? "Correct color, correct position"
                  : hint === "white"
                  ? "Correct color, wrong position"
                  : ""
              }
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Hard mode: Group hints to the left (original behavior)
  const blackPegs = guess.hints.filter((hint) => hint === "black").length;
  const whitePegs = guess.hints.filter((hint) => hint === "white").length;

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      {/* Color pegs */}
      <div className="flex gap-1 flex-1">
        {guess.colors.map((color, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded-full border border-gray-300"
            style={{
              backgroundColor: color
                ? `var(--mastermind-${color})`
                : "transparent",
            }}
          />
        ))}
      </div>

      {/* Hint pegs grouped (hard mode) */}
      <div className="flex gap-1">
        {/* Black pegs (correct position) */}
        {Array.from({ length: blackPegs }, (_, i) => (
          <div
            key={`black-${i}`}
            className="w-4 h-4 rounded-full bg-black border-2 border-black flex items-center justify-center"
            title="Correct color, correct position"
          ></div>
        ))}

        {/* White pegs (correct color, wrong position) */}
        {Array.from({ length: whitePegs }, (_, i) => (
          <div
            key={`white-${i}`}
            className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-300 border-2 border-gray-600 dark:border-gray-400 flex items-center justify-center"
            title="Correct color, wrong position"
          ></div>
        ))}
      </div>
    </div>
  );
};
