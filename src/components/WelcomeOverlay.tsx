import React from "react";
import { Button, Title, Text } from "@telegram-apps/telegram-ui";

interface WelcomeOverlayProps {
  onStart: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <Title level="1" className="mb-2">
            Mastermind
          </Title>
          <Text className="opacity-75">
            Crack the secret color code! You have 12 attempts to guess the
            5-color combination.
          </Text>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 pl-8 border border-blue-200 dark:border-blue-800">
            <div className="space-y-1 text-left p-l-1">
              <li>
                <Text>Crack the 5-color secret code</Text>
              </li>
              <li>
                <Text>Black peg = right color, right spot</Text>
              </li>
              <li>
                <Text>White peg = right color, wrong spot</Text>
              </li>
              <li>
                <Text>Share your best scores and compete!</Text>
              </li>
            </div>
          </div>

          <div className="text-center">
            <Text className="text-sm opacity-75">
              🏆 See if you can become the Mastermind Champion!
            </Text>
          </div>
        </div>

        <Button mode="filled" size="l" onClick={onStart} className="w-full">
          Start Game 🚀
        </Button>
      </div>
    </div>
  );
};
