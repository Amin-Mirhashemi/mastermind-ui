import { Color, ALL_COLORS } from "@/types/game";

// Daily challenge utilities

/**
 * Generate a deterministic color code for a given date
 * Same date always produces the same result
 */
export function generateDailyCode(dateString: string): Color[] {
  // Use date string to create a seed for deterministic randomness
  const seed = hashString(dateString);

  // Select 8 colors from the 12 available
  const selectedColors = selectColorsForDate(seed, 8);

  // Generate 5-color code from selected colors
  const code: Color[] = [];
  for (let i = 0; i < 5; i++) {
    const index = (seed + i * 7) % selectedColors.length;
    code.push(selectedColors[index]);
  }

  return code;
}

/**
 * Get the 8 colors available for a given date
 */
export function getDailyColors(dateString: string): Color[] {
  const seed = hashString(dateString);
  return selectColorsForDate(seed, 8);
}

/**
 * Select n colors deterministically based on seed
 */
function selectColorsForDate(seed: number, count: number): Color[] {
  // Create a shuffled version of all colors using the seed
  const shuffled = [...ALL_COLORS].sort((a, b) => {
    const hashA = hashString(a) + seed;
    const hashB = hashString(b) + seed;
    return hashA - hashB;
  });

  return shuffled.slice(0, count);
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const [month, day, year] = new Date().toLocaleDateString().split("/");
  return `${year}-${month}-${day}`;
}

/**
 * Check if a game was played more than 1 day ago
 */
export function isStreakBroken(lastGameDate: string): boolean {
  const lastGame = new Date(lastGameDate);
  const today = new Date();
  const diffTime = today.getTime() - lastGame.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 2;
}

/**
 * Create a shareable URL for today's challenge
 */
export function getDailyChallengeUrl(): string {
  const today = getTodayString();
  const code = generateDailyCode(today);
  const availableColors = getDailyColors(today);
  // Create a secret hash instead of showing actual colors
  const secretCode = btoa(
    JSON.stringify({ code, availableColors, date: today })
  ).replace(/=+$/, "");
  return `/game/${secretCode}/daily`;
}

/**
 * Parse daily challenge from URL params
 */
export function parseDailyChallenge(secretCode: string): {
  colors: Color[];
  availableColors: Color[];
  date: string;
  isValid: boolean;
} {
  try {
    // Decode the secret code
    const decoded = JSON.parse(
      atob(
        secretCode.padEnd(
          secretCode.length + ((4 - (secretCode.length % 4)) % 4),
          "="
        )
      )
    );
    const { code, availableColors, date } = decoded;

    // Verify it's a valid daily challenge by regenerating
    const expectedCode = generateDailyCode(date);
    const expectedColors = getDailyColors(date);

    if (
      JSON.stringify(code) === JSON.stringify(expectedCode) &&
      JSON.stringify(availableColors) === JSON.stringify(expectedColors)
    ) {
      return {
        colors: code,
        availableColors,
        date,
        isValid: true,
      };
    }
  } catch (error) {
    // Invalid encoding
  }

  return {
    colors: [],
    availableColors: [],
    date: "",
    isValid: false,
  };
}
