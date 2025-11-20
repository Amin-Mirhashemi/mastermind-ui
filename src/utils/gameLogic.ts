import { Color, ALL_COLORS } from "../types/game";

// Generate a random subset of 8 colors and pick 5 for the secret code
export function generateGameColors(): {
  secretCode: Color[];
  availableColors: Color[];
} {
  // Shuffle all colors and take first 8
  const shuffled = [...ALL_COLORS].sort(() => Math.random() - 0.5);
  const availableColors = shuffled.slice(0, 8);

  // Pick 5 random colors from the available set (can repeat)
  const secretCode: Color[] = [];
  for (let i = 0; i < 5; i++) {
    secretCode.push(
      availableColors[Math.floor(Math.random() * availableColors.length)]
    );
  }

  return { secretCode, availableColors };
}

// Calculate hints for a guess
export function calculateHints(
  guess: Color[],
  secretCode: Color[],
  gameMode: "easy" | "hard" = "hard"
): ("black" | "white" | null)[] {
  const hints: ("black" | "white" | null)[] = [null, null, null, null, null];
  const secretCopy = [...secretCode];
  const guessCopy = [...guess];

  // First pass: find exact matches (black pegs)
  for (let i = 0; i < 5; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      hints[i] = "black";
      secretCopy[i] = null as any; // Mark as used
      guessCopy[i] = null as any; // Mark as used
    }
  }

  // Second pass: find color matches in wrong positions (white pegs)
  for (let i = 0; i < 5; i++) {
    if (hints[i] === null && guessCopy[i] !== null) {
      const secretIndex = secretCopy.indexOf(guessCopy[i]);
      if (secretIndex !== -1) {
        hints[i] = "white";
        secretCopy[secretIndex] = null as any; // Mark as used
      }
    }
  }

  // In easy mode, hints stay in their positions to help identify which colors are correct
  // In hard mode, hints are randomized so players can't tell which hint belongs to which color
  if (gameMode === "hard") {
    return hints.sort((a, b) => {
      if (a === "black" && b !== "black") return -1;
      if (a !== "black" && b === "black") return 1;
      return 0;
    });
  }

  // In easy mode, return hints in their original positions
  return hints;
}

// Check if the guess is correct
export function isCorrectGuess(guess: Color[], secretCode: Color[]): boolean {
  return guess.every((color, index) => color === secretCode[index]);
}

// Format time for display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Generate share text based on performance
export function generateShareText(
  guesses: number,
  timeInSeconds: number,
  secretCode: Color[],
  gameMode: "easy" | "hard" = "hard"
): string {
  const timeFormatted = formatTime(timeInSeconds);

  // Create visual representation of the secret code
  const colorEmojis = {
    red: "🔴",
    blue: "🔵",
    green: "🟢",
    yellow: "🟡",
    purple: "🟣",
    orange: "🟠",
    pink: "🩷",
    cyan: "🔵",
    lime: "🟢",
    teal: "🔵",
    indigo: "🟣",
    violet: "🟣",
    maroon: "🔴",
    navy: "🔵",
  };

  const codeEmojis = secretCode.map((color) => colorEmojis[color]).join("");

  // Performance-based achievement messages
  let achievementTitle = "";
  let achievementEmoji = "";
  let challengeText = "";
  let modeBadge = gameMode === "hard" ? " 🔒 HARD MODE" : "";

  if (guesses <= 4 && timeInSeconds <= 90) {
    achievementTitle = `🎯 MASTERMIND GRANDMASTER!${modeBadge}`;
    achievementEmoji = "👑";
    challengeText = "Can you match this perfection?";
  } else if (guesses <= 6 && timeInSeconds <= 180) {
    achievementTitle = `🚀 CODE CRACKING CHAMPION!${modeBadge}`;
    achievementEmoji = "⚡";
    challengeText = "Think you can beat my speed?";
  } else if (guesses <= 8 && timeInSeconds <= 300) {
    achievementTitle = `🎯 PUZZLE MASTER!${modeBadge}`;
    achievementEmoji = "🧠";
    challengeText = "Your turn to crack the code!";
  } else if (guesses <= 10) {
    achievementTitle = `🎨 COLOR DETECTIVE!${modeBadge}`;
    achievementEmoji = "🔍";
    challengeText = "Show me your detective skills!";
  } else {
    achievementTitle = `🎯 CODE BREAKER!${modeBadge}`;
    achievementEmoji = "💪";
    challengeText = "Persistence pays off!";
  }

  // Create a card-like format with borders
  return `🎯 MASTERMIND CHALLENGE 🎯

${achievementEmoji} ${achievementTitle} ${achievementEmoji}

━━━━━━━━━━━━━━━━━━━━━━
🧩 SECRET CODE CRACKED!
${codeEmojis}
━━━━━━━━━━━━━━━━━━━━━━

⏱️ Time: ${timeFormatted}
🎲 Attempts: ${guesses}/12

💡 I cracked the color code with just ${guesses} ${
    guesses === 1 ? "try" : "tries"
  }!
${challengeText}

🎮 Think you can beat my score?
👉 Play now: @play_mastermind_bot

#Mastermind #CodeBreaker #PuzzleGame`;
}
