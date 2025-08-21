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
    // With auto-edit mode, no need to click "編集を開始" button
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
    // With auto-edit mode, no need to click "編集を開始" button
    const content = commentEditor.locator(".ProseMirror");
    await content.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await page.keyboard.type("Updated comment body");
    await commentEditor.getByRole("button", { name: "Save" }).click();
    await expect(content).toContainText("Updated comment body");
  });

  test("save button is disabled when no changes are made", async ({ page }) => {
    // GET issue
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
    const saveButton = issueEditor.getByRole("button", { name: "Save" });

    // Save button should be disabled initially when no changes
    await expect(saveButton).toBeDisabled();
  });

  test("save button is enabled when content changes", async ({ page }) => {
    // GET issue
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
    const saveButton = issueEditor.getByRole("button", { name: "Save" });
    const content = issueEditor.locator(".ProseMirror");

    // Save button should be disabled initially
    await expect(saveButton).toBeDisabled();

    // Make a change to the content
    await content.click();
    await page.keyboard.type(" - modified");

    // Save button should now be enabled
    await expect(saveButton).toBeEnabled();
  });
});
