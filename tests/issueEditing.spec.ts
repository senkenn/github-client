import { expect, test } from "@playwright/test";

// 共有モックデータ
const mockIssue = {
  id: 999,
  number: 123,
  title: "Editable Issue",
  body: "Original issue body",
  state: "open" as const,
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-10T10:00:00Z",
  user: { login: "author", avatar_url: "https://example.com/author.png" },
  comments: 1,
};

const mockComment = {
  id: 1,
  body: "Original comment body",
  created_at: "2024-01-10T11:00:00Z",
  updated_at: "2024-01-10T11:00:00Z",
  user: { login: "commenter", avatar_url: "https://example.com/commenter.png" },
};

test.describe("Issue editing (E2E)", () => {
  test("can edit issue body", async ({ page }) => {
    // GET + PATCH issue
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123(\?.*)?$/,
      async (route) => {
        if (route.request().method() === "PATCH") {
          const json = JSON.parse(route.request().postData() || "{}");
          expect(json.body).toBe("Updated issue body");
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

    // GET comments (no edit)
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockComment]),
        });
      },
    );

    await page.goto("/issues/123?owner=microsoft&repo=vscode");
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Editable Issue/ }),
    ).toBeVisible();

    const issueEditor = page.getByTestId("tiptap-editor").first();
    await issueEditor.getByRole("button", { name: "編集を開始" }).click();
    const content = issueEditor.locator(".ProseMirror");
    await content.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await page.keyboard.type("Updated issue body");
    await issueEditor.getByRole("button", { name: "Save" }).click();
    await expect(content).toContainText("Updated issue body");
  });

  test("can edit a comment", async ({ page }) => {
    // GET issue (no patch expected here)
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssue),
        });
      },
    );

    // GET comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockComment]),
        });
      },
    );

    // PATCH comment
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/comments\/1(\?.*)?$/,
      async (route) => {
        const json = JSON.parse(route.request().postData() || "{}");
        expect(json.body).toBe("Updated comment body");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...mockComment,
            body: json.body,
            updated_at: new Date().toISOString(),
          }),
        });
      },
    );

    await page.goto("/issues/123?owner=microsoft&repo=vscode");
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Editable Issue/ }),
    ).toBeVisible();

    const editors = page.getByTestId("tiptap-editor");
    const commentEditor = editors.nth(1);
    await commentEditor.getByRole("button", { name: "編集を開始" }).click();
    const content = commentEditor.locator(".ProseMirror");
    await content.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await page.keyboard.type("Updated comment body");
    await commentEditor.getByRole("button", { name: "Save" }).click();
    await expect(content).toContainText("Updated comment body");
  });

  test("can insert and edit tables", async ({ page }) => {
    // GET issue (no patch expected here)
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIssue),
        });
      },
    );

    // GET comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockComment]),
        });
      },
    );

    await page.goto("/issues/123?owner=microsoft&repo=vscode");
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Editable Issue/ }),
    ).toBeVisible();

    const issueEditor = page.getByTestId("tiptap-editor").first();
    await issueEditor.getByRole("button", { name: "編集を開始" }).click();

    // Click the Table button to insert a table
    await issueEditor.getByRole("button", { name: "Table" }).click();

    // Wait for table to be inserted
    await page.waitForTimeout(500);

    // Wait for table to be inserted by waiting for the table element to be visible
    const content = issueEditor.locator(".ProseMirror");
    await expect(content.locator("table")).toBeVisible();

    // Verify table has 3 rows and 3 columns (default)
    await expect(content.locator("table tr")).toHaveCount(3);
    await expect(content.locator("table tr").first().locator("th")).toHaveCount(
      3,
    );

    // Click on a table cell to focus the table and activate table controls
    const firstHeaderCell = content.locator("table th").first();
    await firstHeaderCell.click();

    // Wait for table controls to appear
    await expect(
      issueEditor.getByRole("button", { name: "+Row" }),
    ).toBeVisible();

    // Check that table manipulation buttons appear after focusing the table
    await expect(
      issueEditor.getByRole("button", { name: "+Row" }),
    ).toBeVisible();
    await expect(
      issueEditor.getByRole("button", { name: "+Col" }),
    ).toBeVisible();
    await expect(
      issueEditor.getByRole("button", { name: "×Table" }),
    ).toBeVisible();

    // Test adding a row
    await issueEditor.getByRole("button", { name: "+Row" }).click();
    await expect(content.locator("table tr")).toHaveCount(4);

    // Test adding a column
    await issueEditor.getByRole("button", { name: "+Col" }).click();
    await expect(content.locator("table tr").first().locator("th")).toHaveCount(
      4,
    );

    // Test editing table content
    const editCell = content.locator("table th").first();
    await editCell.click();
    await page.keyboard.type("Header 1");
    await expect(editCell).toContainText("Header 1");

    // Test deleting table
    await issueEditor.getByRole("button", { name: "×Table" }).click();
    await expect(content.locator("table")).not.toBeVisible();
  });

  test("can save table content correctly", async ({ page }) => {
    let savedContent = "";

    // Mock GET issue
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123(\?.*)?$/,
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

    // GET comments
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([mockComment]),
        });
      },
    );

    await page.goto("/issues/123?owner=microsoft&repo=vscode");
    await expect(
      page.getByRole("heading", { level: 1, name: /#123\s+Editable Issue/ }),
    ).toBeVisible();

    const issueEditor = page.getByTestId("tiptap-editor").first();
    await issueEditor.getByRole("button", { name: "編集を開始" }).click();

    // Clear existing content
    const content = issueEditor.locator(".ProseMirror");
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");

    // Insert table
    await issueEditor.getByRole("button", { name: "Table" }).click();

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

    // Save the content
    await issueEditor.getByRole("button", { name: "Save" }).click();

    // Wait for the save request to complete
    await page.waitForResponse((response) =>
      response.url().includes("/api/issues/") &&
      response.request().method() === "PATCH"
    );

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
