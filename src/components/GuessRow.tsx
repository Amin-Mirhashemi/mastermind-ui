import React from "react";
import { Guess } from "@/types/game";

interface GuessRowProps {
  guess: Guess;
}

export const GuessRow: React.FC<GuessRowProps> = ({ guess }) => {
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

      {/* Hint pegs */}
      <div className="flex gap-1">
        {/* Black pegs (correct position) */}
        {Array.from({ length: blackPegs }, (_, i) => (
          <div
            key={`black-${i}`}
            className="w-4 h-4 rounded-full bg-black"
            title="Correct color, correct position"
          />
        ))}

        {/* White pegs (correct color, wrong position) */}
        {Array.from({ length: whitePegs }, (_, i) => (
          <div
            key={`white-${i}`}
            className="w-4 h-4 rounded-full bg-white border border-gray-400"
            title="Correct color, wrong position"
          />
        ))}
      </div>
    </div>
  );
};
