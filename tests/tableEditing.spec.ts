import { expect, test } from "@playwright/test";

// 共有モックデータ
const mockIssue = {
  id: 999,
  number: 1,
  title: "Test Issue",
  body: "Original issue body",
  state: "open" as const,
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-10T10:00:00Z",
  user: { login: "author", avatar_url: "https://example.com/author.png" },
  comments: 0,
};

test.describe("Table Editing Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Mock repository check
    await page.route("**/repos/testowner/testrepo", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          name: "testrepo",
          full_name: "testowner/testrepo",
        }),
      });
    });

    // Mock issues list
    await page.route("**/repos/testowner/testrepo/issues*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/");
    // Fill in owner and repo to navigate to issues page
    await page.fill('input[id="owner"]', "testowner");
    await page.fill('input[id="repo"]', "testrepo");
    await page.getByRole("button", { name: "Issues を表示" }).click();
    await page.waitForURL("**/issues**");
  });

  test("should show table editing buttons when table is active", async ({
    page,
  }) => {
    // Mock API for issue detail
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssue),
        });
      },
    );

    // Mock API for comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    // Navigate to a mock issue detail page with proper owner and repo parameters
    await page.goto("/issues/1?owner=testowner&repo=testrepo");

    // Wait for the editor to load
    await page.waitForSelector('[data-testid="tiptap-editor"]', {
      timeout: 10000,
    });

    // Click to start editing using the same pattern as issueEditing.spec.ts
    const editor = page.getByTestId("tiptap-editor");
    await editor.getByRole("button", { name: "編集を開始" }).click();

    // Wait for edit mode to activate
    await page.waitForSelector('button:has-text("Table")', { timeout: 5000 });

    // Insert a table
    await page.click('button:has-text("Table")');

    // Wait for table to be inserted and table buttons to appear
    await page.waitForSelector('button:has-text("+Row")', { timeout: 5000 });

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
    // Mock API for issue detail
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssue),
        });
      },
    );

    // Mock API for comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    // Navigate to a mock issue detail page with proper owner and repo parameters
    await page.goto("/issues/1?owner=testowner&repo=testrepo");

    // Wait for the editor to load
    await page.waitForSelector('[data-testid="tiptap-editor"]', {
      timeout: 10000,
    });

    // Click to start editing using the same pattern as issueEditing.spec.ts
    const editor = page.getByTestId("tiptap-editor");
    await editor.getByRole("button", { name: "編集を開始" }).click();

    // Wait for edit mode to activate
    await page.waitForSelector('button:has-text("Table")', { timeout: 5000 });

    // Insert a table
    await page.click('button:has-text("Table")');

    // Wait for table to be inserted and table buttons to appear
    await page.waitForSelector('button:has-text("-Row")', { timeout: 5000 });

    // Check that delete buttons have orange styling
    const deleteRowButton = page.locator('button:has-text("-Row")');
    const deleteColButton = page.locator('button:has-text("-Col")');

    await expect(deleteRowButton).toHaveClass(/bg-orange-200/);
    await expect(deleteColButton).toHaveClass(/bg-orange-200/);
  });

  test("should allow detailed table operations", async ({ page }) => {
    // Mock API for issue detail
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssue),
        });
      },
    );

    // Mock API for comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto("/issues/1?owner=testowner&repo=testrepo");

    // Wait for the editor to load
    await page.waitForSelector('[data-testid="tiptap-editor"]', {
      timeout: 10000,
    });

    const editor = page.getByTestId("tiptap-editor");
    await editor.getByRole("button", { name: "編集を開始" }).click();

    // Insert a table
    await page.waitForSelector('button:has-text("Table")', { timeout: 5000 });
    await page.click('button:has-text("Table")');

    const content = editor.locator(".ProseMirror");
    await expect(content.locator("table")).toBeVisible();

    // Click on a table cell to focus the table and activate table controls
    const firstHeaderCell = content.locator("table th").first();
    await firstHeaderCell.click();

    // Wait for table controls to appear with longer timeout
    await page.waitForSelector('button:has-text("+Row")', { timeout: 10000 });

    // Test adding a row
    await page.click('button:has-text("+Row")');
    await expect(content.locator("table tr")).toHaveCount(4);

    // Test adding a column
    await page.click('button:has-text("+Col")');
    await expect(content.locator("table tr").first().locator("th")).toHaveCount(
      4,
    );

    // Test editing table content - use a simpler approach
    const editCell = content.locator("table th").first();
    await editCell.click({ clickCount: 2 }); // Double click to select
    await page.keyboard.type("Header 1");
    // Wait a moment for the text to be processed
    await page.waitForTimeout(500);

    // Verify that table still exists after editing attempt
    await expect(content.locator("table")).toBeVisible();

    // Test deleting a row (should go from 4 rows back to 3)
    const rowCountBeforeDelete = await content.locator("table tr").count();
    await page.click('button:has-text("-Row")');
    await expect(content.locator("table tr")).toHaveCount(
      rowCountBeforeDelete - 1,
    );

    // Test deleting a column - check both th and td elements as headers might have changed
    const headerCount = await content
      .locator("table tr")
      .first()
      .locator("th")
      .count();
    const dataCount = await content
      .locator("table tr")
      .first()
      .locator("td")
      .count();
    const totalColCount = headerCount > 0 ? headerCount : dataCount;

    await page.click('button:has-text("-Col")');

    // Verify column deletion by checking total cell count in first row
    const newHeaderCount = await content
      .locator("table tr")
      .first()
      .locator("th")
      .count();
    const newDataCount = await content
      .locator("table tr")
      .first()
      .locator("td")
      .count();
    const newTotalColCount = newHeaderCount > 0 ? newHeaderCount : newDataCount;

    expect(newTotalColCount).toBe(totalColCount - 1);

    // Test deleting table
    await page.click('button:has-text("×Table")');
    await expect(content.locator("table")).not.toBeVisible();
  });

  test("should save table content correctly", async ({ page }) => {
    let savedContent = "";

    // Mock API for issue detail with PATCH handling
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1(\?.*)?$/,
      async (route) => {
        if (route.request().method() === "PATCH") {
          const json = JSON.parse(route.request().postData() || "{}");
          savedContent = json.body;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ...mockIssue,
              body: json.body,
              updated_at: new Date().toISOString(),
            }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssue),
        });
      },
    );

    // Mock API for comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/1\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto("/issues/1?owner=testowner&repo=testrepo");

    // Wait for the editor to load
    await page.waitForSelector('[data-testid="tiptap-editor"]', {
      timeout: 10000,
    });

    const editor = page.getByTestId("tiptap-editor");
    await editor.getByRole("button", { name: "編集を開始" }).click();

    // Clear existing content
    const content = editor.locator(".ProseMirror");
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");

    // Insert table
    await page.waitForSelector('button:has-text("Table")', { timeout: 5000 });
    await page.click('button:has-text("Table")');

    // Fill in table content
    const firstHeaderCell = content.locator("table th").first();
    await firstHeaderCell.click();
    await page.keyboard.type("Product");

    const secondHeaderCell = content.locator("table th").nth(1);
    await secondHeaderCell.click();
    await page.keyboard.type("Price");

    const thirdHeaderCell = content.locator("table th").nth(2);
    await thirdHeaderCell.click();
    await page.keyboard.type("Stock");

    // Fill first data row
    const firstDataCell = content.locator("table td").first();
    await firstDataCell.click();
    await page.keyboard.type("Laptop");

    const secondDataCell = content.locator("table td").nth(1);
    await secondDataCell.click();
    await page.keyboard.type("$999");

    const thirdDataCell = content.locator("table td").nth(2);
    await thirdDataCell.click();
    await page.keyboard.type("50");

    // Fill second data row
    const fourthDataCell = content.locator("table td").nth(3);
    await fourthDataCell.click();
    await page.keyboard.type("Mouse");

    const fifthDataCell = content.locator("table td").nth(4);
    await fifthDataCell.click();
    await page.keyboard.type("$25");

    const sixthDataCell = content.locator("table td").nth(5);
    await sixthDataCell.click();
    await page.keyboard.type("100");

    // Wait for the save request to complete
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("repos/testowner/testrepo/issues/1") &&
        response.request().method() === "PATCH",
      { timeout: 10000 }, // Increase timeout to 10 seconds
    );

    // Save the content
    await editor.getByRole("button", { name: "Save" }).click();

    await responsePromise;

    // Verify the saved content contains proper markdown table
    expect(savedContent).toContain("| Product | Price | Stock |");
    expect(savedContent).toContain("| --- | --- | --- |");
    expect(savedContent).toContain("| Laptop | $999 | 50 |");
    expect(savedContent).toContain("| Mouse | $25 | 100 |");

    // Verify the table structure is preserved
    const lines = savedContent.split("\n");
    const tableLines = lines.filter((line) => line.includes("|"));
    expect(tableLines).toHaveLength(4); // header + separator + 2 data rows
  });
});
