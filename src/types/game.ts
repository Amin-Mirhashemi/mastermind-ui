// Game types and constants
export type Color =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "orange"
  | "pink"
  | "cyan"
  | "lime"
  | "teal"
  | "indigo"
  | "violet"
  | "maroon"
  | "navy";

export interface Guess {
  colors: (Color | null)[];
  hints: ("black" | "white" | null)[];
  timestamp: number;
}

export type GameMode = "easy" | "hard";

export interface GameState {
  secretCode: Color[];
  availableColors: Color[];
  guesses: Guess[];
  currentGuess: (Color | null)[];
  gameStatus: "welcome" | "playing" | "won" | "lost";
  gameMode: GameMode;
  startTime: number | null;
  endTime: number | null;
  maxGuesses: number;
}

export const ALL_COLORS: Color[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "pink",
  // "cyan",
  // "lime",
  // "teal",
  // "indigo",
  // "violet",
  "maroon",
  // "navy",
];

export const COLOR_MAP = {
  red: "#ef4444", // Bright red
  blue: "#2563eb", // Royal blue (darker than original)
  green: "#059669", // Forest green (darker emerald)
  yellow: "#eab308", // Golden yellow (more yellow, less orange)
  purple: "#9333ea", // Magenta purple (more distinct)
  orange: "#ea580c", // Burnt orange (more distinct)
  pink: "#db2777", // Deep pink (darker)
  cyan: "#0891b2", // Deep cyan (darker)
  lime: "#65a30d", // Olive green (darker lime)
  teal: "#0d9488", // Ocean teal (darker)
  indigo: "#4f46e5", // Electric indigo (brighter)
  violet: "#c026d3", // Electric violet (more magenta)
  maroon: "#991b1b", // Deep maroon (darker)
  navy: "#1e3a8a", // Deep navy (darker)
} as const;
