import React from "react";
import { Button, Title, Text } from "@telegram-apps/telegram-ui";

interface WelcomeOverlayProps {
  onStart: (mode: "easy" | "hard") => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full flex flex-col max-h-[95vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="p-6 pb-4 text-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="text-5xl mb-3">😎</div>
          <Title level="1" className="mb-2">
            Mastermind
          </Title>
          <Text className="opacity-75">
            Crack the secret color code! You have 12 attempts to guess the
            5-color combination.
          </Text>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <Text className="font-semibold mb-3 text-green-700 dark:text-green-300">
              🎯 How to Play:
            </Text>
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

          <div className="grid grid-cols-1 gap-3">
            {/* Easy Mode */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <Text className="font-semibold mb-2 text-green-700 dark:text-green-300 mr-1">
                🟢 Easy Mode:
              </Text>
              <Text className="text-sm mb-3">
                Hints are specific to each color position - perfect for
                learning!
              </Text>
              <Button
                mode="filled"
                size="m"
                onClick={() => onStart("easy")}
                className="w-full bg-green-600 hover:bg-green-700 mt-1"
              >
                Start Easy Mode 🌱
              </Button>
            </div>

            {/* Hard Mode */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <Text className="font-semibold mb-2 text-red-700 dark:text-red-300 mr-1">
                🔴 Hard Mode:
              </Text>
              <Text className="text-sm mb-3">
                Hints are randomized - true challenge for masters! 🏆
              </Text>
              <Button
                mode="filled"
                size="m"
                onClick={() => onStart("hard")}
                className="w-full bg-red-600 hover:bg-red-700 mt-1"
              >
                Start Hard Mode ⚡
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
