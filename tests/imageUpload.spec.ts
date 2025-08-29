import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 共有モックデータ
const mockIssue = {
  id: 999,
  number: 123,
  title: "Test Issue for Image Upload",
  body: "Original issue body",
  state: "open" as const,
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-10T10:00:00Z",
  user: { login: "author", avatar_url: "https://example.com/author.png" },
  comments: 0,
};

const mockUser = {
  login: "testuser",
  id: 1,
  avatar_url: "https://example.com/testuser.png",
};

test.describe("Image Upload Functionality (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));
    // Mock GitHub API user authentication
    await page.route("**/api.github.com/user", async (route) => {
      console.log("Intercepted user API call:", route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    // Mock GitHub API repository check - use pattern to catch any user
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/github-client-assets/,
      async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 1,
              name: "github-client-assets",
              full_name: "testuser/github-client-assets",
            }),
          });
        }
      },
    );

    // Mock repository creation
    await page.route("**/api.github.com/user/repos", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            name: "github-client-assets",
            full_name: "testuser/github-client-assets",
            clone_url: "https://github.com/testuser/github-client-assets.git",
            html_url: "https://github.com/testuser/github-client-assets",
          }),
        });
      }
    });

    // Mock GitHub API file upload - use pattern to catch any user
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/github-client-assets\/contents\/images\/.+/,
      async (route) => {
        console.log("Intercepted file upload API call:", route.request().url());
        if (route.request().method() === "PUT") {
          const _requestBody = JSON.parse(route.request().postData() || "{}");
          const fileName = route.request().url().split("/").pop();

          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              content: {
                name: fileName,
                path: `images/${fileName}`,
                sha: "abc123",
                download_url: `https://raw.githubusercontent.com/testuser/github-client-assets/main/images/${fileName}`,
              },
            }),
          });
        }
      },
    );

    // Mock issue API calls
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123(\?.*)?$/,
      async (route) => {
        if (route.request().method() === "PATCH") {
          const json = JSON.parse(route.request().postData() || "{}");
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

    // Mock comments API
    await page.route(
      /https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+\/issues\/123\/comments(\?.*)?$/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );
  });

  test("should upload image via file selection", async ({ page }) => {
    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Wait for the editor to load
    await expect(page.getByTestId("tiptap-editor")).toBeVisible();

    const editor = page.getByTestId("tiptap-editor").first();
    const content = editor.locator(".ProseMirror");

    // Clear existing content
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");

    // Create a test image file
    const testImagePath = path.join(__dirname, "../img/image.png");

    // Set up file chooser promise before clicking the upload button
    const fileChooserPromise = page.waitForEvent("filechooser");

    // Click the image upload button (📷 emoji)
    await editor.getByRole("button", { name: "📷" }).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // Wait for the image to be inserted into the editor
    await expect(content.locator("img")).toBeVisible({ timeout: 20000 });

    // Verify the image has the expected src pattern (GitHub raw URL)
    const uploadedImage = content.locator("img");
    await expect(uploadedImage).toHaveAttribute(
      "src",
      /https:\/\/raw\.githubusercontent\.com\/testuser\/github-client-assets\/main\/images\/\d+-image\.png/,
    );

    // Verify the image has alt text
    await expect(uploadedImage).toHaveAttribute("alt", "image.png");
  });

  test("should upload image via clipboard paste", async ({ page }) => {
    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Wait for the editor to load
    await expect(page.getByTestId("tiptap-editor")).toBeVisible();

    const editor = page.getByTestId("tiptap-editor").first();
    const content = editor.locator(".ProseMirror");

    // Clear existing content and focus on editor
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");

    // Create a test image file and read it as blob
    const testImagePath = path.join(__dirname, "../img/image.png");
    const fs = await import("node:fs/promises");
    const imageBuffer = await fs.readFile(testImagePath);

    // Create a File object from the buffer
    const imageFile = await page.evaluateHandle(
      ([buffer, fileName]) => {
        const uint8Array = new Uint8Array(buffer as number[]);
        return new File([uint8Array], fileName as string, {
          type: "image/png",
        });
      },
      [Array.from(imageBuffer), "pasted-image.png"] as const,
    );

    // Simulate clipboard paste event with image data
    await page.evaluate(
      async ([imageFile]) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(imageFile);

        const pasteEvent = new ClipboardEvent("paste", {
          clipboardData: dataTransfer,
          bubbles: true,
          cancelable: true,
        });

        const editorElement = document.querySelector(".ProseMirror");
        if (editorElement) {
          editorElement.dispatchEvent(pasteEvent);
        }
      },
      [imageFile],
    );

    // Wait for the image to be inserted into the editor
    await expect(content.locator("img")).toBeVisible({ timeout: 20000 });

    // Verify the image has the expected src pattern (GitHub raw URL)
    const pastedImage = content.locator("img");
    await expect(pastedImage).toHaveAttribute(
      "src",
      /https:\/\/raw\.githubusercontent\.com\/testuser\/github-client-assets\/main\/images\/\d+-pasted-image\.png/,
    );

    // Verify the image has alt text with timestamp pattern
    await expect(pastedImage).toHaveAttribute("alt", /pasted-image-\d+/);
  });

  test("should handle upload failure gracefully", async ({ page }) => {
    // Override the user auth mock to simulate failure
    await page.route("**/api.github.com/user", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    });

    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Wait for the editor to load
    await expect(page.getByTestId("tiptap-editor")).toBeVisible();

    const editor = page.getByTestId("tiptap-editor").first();
    const content = editor.locator(".ProseMirror");

    // Clear existing content
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");

    // Create a test image file
    const testImagePath = path.join(__dirname, "../img/image.png");

    // Set up file chooser promise before clicking the upload button
    const fileChooserPromise = page.waitForEvent("filechooser");

    // Click the image upload button (📷 emoji)
    await editor.getByRole("button", { name: "📷" }).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // Wait for the image to be inserted into the editor (should fallback to data URL)
    await expect(content.locator("img")).toBeVisible({ timeout: 20000 });

    // Verify the image uses data URL as fallback
    const fallbackImage = content.locator("img");
    await expect(fallbackImage).toHaveAttribute(
      "src",
      /^data:image\/png;base64,/,
    );

    // Verify the image has alt text
    await expect(fallbackImage).toHaveAttribute("alt", "image.png");
  });

  test("should save content with uploaded image", async ({ page }) => {
    let savedContent = "";

    // Override issue PATCH mock to capture saved content
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

    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Wait for the editor to load
    await expect(page.getByTestId("tiptap-editor")).toBeVisible();

    const editor = page.getByTestId("tiptap-editor").first();
    const content = editor.locator(".ProseMirror");

    // Clear existing content and add some text
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");
    await page.keyboard.type("Here is an uploaded image:");

    // Create a test image file
    const testImagePath = path.join(__dirname, "../img/image.png");

    // Set up file chooser promise before clicking the upload button
    const fileChooserPromise = page.waitForEvent("filechooser");

    // Click the image upload button (📷 emoji)
    await editor.getByRole("button", { name: "📷" }).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // Wait for the image to be inserted into the editor
    await expect(content.locator("img")).toBeVisible({ timeout: 20000 });

    // Wait for the save request to complete
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("repos/microsoft/vscode/issues/123") &&
        response.request().method() === "PATCH",
    );

    // Save the content
    await editor.getByRole("button", { name: "Save" }).click();

    await responsePromise;

    // Verify the saved content contains the image markdown
    expect(savedContent).toContain("Here is an uploaded image:");
    expect(savedContent).toMatch(
      /!\[image\.png\]\(https:\/\/raw\.githubusercontent\.com\/testuser\/github-client-assets\/main\/images\/\d+-image\.png\)/,
    );
  });

  test("should handle multiple image uploads", async ({ page }) => {
    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Wait for the editor to load
    await expect(page.getByTestId("tiptap-editor")).toBeVisible();

    const editor = page.getByTestId("tiptap-editor").first();
    const content = editor.locator(".ProseMirror");

    // Clear existing content
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");

    // Upload first image
    const testImagePath = path.join(__dirname, "../img/image.png");

    let fileChooserPromise = page.waitForEvent("filechooser");
    await editor.getByRole("button", { name: "📷" }).click();
    let fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // Wait for first image to be inserted
    await expect(content.locator("img").first()).toBeVisible({
      timeout: 20000,
    });

    // Add some text between images
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Second image:");
    await page.keyboard.press("Enter");

    // Upload second image
    fileChooserPromise = page.waitForEvent("filechooser");
    await editor.getByRole("button", { name: "📷" }).click();
    fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // Wait for second image to be inserted
    await expect(content.locator("img")).toHaveCount(2, { timeout: 20000 });

    // Verify both images have different filenames (due to timestamp)
    const images = content.locator("img");
    const firstImageSrc = await images.first().getAttribute("src");
    const secondImageSrc = await images.nth(1).getAttribute("src");

    expect(firstImageSrc).not.toBe(secondImageSrc);
    expect(firstImageSrc).toMatch(/\d+-image\.png$/);
    expect(secondImageSrc).toMatch(/\d+-image\.png$/);
  });

  test("should handle repository creation on first upload", async ({
    page,
  }) => {
    // Mock repository not existing initially
    let repoCreated = false;

    await page.route(
      "**/repos/testuser/github-client-assets",
      async (route) => {
        if (route.request().method() === "GET") {
          if (!repoCreated) {
            await route.fulfill({
              status: 404,
              contentType: "application/json",
              body: JSON.stringify({ message: "Not Found" }),
            });
          } else {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                id: 1,
                name: "github-client-assets",
                full_name: "testuser/github-client-assets",
              }),
            });
          }
        }
      },
    );

    // Mock repository creation
    await page.route("**/user/repos", async (route) => {
      if (route.request().method() === "POST") {
        repoCreated = true;
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            name: "github-client-assets",
            full_name: "testuser/github-client-assets",
          }),
        });
      }
    });

    await page.goto("/issues/123?owner=microsoft&repo=vscode");

    // Wait for the editor to load
    await expect(page.getByTestId("tiptap-editor")).toBeVisible();

    const editor = page.getByTestId("tiptap-editor").first();
    const content = editor.locator(".ProseMirror");

    // Clear existing content
    await content.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");

    // Create a test image file
    const testImagePath = path.join(__dirname, "../img/image.png");

    // Set up file chooser promise before clicking the upload button
    const fileChooserPromise = page.waitForEvent("filechooser");

    // Click the image upload button (📷 emoji)
    await editor.getByRole("button", { name: "📷" }).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);

    // Wait for the image to be inserted into the editor
    await expect(content.locator("img")).toBeVisible({ timeout: 20000 });

    // Verify the image was uploaded successfully after repository creation
    const uploadedImage = content.locator("img");
    await expect(uploadedImage).toHaveAttribute(
      "src",
      /https:\/\/raw\.githubusercontent\.com\/testuser\/github-client-assets\/main\/images\/\d+-image\.png/,
    );
  });
});
