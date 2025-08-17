import { expect, test } from "@playwright/test";

// Mock issue data for testing
const mockIssue = {
  id: 999,
  number: 123,
  title: "Test Issue for GitHub Link",
  body: "This is a test issue to verify GitHub link functionality",
  state: "open" as const,
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-10T10:00:00Z",
  user: { login: "testuser", avatar_url: "https://example.com/testuser.png" },
  comments: 0,
};

test.describe("GitHub Link functionality", () => {
  test("issue title links to GitHub issue", async ({ page }) => {
    // Block all external network requests to ensure no GitHub access
    await page.route("**/*", async (route) => {
      const url = route.request().url();

      // Allow localhost requests for the dev server and static assets
      if (url.startsWith("http://localhost:")) {
        await route.continue();
        return;
      }

      // Allow data URLs for fonts and other inline resources
      if (url.startsWith("data:")) {
        await route.continue();
        return;
      }

      // Mock specific API endpoints
      if (
        url.match(
          /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123(\?.*)?$/,
        )
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssue),
        });
        return;
      }

      if (
        url.match(
          /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123\/comments(\?.*)?$/,
        )
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
        return;
      }

      // Block all other external requests including github.com
      await route.abort("blockedbyclient");
    });

    await page.goto("/issues/123?owner=testowner&repo=testrepo");

    // Check that the issue title is displayed
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /#123\s+Test Issue for GitHub Link/,
      }),
    ).toBeVisible();

    // Check that the issue title is a link (but don't access GitHub)
    const githubLink = page.locator(
      'h1 a[href="https://github.com/testowner/testrepo/issues/123"]',
    );
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toContainText("#123 Test Issue for GitHub Link");

    // Verify link attributes
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    // Verify link styling
    await expect(githubLink).toHaveClass(/text-black/);
    await expect(githubLink).toHaveClass(/hover:text-blue-600/);
  });
});
