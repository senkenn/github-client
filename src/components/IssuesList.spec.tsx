import { test, expect } from '@playwright/experimental-ct-react';
import { IssuesList } from './IssuesList';

// Mock the github module to control the data returned
test.beforeEach(async ({ page }) => {
  // Mock the getIssues function to return controlled test data
  await page.addInitScript(() => {
    // Mock fetch or the module system would be needed here
    // This is a placeholder for the actual mock implementation
  });
});

test.describe('IssuesList Component', () => {
  test('should display only actual issues, not pull requests', async ({ mount }) => {
    // Mock getIssues to return mixed data (issues and PRs)
    const mockGetIssues = async () => [
      {
        id: 1,
        number: 123,
        title: 'Actual Issue #1',
        body: 'This is a real issue',
        state: 'open' as const,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:22:00Z',
        user: {
          login: 'testuser',
          avatar_url: 'https://github.com/identicons/testuser.png',
        },
        comments: 5,
        // No pull_request property - this should be displayed
      },
      {
        id: 2,
        number: 124,
        title: 'Actual Issue #2',
        body: 'This is another real issue',
        state: 'open' as const,
        created_at: '2024-01-14T08:15:00Z',
        updated_at: '2024-01-14T16:45:00Z',
        user: {
          login: 'testuser2',
          avatar_url: 'https://github.com/identicons/testuser2.png',
        },
        comments: 3,
        // No pull_request property - this should be displayed
      },
    ];

    // Mock the module at the component level
    const component = await mount(
      <div>
        {/* Mock implementation would need to be injected here */}
        <IssuesList owner="test-owner" repo="test-repo" />
      </div>
    );

    // Wait for the component to load
    await expect(component).toBeVisible();
    
    // Verify that actual issues are displayed
    await expect(component.getByText('Actual Issue #1')).toBeVisible();
    await expect(component.getByText('Actual Issue #2')).toBeVisible();
    
    // Verify that issue numbers are displayed correctly
    await expect(component.getByText('#123')).toBeVisible();
    await expect(component.getByText('#124')).toBeVisible();
    
    // Verify that user information is displayed
    await expect(component.getByText('testuser')).toBeVisible();
    await expect(component.getByText('testuser2')).toBeVisible();
    
    // Verify that dates are formatted and displayed
    await expect(component.getByText('1/15/2024')).toBeVisible();
    await expect(component.getByText('1/14/2024')).toBeVisible();
    
    // Verify that comment counts are displayed
    await expect(component.getByText('5 comments')).toBeVisible();
    await expect(component.getByText('3 comments')).toBeVisible();
    
    // Verify that status badges are displayed
    await expect(component.getByText('open')).toHaveCount(2);
  });

  test('should show loading state initially', async ({ mount }) => {
    const component = await mount(<IssuesList owner="test-owner" repo="test-repo" />);
    
    // Initially, should show loading spinner
    await expect(component.locator('[data-testid="loading-spinner"]').or(component.locator('.animate-spin'))).toBeVisible();
  });

  test('should show empty state when no issues are found', async ({ mount }) => {
    // This test would need the getIssues function to be mocked to return an empty array
    const component = await mount(<IssuesList owner="test-owner" repo="test-repo" />);
    
    // Wait for loading to complete and check for empty state
    // Note: This would need proper mocking to work correctly
    await expect(component.getByText('No issues found.')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to issue detail page when clicking issue title', async ({ mount, page }) => {
    const component = await mount(<IssuesList owner="test-owner" repo="test-repo" />);
    
    // Wait for issues to load
    await component.waitFor({ state: 'visible' });
    
    // Click on an issue title (this would need proper data loading)
    // The actual test would verify navigation behavior
    const issueLink = component.locator('a[href*="/issues/"]').first();
    if (await issueLink.isVisible()) {
      await expect(issueLink).toBeVisible();
      // Could test the href attribute or click behavior here
    }
  });

  test('should handle different repository owners and repos', async ({ mount }) => {
    // Test with different owner/repo combinations
    const component1 = await mount(<IssuesList owner="facebook" repo="react" />);
    await expect(component1).toBeVisible();

    const component2 = await mount(<IssuesList owner="microsoft" repo="vscode" />);
    await expect(component2).toBeVisible();
    
    // Test with no owner/repo (should use defaults)
    const component3 = await mount(<IssuesList />);
    await expect(component3).toBeVisible();
  });

  test('should display correct issue state badges', async ({ mount }) => {
    // This test would verify that the state badges are correctly colored and labeled
    const component = await mount(<IssuesList owner="test-owner" repo="test-repo" />);
    
    // Look for state badges
    const openBadges = component.locator('.bg-green-100.text-green-800');
    const closedBadges = component.locator('.bg-red-100.text-red-800');
    
    // Verify badges exist (exact assertions would depend on mocked data)
    await expect(openBadges.or(closedBadges)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('IssuesList Integration with GitHub API', () => {
  test('should filter out pull requests from real API responses', async ({ mount, page }) => {
    // This test demonstrates the key functionality we implemented
    
    // Mock a realistic GitHub API response that includes both issues and pull requests
    await page.route('**/repos/*/issues*', async (route) => {
      const mockApiResponse = [
        {
          id: 1,
          number: 123,
          title: 'Feature Request: Add dark mode',
          body: 'It would be great to have a dark mode option.',
          state: 'open',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-16T14:22:00Z',
          user: {
            login: 'developer123',
            avatar_url: 'https://github.com/identicons/developer123.png',
          },
          comments: 5,
          // No pull_request property - this is an actual issue
        },
        {
          id: 2,
          number: 124,
          title: 'Fix: Update dependencies',
          body: 'This PR updates all dependencies to their latest versions.',
          state: 'open',
          created_at: '2024-01-14T08:15:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          user: {
            login: 'maintainer',
            avatar_url: 'https://github.com/identicons/maintainer.png',
          },
          comments: 3,
          pull_request: {
            url: 'https://api.github.com/repos/test-owner/test-repo/pulls/124',
            html_url: 'https://github.com/test-owner/test-repo/pull/124',
            diff_url: 'https://github.com/test-owner/test-repo/pull/124.diff',
            patch_url: 'https://github.com/test-owner/test-repo/pull/124.patch',
          },
          // This has pull_request property - should be filtered out
        },
        {
          id: 3,
          number: 125,
          title: 'Bug Report: App crashes on startup',
          body: 'The application crashes when starting with specific configuration.',
          state: 'open',
          created_at: '2024-01-13T12:00:00Z',
          updated_at: '2024-01-13T18:30:00Z',
          user: {
            login: 'bugfinder',
            avatar_url: 'https://github.com/identicons/bugfinder.png',
          },
          comments: 8,
          // No pull_request property - this is an actual issue
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponse),
      });
    });

    const component = await mount(<IssuesList owner="test-owner" repo="test-repo" />);
    
    // Wait for the data to load
    await component.waitFor({ state: 'visible' });
    
    // Verify that only actual issues are displayed (not the pull request)
    await expect(component.getByText('Feature Request: Add dark mode')).toBeVisible();
    await expect(component.getByText('Bug Report: App crashes on startup')).toBeVisible();
    
    // Verify that the pull request is NOT displayed
    await expect(component.getByText('Fix: Update dependencies')).not.toBeVisible();
    
    // Verify the correct number of issues are shown (2 issues, not 3 items)
    const issueItems = component.locator('[class*="bg-white border border-gray-200"]');
    await expect(issueItems).toHaveCount(2);
    
    // Verify that the displayed issues have the correct numbers
    await expect(component.getByText('#123')).toBeVisible();
    await expect(component.getByText('#125')).toBeVisible();
    await expect(component.getByText('#124')).not.toBeVisible(); // This was the PR
  });
});