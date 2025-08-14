import { expect, test } from "@playwright/test";

/**
 * E2E tests for IssuesList component functionality:
 * - Testing the fix for infinite loading when owner/repo parameters are missing
 * - Testing proper error messaging for missing parameters
 * - Testing successful issues loading with valid parameters
 */

test.describe("IssuesList component E2E tests", () => {
  test.describe("Missing owner/repo parameters", () => {
    test("should show guidance message when only state parameter is provided", async ({
      page,
    }) => {
      // Navigate to issues page with only state parameter (no owner/repo)
      await page.goto("/issues?state=open");

      // Check that the page loads (no infinite loading)
      await expect(page.getByRole("heading", { name: "Issues" })).toBeVisible();

      // Check that guidance message is displayed
      await expect(
        page.getByText(
          "Please specify the repository owner and name in the URL parameters.",
        ),
      ).toBeVisible();

      // Check that example URL is shown
      await expect(
        page.getByText("Example: /issues?owner=facebook&repo=react&state=open"),
      ).toBeVisible();

      // Ensure no loading spinner is shown (infinite loading fix)
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).not.toBeVisible();
    });

    test("should show guidance message when no parameters are provided", async ({
      page,
    }) => {
      // Navigate to issues page with no parameters
      await page.goto("/issues");

      // Check that the page loads
      await expect(page.getByRole("heading", { name: "Issues" })).toBeVisible();

      // Check that guidance message is displayed
      await expect(
        page.getByText(
          "Please specify the repository owner and name in the URL parameters.",
        ),
      ).toBeVisible();

      // Ensure no loading spinner is shown
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).not.toBeVisible();
    });

    test("should show guidance message when only owner parameter is provided", async ({
      page,
    }) => {
      // Navigate to issues page with only owner parameter
      await page.goto("/issues?owner=facebook");

      // Check that guidance message is displayed
      await expect(
        page.getByText(
          "Please specify the repository owner and name in the URL parameters.",
        ),
      ).toBeVisible();

      // Ensure no loading spinner is shown
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).not.toBeVisible();
    });

    test("should show guidance message when only repo parameter is provided", async ({
      page,
    }) => {
      // Navigate to issues page with only repo parameter
      await page.goto("/issues?repo=react");

      // Check that guidance message is displayed
      await expect(
        page.getByText(
          "Please specify the repository owner and name in the URL parameters.",
        ),
      ).toBeVisible();

      // Ensure no loading spinner is shown
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).not.toBeVisible();
    });
  });

  test.describe("Valid owner/repo parameters", () => {
    const mockIssues = [
      {
        id: 1,
        number: 123,
        title: "Test Issue 1",
        body: "Test body 1",
        state: "open",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        user: {
          login: "testuser1",
          avatar_url: "https://example.com/avatar1.png",
        },
        comments: 0,
      },
      {
        id: 2,
        number: 124,
        title: "Test Issue 2",
        body: "Test body 2",
        state: "open",
        created_at: "2024-01-14T08:15:30Z",
        updated_at: "2024-01-14T08:15:30Z",
        user: {
          login: "testuser2",
          avatar_url: "https://example.com/avatar2.png",
        },
        comments: 2,
      },
    ];

    test("should successfully load and display issues with valid parameters", async ({
      page,
    }) => {
      // Mock GitHub API response
      await page.route("**/repos/facebook/react/issues*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssues),
        });
      });

      // Navigate to issues page with valid owner/repo parameters
      await page.goto("/issues?owner=facebook&repo=react&state=open");

      // Check that the page heading includes the repository name
      await expect(
        page.getByRole("heading", { name: "Issues - facebook/react" }),
      ).toBeVisible();

      // Wait for loading to complete and issues to be displayed
      await expect(
        page.locator('[data-testid="issue-item"]').first(),
      ).toBeVisible();

      // Check that the correct number of issues are displayed
      await expect(page.locator('[data-testid="issue-item"]')).toHaveCount(2);

      // Check issue details
      await expect(page.getByText("#123 Test Issue 1")).toBeVisible();
      await expect(page.getByText("#124 Test Issue 2")).toBeVisible();
      await expect(page.getByText("testuser1")).toBeVisible();
      await expect(page.getByText("testuser2")).toBeVisible();

      // Ensure no guidance message is shown
      await expect(
        page.getByText(
          "Please specify the repository owner and name in the URL parameters.",
        ),
      ).not.toBeVisible();
    });

    test("should show loading spinner initially then display issues", async ({
      page,
    }) => {
      // Add a delay to the mock response to test loading state
      await page.route("**/repos/facebook/react/issues*", async (route) => {
        // Delay response to test loading state
        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssues),
        });
      });

      // Navigate to issues page
      await page.goto("/issues?owner=facebook&repo=react&state=open");

      // Check that loading spinner appears initially
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).toBeVisible();

      // Wait for loading to complete and issues to be displayed
      await expect(
        page.locator('[data-testid="issue-item"]').first(),
      ).toBeVisible();

      // Check that loading spinner disappears
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).not.toBeVisible();
    });

    test("should handle API errors gracefully", async ({ page }) => {
      // Mock GitHub API to return an error
      await page.route("**/repos/facebook/react/issues*", async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "Not Found" }),
        });
      });

      // Navigate to issues page
      await page.goto("/issues?owner=facebook&repo=react&state=open");

      // Wait for error handling to complete by waiting for the error message
      await expect(page.getByText("No issues found.")).toBeVisible();

      // Check that loading spinner is not shown after error
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).not.toBeVisible();

      // Check that no issues message is displayed
      await expect(page.getByText("No issues found.")).toBeVisible();
    });

    test("should display 'No issues found' when repository has no issues", async ({
      page,
    }) => {
      // Mock GitHub API to return empty array
      await page.route("**/repos/facebook/react/issues*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });

      // Navigate to issues page
      await page.goto("/issues?owner=facebook&repo=react&state=open");

      // Check that "No issues found" message is displayed
      await expect(page.getByText("No issues found.")).toBeVisible();

      // Ensure no loading spinner is shown
      await expect(
        page.locator('[data-testid="loading-spinner"]'),
      ).not.toBeVisible();
    });
  });

  test.describe("Filter functionality", () => {
    test("should update issues when state filter changes", async ({ page }) => {
      const openIssues = [
        {
          id: 1,
          number: 123,
          title: "Open Issue",
          body: "Open issue body",
          state: "open",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          user: {
            login: "testuser1",
            avatar_url: "https://example.com/avatar1.png",
          },
          comments: 0,
        },
      ];

      const closedIssues = [
        {
          id: 2,
          number: 124,
          title: "Closed Issue",
          body: "Closed issue body",
          state: "closed",
          created_at: "2024-01-14T08:15:30Z",
          updated_at: "2024-01-14T08:15:30Z",
          user: {
            login: "testuser2",
            avatar_url: "https://example.com/avatar2.png",
          },
          comments: 2,
        },
      ];

      // Mock open issues response
      await page.route(
        "**/repos/facebook/react/issues?state=open*",
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(openIssues),
          });
        },
      );

      // Mock closed issues response
      await page.route(
        "**/repos/facebook/react/issues?state=closed*",
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(closedIssues),
          });
        },
      );

      // Start with open issues
      await page.goto("/issues?owner=facebook&repo=react&state=open");

      // Wait for open issues to load
      await expect(page.getByText("#123 Open Issue")).toBeVisible();

      // Click on "Closed Issues" button
      await page.getByRole("button", { name: "Closed Issues" }).click();

      // Wait for URL to change and closed issues to load
      await expect(page).toHaveURL(
        "/issues?owner=facebook&repo=react&state=closed",
      );
      await expect(page.getByText("#124 Closed Issue")).toBeVisible();

      // Ensure open issue is no longer visible
      await expect(page.getByText("#123 Open Issue")).not.toBeVisible();
    });
  });
});
