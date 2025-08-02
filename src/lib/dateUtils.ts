/**
 * Formats a Date object to yyyy/mm/dd format
 * @param date - The date to format
 * @returns Formatted date string in yyyy/mm/dd format
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * Formats an ISO date string to yyyy/mm/dd format
 * @param isoString - ISO date string
 * @returns Formatted date string in yyyy/mm/dd format
 */
export function formatDateFromIso(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return formatDate(date);
}
