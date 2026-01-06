// ===== COLOR UTILITIES =====
const colorMap: Record<string, string> = {
  verde: "#9cff7a",
  portocaliu: "#fcb142",
  gri: "#e3e1e1",
  albastru: "#80d2ff",
};

export const getColorValue = (color: string): string => {
  return colorMap[color] || "#FFFFFF";
};

// ===== DATE UTILITIES =====
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
