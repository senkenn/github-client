import { expect, test } from "@playwright/test";

/**
 * E2E tests for localStorage persistence functionality
 *
 * These tests verify that the owner and repo form inputs are properly
 * saved to and loaded from localStorage, providing a seamless user experience
 * when navigating back to the application.
 *
 * To run these tests:
 * 1. First install browsers: `npx playwright install`
 * 2. Run the specific localStorage tests: `npm run test:local`
 * 3. Or run all E2E tests: `npm run test:e2e`
 */
test.describe("localStorage persistence for owner/repo form", () => {
  // 1. 初回保存
  test("saves owner & repo values as user types", async ({ page }) => {
    await page.goto("/");

    // Clear localStorage before test
    await page.evaluate(() => localStorage.clear());

    // Test data
    const testOwner = "microsoft";
    const testRepo = "vscode";

    // Fill in the form inputs
    await page.fill('input[id="owner"]', testOwner);
    await page.fill('input[id="repo"]', testRepo);

    // Verify that values are saved to localStorage
    const storedOwner = await page.evaluate(() =>
      localStorage.getItem("github_owner"),
    );
    const storedRepo = await page.evaluate(() =>
      localStorage.getItem("github_repo"),
    );

    expect(storedOwner).toBe(testOwner);
    expect(storedRepo).toBe(testRepo);
  });

  // 2. リロード復元
  test("restores values after reload", async ({ page }) => {
    await page.goto("/");

    // Clear localStorage before test
    await page.evaluate(() => localStorage.clear());

    // Test data
    const testOwner = "microsoft";
    const testRepo = "vscode";

    // Fill in the form inputs
    await page.fill('input[id="owner"]', testOwner);
    await page.fill('input[id="repo"]', testRepo);

    // Reload the page to test persistence
    await page.reload();

    // Verify that the form inputs are pre-filled with the stored values
    const ownerValue = await page.inputValue('input[id="owner"]');
    const repoValue = await page.inputValue('input[id="repo"]');

    expect(ownerValue).toBe(testOwner);
    expect(repoValue).toBe(testRepo);
  });

  // 3. 空状態
  test("handles empty localStorage gracefully", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Verify that form inputs are empty when no localStorage values exist
    const ownerValue = await page.inputValue('input[id="owner"]');
    const repoValue = await page.inputValue('input[id="repo"]');

    expect(ownerValue).toBe("");
    expect(repoValue).toBe("");
  });

  // 4. 既存値プレロード
  test("pre-populates form with existing localStorage values", async ({
    page,
  }) => {
    await page.goto("/");

    // Pre-populate localStorage with test values before reload
    await page.evaluate(() => {
      localStorage.setItem("github_owner", "facebook");
      localStorage.setItem("github_repo", "react");
    });

    // Reload the page to trigger the localStorage load
    await page.reload();

    // Verify that inputs are pre-filled with values from localStorage
    const ownerValue = await page.inputValue('input[id="owner"]');
    const repoValue = await page.inputValue('input[id="repo"]');

    expect(ownerValue).toBe("facebook");
    expect(repoValue).toBe("react");
  });
});
