/**
 * Player profile utility functions
 * Provides helper functions for formatting, colors, and display logic
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

export const getPlacementColor = (placement: number): string => {
  switch (placement) {
    case 1:
      return "#FFD700"; // Gold
    case 2:
      return "#C0C0C0"; // Silver
    case 3:
      return "#CD7F32"; // Bronze
    default:
      return "#9E9E9E"; // Gray
  }
};

export const getPlacementEmoji = (placement: number): string => {
  switch (placement) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    case 4:
      return "🏅";
    default:
      return `#${placement}`;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatMemberSinceDate = (createdAt?: string): string => {
  const date = createdAt ? new Date(createdAt) : new Date();
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
