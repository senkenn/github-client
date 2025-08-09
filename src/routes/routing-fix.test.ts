import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Test for the routing fix: https://github.com/senkenn/github-client/issues/12
 * 
 * This test ensures that the issue detail routing works correctly.
 * The issue was that when navigating to `/issues/1`, the IssuesList component
 * was shown instead of the IssueDetail component due to missing <Outlet /> in parent route.
 */
describe("Issues routing fix", () => {
  it("should have created issues.index.tsx route for issues list", () => {
    // Verify that the new index route file exists and has correct content
    const issuesIndexPath = join(__dirname, "issues.index.tsx");
    const issuesIndexContent = readFileSync(issuesIndexPath, "utf8");
    
    // Verify it creates a route for "/issues/"
    expect(issuesIndexContent).toContain('createFileRoute("/issues/")');
    
    // Verify it renders IssuesList component
    expect(issuesIndexContent).toContain("IssuesList");
    
    // Verify it has the correct component name
    expect(issuesIndexContent).toContain("IssuesIndexPage");
  });
  
  it("should have updated issues.tsx route to use Outlet for nested routing", () => {
    // This test verifies that the issues.tsx route uses Outlet for nested routing
    const issuesPath = join(__dirname, "issues.tsx");
    const issuesContent = readFileSync(issuesPath, "utf8");
    
    // Verify that the file imports Outlet
    expect(issuesContent).toContain("import { createFileRoute, Outlet }");
    
    // Verify that the file uses <Outlet />
    expect(issuesContent).toContain("<Outlet />");
    
    // Verify that the file no longer directly renders IssuesList
    expect(issuesContent).not.toContain("<IssuesList");
    
    // Verify the route is still for "/issues"
    expect(issuesContent).toContain('createFileRoute("/issues")');
  });
  
  it("should maintain the issue detail route unchanged", () => {
    // Verify that the issue detail route still exists and is correct
    const issueDetailPath = join(__dirname, "issues.$issueNumber.tsx");
    const issueDetailContent = readFileSync(issueDetailPath, "utf8");
    
    // Verify it creates a route for the issue number parameter
    expect(issueDetailContent).toContain('createFileRoute("/issues/$issueNumber")');
    
    // Verify it renders IssueDetail component
    expect(issueDetailContent).toContain("IssueDetail");
    
    // Verify it has the correct component name
    expect(issueDetailContent).toContain("IssueDetailPage");
  });
});