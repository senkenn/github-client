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
  test("should save owner and repo values to localStorage as user types", async ({
    page,
  }) => {
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

  test("should restore values from localStorage after page reload", async ({
    page,
  }) => {
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

  test("should update localStorage when form values change", async ({
    page,
  }) => {
    await page.goto("/");

    // Clear localStorage before test
    await page.evaluate(() => localStorage.clear());

    // Fill initial values
    await page.fill('input[id="owner"]', "initial-owner");
    await page.fill('input[id="repo"]', "initial-repo");

    // Verify initial values are stored
    let storedOwner = await page.evaluate(() =>
      localStorage.getItem("github_owner"),
    );
    let storedRepo = await page.evaluate(() =>
      localStorage.getItem("github_repo"),
    );

    expect(storedOwner).toBe("initial-owner");
    expect(storedRepo).toBe("initial-repo");

    // Update the values
    await page.fill('input[id="owner"]', "updated-owner");
    await page.fill('input[id="repo"]', "updated-repo");

    // Verify updated values are stored
    storedOwner = await page.evaluate(() =>
      localStorage.getItem("github_owner"),
    );
    storedRepo = await page.evaluate(() => localStorage.getItem("github_repo"));

    expect(storedOwner).toBe("updated-owner");
    expect(storedRepo).toBe("updated-repo");
  });

  test("should handle empty localStorage gracefully on initial load", async ({
    page,
  }) => {
    await page.goto("/");

    // Ensure localStorage is empty
    await page.evaluate(() => localStorage.clear());

    // Reload to ensure clean state
    await page.reload();

    // Verify that form inputs are empty when no localStorage values exist
    const ownerValue = await page.inputValue('input[id="owner"]');
    const repoValue = await page.inputValue('input[id="repo"]');

    expect(ownerValue).toBe("");
    expect(repoValue).toBe("");
  });

  test("should pre-populate form with existing localStorage values", async ({
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

  test("should persist values when typing character by character", async ({
    page,
  }) => {
    await page.goto("/");

    // Clear localStorage before test
    await page.evaluate(() => localStorage.clear());

    const ownerInput = page.locator('input[id="owner"]');
    const repoInput = page.locator('input[id="repo"]');

    // Type values character by character to simulate real user input
    await ownerInput.type("google");
    await repoInput.type("chrome");

    // Wait a moment for the useEffect to trigger
    await page.waitForTimeout(200);

    // Verify localStorage is updated
    const storedValues = await page.evaluate(() => ({
      owner: localStorage.getItem("github_owner"),
      repo: localStorage.getItem("github_repo"),
    }));

    expect(storedValues.owner).toBe("google");
    expect(storedValues.repo).toBe("chrome");
  });

  test("should maintain localStorage values across browser sessions simulation", async ({
    page,
  }) => {
    await page.goto("/");

    // Clear localStorage before test
    await page.evaluate(() => localStorage.clear());

    // Simulate user entering repository information
    await page.fill('input[id="owner"]', "apple");
    await page.fill('input[id="repo"]', "swift");

    // Simulate closing and reopening the browser by clearing page context
    // but keeping localStorage (which would persist in real browser)
    const storageState = await page.evaluate(() => ({
      owner: localStorage.getItem("github_owner"),
      repo: localStorage.getItem("github_repo"),
    }));

    // Navigate away and back (simulating navigation)
    await page.goto("about:blank");
    await page.goto("/");

    // Set the localStorage values back (simulating browser persistence)
    await page.evaluate((state) => {
      localStorage.setItem("github_owner", state.owner || "");
      localStorage.setItem("github_repo", state.repo || "");
    }, storageState);

    // Reload to trigger the localStorage load effect
    await page.reload();

    // Verify values are restored
    const ownerValue = await page.inputValue('input[id="owner"]');
    const repoValue = await page.inputValue('input[id="repo"]');

    expect(ownerValue).toBe("apple");
    expect(repoValue).toBe("swift");
  });
});
