/**
 * Format a Firestore Timestamp or Date to a human-readable string.
 */
export function formatDate(
  date: { toDate?: () => Date } | Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d =
    typeof date === "string"
      ? new Date(date)
      : date instanceof Date
        ? date
        : date.toDate?.() ?? new Date();

  return d.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date to relative time (e.g., "2h ago", "3 days ago").
 */
export function timeAgo(
  date: { toDate?: () => Date } | Date | string
): string {
  const d =
    typeof date === "string"
      ? new Date(date)
      : date instanceof Date
        ? date
        : date.toDate?.() ?? new Date();

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "min"],
  ];

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count}${label} ago`;
  }

  return "just now";
}
