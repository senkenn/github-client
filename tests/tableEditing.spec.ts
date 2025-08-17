import { expect, test } from "@playwright/test";

test.describe("Table Editing Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Fill in owner and repo to navigate to issues page
    await page.fill('[data-testid="owner-input"]', "testowner");
    await page.fill('[data-testid="repo-input"]', "testrepo");
    await page.click('[data-testid="view-issues-button"]');
    await page.waitForURL("/issues");
  });

  test("should show table editing buttons when table is active", async ({
    page,
  }) => {
    // Navigate to a mock issue detail page (we'll simulate this)
    await page.goto("/issues/1");

    // Wait for the editor to load
    await page.waitForSelector('[data-testid="tiptap-editor"]', {
      timeout: 10000,
    });

    // Click to start editing
    await page.click('[data-testid="tiptap-editor"]');

    // Insert a table
    await page.click('button:has-text("Table")');

    // Check that table editing buttons appear
    await expect(page.locator('button:has-text("+Row")')).toBeVisible();
    await expect(page.locator('button:has-text("-Row")')).toBeVisible();
    await expect(page.locator('button:has-text("+Col")')).toBeVisible();
    await expect(page.locator('button:has-text("-Col")')).toBeVisible();
    await expect(page.locator('button:has-text("×Table")')).toBeVisible();
  });

  test("should verify delete buttons have correct styling", async ({
    page,
  }) => {
    // Navigate to a mock issue detail page
    await page.goto("/issues/1");

    // Wait for the editor to load
    await page.waitForSelector('[data-testid="tiptap-editor"]', {
      timeout: 10000,
    });

    // Click to start editing
    await page.click('[data-testid="tiptap-editor"]');

    // Insert a table
    await page.click('button:has-text("Table")');

    // Check that delete buttons have orange styling
    const deleteRowButton = page.locator('button:has-text("-Row")');
    const deleteColButton = page.locator('button:has-text("-Col")');

    await expect(deleteRowButton).toHaveClass(/bg-orange-200/);
    await expect(deleteColButton).toHaveClass(/bg-orange-200/);
  });
});
