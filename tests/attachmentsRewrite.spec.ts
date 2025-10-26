import { expect, test } from "@playwright/test";

const owner = "testowner";
const repo = "testrepo";
const issueNumber = 101;

test.describe("GitHub attachment URL handling", () => {
  test("rewrites GitHub attachment <img> to proxied URL with download=1", async ({
    page,
  }) => {
    const attachment =
      "https://github.com/user-attachments/assets/dceb430a-7e82-42b0-83e9-b623d15b32b0";

    // Mock GET issue with an attachment image in the body
    await page.route(
      new RegExp(
        `https://api\\.github\\.com/repos/.+/.+/issues/${issueNumber}(\\?.*)?$`,
      ),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            number: issueNumber,
            title: "Attachment test",
            body: `![img](${attachment})`,
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "me", avatar_url: "https://example.com/a.png" },
            comments: 0,
          }),
        });
      },
    );

    // Mock GET comments (empty)
    await page.route(
      new RegExp(
        `https://api\\.github\\.com/repos/.+/.+/issues/${issueNumber}/comments(\\?.*)?$`,
      ),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto(`/issues/${issueNumber}?owner=${owner}&repo=${repo}`);

    // The editor renders a NodeView with <span data-type="github-image"><img .../></span>
    const img = page.locator('span[data-type="github-image"] img');
    await expect(img).toHaveCount(1);

    const src = await img.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src!.startsWith("/api/pw-fetch?url=")).toBe(true);
    // The target URL is URL-encoded; check it contains the original and download=1
    expect(
      decodeURIComponent(src!.replace("/api/pw-fetch?url=", "")),
    ).toContain(attachment);
    expect(decodeURIComponent(src!)).toContain("download=1");
  });

  test("does not rewrite non-GitHub images", async ({ page }) => {
    const external = "https://example.com/image.png";

    await page.route(
      new RegExp(
        `https://api\\.github\\.com/repos/.+/.+/issues/${issueNumber}(\\?.*)?$`,
      ),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 1,
            number: issueNumber,
            title: "External image test",
            body: `![img](${external})`,
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "me", avatar_url: "https://example.com/a.png" },
            comments: 0,
          }),
        });
      },
    );

    await page.route(
      new RegExp(
        `https://api\\.github\\.com/repos/.+/.+/issues/${issueNumber}/comments(\\?.*)?$`,
      ),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto(`/issues/${issueNumber}?owner=${owner}&repo=${repo}`);

    const img = page.locator('span[data-type="github-image"] img');
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute("src", external);
    const src = await img.getAttribute("src");
    expect(src).toBe(external);
    expect(src!.startsWith("/api/pw-fetch")).toBe(false);
  });

  test("pw-fetch rejects non-github host", async ({ page }) => {
    const resp = await page.request.get(
      "/api/pw-fetch?url=" + encodeURIComponent("https://example.com/a.png"),
    );
    expect(resp.status()).toBe(400);
    expect(await resp.text()).toContain("Only github.com is allowed");
  });
});
