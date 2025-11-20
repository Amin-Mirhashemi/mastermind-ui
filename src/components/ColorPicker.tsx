import React from "react";
import { Text } from "@telegram-apps/telegram-ui";
import { Color } from "@/types/game";

interface ColorPickerProps {
  availableColors: Color[];
  onColorSelect: (color: Color) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  availableColors,
  onColorSelect,
}) => {
  return (
    <div className="space-y-4 text-center ">
      <Text className="text-sm opacity-75">
        Tap a color to add it to your guess
      </Text>

      <div className="grid grid-cols-4 gap-3 justify-center max-w-xs mx-auto">
        {availableColors.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className="mx-auto w-12 h-12 rounded-full border-2 border-gray-300/60 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-400/20 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              backgroundColor: `var(--mastermind-${color})`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            title={color.charAt(0).toUpperCase() + color.slice(1)}
            aria-label={`Select ${color} color`}
          />
        ))}
      </div>
    </div>
  );
};
