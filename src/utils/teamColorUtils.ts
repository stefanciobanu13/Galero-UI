export type TeamColor = "verde" | "portocaliu" | "gri" | "albastru";

export const TEAM_COLORS: TeamColor[] = [
  "verde",
  "portocaliu",
  "gri",
  "albastru",
];

export const TEAM_COLOR_HEX: Record<TeamColor, string> = {
  verde: "#4CAF50",
  portocaliu: "#FF9800",
  gri: "#9E9E9E",
  albastru: "#2196F3",
};

export const TEAM_COLOR_TO_ENGLISH: Record<
  TeamColor,
  "green" | "orange" | "gray" | "blue"
> = {
  verde: "green",
  portocaliu: "orange",
  gri: "gray",
  albastru: "blue",
};

export function getTeamColorHex(color: string): string {
  return TEAM_COLOR_HEX[color as TeamColor] || "#FFFFFF";
}

export function toEnglishTeamColor(
  color: TeamColor
): "green" | "orange" | "gray" | "blue" {
  return TEAM_COLOR_TO_ENGLISH[color];
}
