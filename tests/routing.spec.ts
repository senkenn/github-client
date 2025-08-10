import { expect, test } from "@playwright/test";

// Minimal mock data aligned with playwight/mock-server.ts and types
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
  {
    id: 2,
    number: 124,
    title: "Test Issue 2",
    body: "Test body 2",
    state: "closed",
    created_at: "2024-01-14T08:15:30Z",
    updated_at: "2024-01-14T08:15:30Z",
    user: { login: "testuser2", avatar_url: "https://example.com/avatar2.png" },
    comments: 2,
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

test.describe("Issues routing (E2E)", () => {
  test("/issues shows list (index route)", async ({ page }) => {
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

    await page.goto("/issues?owner=microsoft&repo=vscode");

    // Title from parent route + search
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Issues\s*-\s*microsoft\/vscode/,
    );

    // List items rendered by IssuesList
    await expect(page.getByTestId("issue-item")).toHaveCount(2);
  });

  test("/issues/:number shows detail (child route)", async ({ page }) => {
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

    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Wait for detail header to include issue number and title (specific H1)
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Test Issue 1/ }),
    ).toBeVisible();
  });
});
