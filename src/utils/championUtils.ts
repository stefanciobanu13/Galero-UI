/**
 * Champions page utility functions
 * Provides helper functions for win rate calculations and color mapping
 */

export const getWinRate = (wins: number, matches: number): string => {
  if (matches === 0) return "0";
  return Math.round((wins / matches) * 100).toString();
};

export const getWinRateColor = (wins: number, matches: number): string => {
  const rate = matches === 0 ? 0 : (wins / matches) * 100;
  if (rate >= 75) return "success";
  if (rate >= 50) return "warning";
  return "error";
};

export const colorMap: Record<string, string> = {
  green: "#4CAF50",
  orange: "#FF9800",
  gray: "#9E9E9E",
  blue: "#2196F3",
};

export const getColorValue = (color: string): string => {
  return colorMap[color] || "#FFFFFF";
};

export const getRankEmoji = (index: number): string => {
  switch (index) {
    case 0:
      return "🥇";
    case 1:
      return "🥈";
    case 2:
      return "🥉";
    default:
      return `${index + 1}`;
  }
};
