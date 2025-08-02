import { expect, test } from "@playwright/experimental-ct-react";
import { formatDate, formatDateFromIso } from "../lib/dateUtils";

test("dateUtils formatDate should render correct yyyy/mm/dd format", async ({
  mount,
}) => {
  // Create a simple test component that uses the date utils
  const DateTestComponent = () => {
    const testDate = new Date(2024, 0, 15); // January 15, 2024
    const testIsoString = "2024-01-14T08:15:30Z";

    return (
      <div>
        <div data-testid="format-date">{formatDate(testDate)}</div>
        <div data-testid="format-iso-date">
          {formatDateFromIso(testIsoString)}
        </div>
        <div data-testid="format-invalid-date">
          {formatDateFromIso("invalid-date")}
        </div>
      </div>
    );
  };

  const component = await mount(<DateTestComponent />);

  // Test formatDate
  await expect(component.getByTestId("format-date")).toHaveText("2024/01/15");

  // Test formatDateFromIso
  await expect(component.getByTestId("format-iso-date")).toHaveText(
    "2024/01/14",
  );

  // Test invalid date handling
  await expect(component.getByTestId("format-invalid-date")).toHaveText(
    "Invalid date",
  );
});

test("dateUtils should handle edge cases correctly", async ({ mount }) => {
  const EdgeCaseTestComponent = () => {
    const singleDigitDate = new Date(2024, 0, 5); // January 5, 2024
    const decemberDate = new Date(2024, 11, 31); // December 31, 2024

    return (
      <div>
        <div data-testid="single-digit-date">{formatDate(singleDigitDate)}</div>
        <div data-testid="december-date">{formatDate(decemberDate)}</div>
      </div>
    );
  };

  const component = await mount(<EdgeCaseTestComponent />);

  // Test single digit month/day padding
  await expect(component.getByTestId("single-digit-date")).toHaveText(
    "2024/01/05",
  );

  // Test December (month 12)
  await expect(component.getByTestId("december-date")).toHaveText("2024/12/31");
});
