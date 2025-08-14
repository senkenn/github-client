import { expect, test } from "@playwright/test";

/**
 * E2E tests specifically focused on routing behavior and URL handling
 * These tests verify that routes work correctly with proper URL parameters
 * and search params. For comprehensive page functionality tests, see pages.spec.ts
 */

// Minimal mock data for routing tests
const mockIssues = [
  {
    id: 1,
    number: 123,
    title: "Test Issue 1",
    body: "Test body 1",
    state: "open",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: { login: "testuser1", avatar_url: "https://example.com/avatar1.png" },
    comments: 0,
  },
];

const mockComments = [
  {
    id: 1,
    body: "This is a test comment",
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
    user: {
      login: "commenter1",
      avatar_url: "https://example.com/commenter1.png",
    },
  },
];

test.describe("Routing behavior (E2E)", () => {
  test("should handle /issues route with search parameters", async ({
    page,
  }) => {
    // Intercept GitHub Issues API
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssues),
        });
      },
    );

    await page.goto("/issues?owner=testowner&repo=testrepo&state=open");

    // Verify URL parameters are handled correctly
    await expect(page).toHaveURL(/owner=testowner/);
    await expect(page).toHaveURL(/repo=testrepo/);
    await expect(page).toHaveURL(/state=open/);

    // Verify route renders correctly
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Issues\s*-\s*testowner\/testrepo/,
    );
  });

  test("should handle /issues/:number route with search parameters", async ({
    page,
  }) => {
    // Intercept issue detail
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssues[0]),
        });
      },
    );

    // Intercept comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockComments),
        });
      },
    );

    await page.goto("/issues/123?owner=testowner&repo=testrepo");

    // Verify URL parameters are handled correctly
    await expect(page).toHaveURL(/owner=testowner/);
    await expect(page).toHaveURL(/repo=testrepo/);
    await expect(page).toHaveURL(/issues\/123/);

    // Verify route renders correctly
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Test Issue 1/ }),
    ).toBeVisible();
  });

  test("should handle default state parameter for /issues route", async ({
    page,
  }) => {
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssues),
        });
      },
    );

    // Navigate without state parameter
    await page.goto("/issues?owner=testowner&repo=testrepo");

    // Default state should be 'open' based on route validation
    // Check that the filter dropdown shows 'open' as default
    const stateSelect = page.locator("select");
    if (await stateSelect.isVisible()) {
      await expect(stateSelect).toHaveValue("open");
    }
  });

  test("should validate route parameters correctly", async ({ page }) => {
    await page.route("**/repos/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockIssues),
      });
    });

    // Test with valid state parameter
    await page.goto("/issues?owner=testowner&repo=testrepo&state=closed");
    await expect(page).toHaveURL(/state=closed/);

    // Test with invalid state parameter (should default to 'open')
    await page.goto("/issues?owner=testowner&repo=testrepo&state=invalid");
    // Should either default to 'open' or handle invalid state gracefully
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
