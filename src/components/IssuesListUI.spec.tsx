import { expect, test } from "@playwright/experimental-ct-react";
import type { GitHubIssue } from "../types/github";
import { IssuesListUI } from "./IssuesListUI";

// Mock data for testing
const mockIssues: GitHubIssue[] = [
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

test("should match visual snapshot", async ({ mount }) => {
  const component = await mount(<IssuesListUI issues={mockIssues} />);

  // Wait for component to render with provided data
  await expect(
    component.locator('[data-testid="issue-item"]').first(),
  ).toBeVisible({ timeout: 5000 });

  await expect(component).toHaveScreenshot("issues-list.png");
});

test("should render empty state when no issues provided", async ({ mount }) => {
  const component = await mount(<IssuesListUI issues={[]} />);

  await expect(component.getByText("No issues found.")).toBeVisible();
});
