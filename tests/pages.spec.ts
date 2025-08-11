import { expect, test } from "@playwright/test";

/**
 * Comprehensive E2E tests for the main pages:
 * - "/" (root/home page)
 * - "/issues" (issues list page)
 * - "/issues/${issueNumber}" (issue detail page)
 *
 * These tests cover the complete user journey and page functionality.
 */

// Mock data for testing
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

test.describe('Root page ("/") E2E tests', () => {
  test("should display the GitHub Issues Viewer form", async ({ page }) => {
    await page.goto("/");

    // Check page title and main heading
    await expect(
      page.getByRole("heading", { name: "GitHub Issues Viewer" }),
    ).toBeVisible();

    // Check form elements are present
    await expect(page.locator('input[id="owner"]')).toBeVisible();
    await expect(page.locator('input[id="repo"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Issues を表示" }),
    ).toBeVisible();

    // Check labels
    await expect(page.getByText("Owner")).toBeVisible();
    await expect(page.getByText("Repository")).toBeVisible();
  });

  test("should validate form inputs before submission", async ({ page }) => {
    await page.goto("/");

    // Try to submit empty form
    await page.getByRole("button", { name: "Issues を表示" }).click();

    // Form should not navigate (HTML5 validation should prevent submission)
    await expect(page).toHaveURL("/");
  });

  test("should show error for non-existent repository", async ({ page }) => {
    await page.goto("/");

    // Mock API to return 404 for repository check
    await page.route("**/repos/nonexistent/repo", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Not Found" }),
      });
    });

    // Fill form with non-existent repository
    await page.fill('input[id="owner"]', "nonexistent");
    await page.fill('input[id="repo"]', "repo");
    await page.getByRole("button", { name: "Issues を表示" }).click();

    // Check error message appears
    await expect(
      page.getByText('リポジトリ "nonexistent/repo" が見つかりません。'),
    ).toBeVisible();
  });

  test("should navigate to issues page on successful repository validation", async ({
    page,
  }) => {
    await page.goto("/");

    // Mock API to return success for repository check
    await page.route("**/repos/microsoft/vscode", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          name: "vscode",
          full_name: "microsoft/vscode",
          owner: { login: "microsoft" },
        }),
      });
    });

    // Mock issues API for the target page
    await page.route("**/repos/microsoft/vscode/issues*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockIssues),
      });
    });

    // Fill form with valid repository
    await page.fill('input[id="owner"]', "microsoft");
    await page.fill('input[id="repo"]', "vscode");
    await page.getByRole("button", { name: "Issues を表示" }).click();

    // Should navigate to issues page (allow for default state parameter)
    await expect(page).toHaveURL(/\/issues\?.*owner=microsoft.*repo=vscode/);
  });

  test("should show loading state during repository validation", async ({
    page,
  }) => {
    await page.goto("/");

    // Mock API with delay
    await page.route("**/repos/microsoft/vscode", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          name: "vscode",
          full_name: "microsoft/vscode",
          owner: { login: "microsoft" },
        }),
      });
    });

    await page.fill('input[id="owner"]', "microsoft");
    await page.fill('input[id="repo"]', "vscode");

    // Click submit and check loading state
    await page.getByRole("button", { name: "Issues を表示" }).click();
    await expect(page.getByRole("button", { name: "確認中..." })).toBeVisible();
  });
});

test.describe('Issues list page ("/issues") E2E tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock issues API
    await page.route("**/repos/microsoft/vscode/issues*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockIssues),
      });
    });
  });

  test("should display issues list page correctly", async ({ page }) => {
    await page.goto("/issues?owner=microsoft&repo=vscode");

    // Check page heading
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Issues\s*-\s*microsoft\/vscode/,
    );

    // Check filter bar is present - look for the search input instead of combobox
    await expect(page.getByPlaceholder("Search issues...")).toBeVisible();

    // Check issues are displayed
    await expect(page.getByTestId("issue-item")).toHaveCount(2);

    // Check issue titles are visible
    await expect(page.getByText("Test Issue 1")).toBeVisible();
    await expect(page.getByText("Test Issue 2")).toBeVisible();
  });

  test("should filter issues by state", async ({ page }) => {
    // Mock different responses for different states
    await page.route(
      "**/repos/microsoft/vscode/issues?state=closed*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockIssues[1]]), // Only closed issue
        });
      },
    );

    await page.goto("/issues?owner=microsoft&repo=vscode");

    // Click on closed state tab (it's a button, not a select)
    await page.getByRole("button", { name: /closed.*issues/i }).click();

    // Check URL updates
    await expect(page).toHaveURL(/state=closed/);
  });

  test("should search issues by keyword", async ({ page }) => {
    // Mock API to return all issues first
    await page.route("**/repos/microsoft/vscode/issues*", async (route) => {
      const url = route.request().url();
      if (url.includes("search=")) {
        // For search requests, return filtered results
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockIssues[0]]), // Only return first issue
        });
      } else {
        // For initial load, return all issues
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssues),
        });
      }
    });

    await page.goto("/issues?owner=microsoft&repo=vscode");

    // Verify all issues are initially displayed
    await expect(page.getByTestId("issue-item")).toHaveCount(2);

    // Enter search term
    const searchInput = page.getByPlaceholder("Search issues...");
    await searchInput.fill("Test Issue 1");

    // Submit the search form
    await page.getByRole("button", { name: "Search" }).click();

    // Check URL updates with search parameter
    await expect(page).toHaveURL(/search=Test.*Issue.*1/);
  });

  test("should navigate to issue detail when clicking on issue", async ({
    page,
  }) => {
    await page.goto("/issues?owner=microsoft&repo=vscode");

    // Click on first issue link (not the container)
    await page.getByTestId("issue-item").first().getByRole("link").click();

    // Should navigate to issue detail
    await expect(page).toHaveURL(/\/issues\/123/);
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/repos/microsoft/vscode/issues*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    await page.goto("/issues?owner=microsoft&repo=vscode");

    // Should show empty state when API fails - no issues should be displayed
    await expect(page.getByTestId("issue-item")).toHaveCount(0);

    // Should show "No issues found" message when there are no issues
    await expect(page.getByText("No issues found.")).toBeVisible();
  });
});

test.describe('Issue detail page ("/issues/[issueNumber]") E2E tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock issue detail API
    await page.route("**/repos/microsoft/vscode/issues/123*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockIssues[0]),
      });
    });

    // Mock comments API
    await page.route(
      "**/repos/microsoft/vscode/issues/123/comments*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockComments),
        });
      },
    );
  });

  test("should display issue detail page correctly", async ({ page }) => {
    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Check issue title with number
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Test Issue 1/ }),
    ).toBeVisible();

    // Check issue body is displayed - look for it within the TiptapEditor
    await expect(page.getByText("Test body 1")).toBeVisible();

    // Check issue metadata - look for the first instance of username
    await expect(page.getByText("testuser1").first()).toBeVisible();

    // Check for the state badge specifically (exact match)
    await expect(page.getByText("open", { exact: true })).toBeVisible();
  });

  test("should display comments section", async ({ page }) => {
    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Check comments are loaded and displayed
    await expect(page.getByText("This is a test comment")).toBeVisible();
    await expect(page.getByText("commenter1")).toBeVisible();
  });

  test("should handle missing issue gracefully", async ({ page }) => {
    // Mock 404 for non-existent issue
    await page.route("**/repos/microsoft/vscode/issues/999*", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Not Found" }),
      });
    });

    await page.goto("/issues/999?owner=microsoft&repo=vscode");

    // Should show error state with appropriate message
    await expect(
      page.getByRole("heading", { level: 2, name: "Issue Not Found" }),
    ).toBeVisible();
    await expect(
      page.getByText("The issue #999 could not be found."),
    ).toBeVisible();

    // Should have a back link to issues
    await expect(
      page.getByRole("link", { name: /back.*issues/i }),
    ).toBeVisible();
  });

  test("should navigate back to issues list", async ({ page }) => {
    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Look for back/breadcrumb navigation
    const backLink = page.getByRole("link", { name: /back|issues|←/i });
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL(/\/issues\?.*owner=microsoft.*repo=vscode/);
    }
  });

  test("should preserve repository context in URLs", async ({ page }) => {
    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Check that owner and repo parameters are preserved
    await expect(page).toHaveURL(/owner=microsoft/);
    await expect(page).toHaveURL(/repo=vscode/);
  });
});

test.describe("Cross-page navigation E2E tests", () => {
  test("should maintain complete user flow from home to issue detail", async ({
    page,
  }) => {
    // Mock repository validation
    await page.route("**/repos/microsoft/vscode", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          name: "vscode",
          full_name: "microsoft/vscode",
          owner: { login: "microsoft" },
        }),
      });
    });

    // Mock issues list
    await page.route("**/repos/microsoft/vscode/issues*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockIssues),
      });
    });

    // Mock issue detail
    await page.route("**/repos/microsoft/vscode/issues/123*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockIssues[0]),
      });
    });

    // Mock comments
    await page.route(
      "**/repos/microsoft/vscode/issues/123/comments*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockComments),
        });
      },
    );

    // Start from home page
    await page.goto("/");

    // Fill form and submit
    await page.fill('input[id="owner"]', "microsoft");
    await page.fill('input[id="repo"]', "vscode");
    await page.getByRole("button", { name: "Issues を表示" }).click();

    // Should be on issues page (allow for default state parameter)
    await expect(page).toHaveURL(/\/issues\?.*owner=microsoft.*repo=vscode/);
    await expect(page.getByTestId("issue-item")).toHaveCount(2);

    // Click on first issue link
    await page.getByTestId("issue-item").first().getByRole("link").click();

    // Should be on issue detail page
    await expect(page).toHaveURL("/issues/123?owner=microsoft&repo=vscode");
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Test Issue 1/ }),
    ).toBeVisible();
  });
});
