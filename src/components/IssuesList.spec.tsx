import { expect, test } from "@playwright/experimental-ct-react";
import { IssuesList } from "./IssuesList";

test("should match visual snapshot", async ({ mount }) => {
  const component = await mount(
    <div
      style={{
        width: "800px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <IssuesList owner="dummy_owner" repo="dummy_repo" />
    </div>,
  );

  // モックサーバーからデータが読み込まれるまで待機
  await expect(
    component.locator('[data-testid="issue-item"]').first(),
  ).toBeVisible({ timeout: 10000 });

  await expect(component).toHaveScreenshot("issues-list.png");
});
