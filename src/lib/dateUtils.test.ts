import { describe, expect, it } from "vitest";
import { formatDate, formatDateFromIso } from "./dateUtils";

describe("dateUtils", () => {
  describe("formatDate", () => {
    it("should format date to yyyy/mm/dd format", () => {
      const date = new Date(2024, 0, 15); // January 15, 2024 (month is 0-based)
      const result = formatDate(date);
      expect(result).toBe("2024/01/15");
    });

    it("should pad single digit months and days with zeros", () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      const result = formatDate(date);
      expect(result).toBe("2024/01/05");
    });

    it("should handle December correctly", () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      const result = formatDate(date);
      expect(result).toBe("2024/12/31");
    });

    it("should handle different years", () => {
      const date = new Date(2023, 5, 10); // June 10, 2023
      const result = formatDate(date);
      expect(result).toBe("2023/06/10");
    });
  });

  describe("formatDateFromIso", () => {
    it("should format ISO date string to yyyy/mm/dd format", () => {
      const isoString = "2024-01-15T10:30:00Z";
      const result = formatDateFromIso(isoString);
      expect(result).toBe("2024/01/15");
    });

    it("should handle ISO date string without time", () => {
      const isoString = "2024-01-15";
      const result = formatDateFromIso(isoString);
      expect(result).toBe("2024/01/15");
    });

    it("should handle ISO date string with timezone", () => {
      const isoString = "2024-01-15T10:30:00+09:00";
      const result = formatDateFromIso(isoString);
      expect(result).toBe("2024/01/15");
    });

    it("should handle single digit months and days from ISO string", () => {
      const isoString = "2024-01-05T10:30:00Z";
      const result = formatDateFromIso(isoString);
      expect(result).toBe("2024/01/05");
    });

    it("should return 'Invalid date' for invalid ISO string", () => {
      const isoString = "invalid-date";
      const result = formatDateFromIso(isoString);
      expect(result).toBe("Invalid date");
    });

    it("should return 'Invalid date' for empty string", () => {
      const isoString = "";
      const result = formatDateFromIso(isoString);
      expect(result).toBe("Invalid date");
    });

    it("should handle GitHub API date format", () => {
      // This is the typical format returned by GitHub API
      const isoString = "2024-01-15T08:30:45Z";
      const result = formatDateFromIso(isoString);
      expect(result).toBe("2024/01/15");
    });
  });
});
