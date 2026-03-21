/**
 * Calculates a date relative to today by adding or subtracting days.
 * @param days - Number of days to add (positive) or subtract (negative) from today.
 * @returns Formatted date string as "Month, DD YYYY" (e.g., "March, 31 2026").
 */
export function dateCal(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const month = date.toLocaleString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}, ${day} ${year}`;
}
