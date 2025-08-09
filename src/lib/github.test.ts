import { beforeEach, describe, expect, it, vi } from "vitest";
import { getIssues } from "./github";

vi.mock("@octokit/rest", () => {
  const Octokit = vi.fn();
  Octokit.prototype.rest = {
    issues: {
      listForRepo: vi.fn(),
    },
  };
  return { Octokit };
});

describe("getIssues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should filter out pull requests from GitHub API response", async () => {
    // Mock Octokit
    const { Octokit } = await import("@octokit/rest");
    const mockOctokit = new Octokit();
    
    // Mock API response that includes both issues and pull requests
    const mockResponse = {
      data: [
        {
          id: 1,
          number: 123,
          title: "Actual Issue",
          body: "This is a real issue",
          state: "open",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-16T14:22:00Z",
          user: {
            login: "user1",
            avatar_url: "https://github.com/identicons/user1.png",
          },
          comments: 5,
          // No pull_request property - this is an actual issue
        },
        {
          id: 2,
          number: 124,
          title: "Pull Request Title",
          body: "This is a pull request",
          state: "open",
          created_at: "2024-01-14T08:15:00Z",
          updated_at: "2024-01-14T16:45:00Z",
          user: {
            login: "user2",
            avatar_url: "https://github.com/identicons/user2.png",
          },
          comments: 3,
          pull_request: {
            url: "https://api.github.com/repos/owner/repo/pulls/124",
            html_url: "https://github.com/owner/repo/pull/124",
            diff_url: "https://github.com/owner/repo/pull/124.diff",
            patch_url: "https://github.com/owner/repo/pull/124.patch",
          },
        },
        {
          id: 3,
          number: 125,
          title: "Another Issue",
          body: "This is another real issue",
          state: "open",
          created_at: "2024-01-13T12:00:00Z",
          updated_at: "2024-01-13T18:30:00Z",
          user: {
            login: "user3",
            avatar_url: "https://github.com/identicons/user3.png",
          },
          comments: 1,
          // No pull_request property - this is an actual issue
        },
      ],
    };

    vi.spyOn(mockOctokit.rest.issues, "listForRepo").mockResolvedValue(mockResponse);

    // Call the function
    const result = await getIssues("test-owner", "test-repo");

    // Verify that only actual issues are returned (no pull requests)
    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(123);
    expect(result[0].title).toBe("Actual Issue");
    expect(result[1].number).toBe(125);
    expect(result[1].title).toBe("Another Issue");

    // Verify that items with pull_request property are filtered out
    expect(result.every(item => !("pull_request" in item))).toBe(true);

    // Verify API was called correctly
    expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      state: "open",
      per_page: 20,
    });
  });

  it("should return empty array when all items are pull requests", async () => {
    // Mock Octokit
    const { Octokit } = await import("@octokit/rest");
    const mockOctokit = new Octokit();
    
    // Mock API response with only pull requests
    const mockResponse = {
      data: [
        {
          id: 1,
          number: 124,
          title: "Pull Request 1",
          body: "This is a pull request",
          state: "open",
          created_at: "2024-01-14T08:15:00Z",
          updated_at: "2024-01-14T16:45:00Z",
          user: {
            login: "user1",
            avatar_url: "https://github.com/identicons/user1.png",
          },
          comments: 3,
          pull_request: {
            url: "https://api.github.com/repos/owner/repo/pulls/124",
            html_url: "https://github.com/owner/repo/pull/124",
            diff_url: "https://github.com/owner/repo/pull/124.diff",
            patch_url: "https://github.com/owner/repo/pull/124.patch",
          },
        },
        {
          id: 2,
          number: 125,
          title: "Pull Request 2",
          body: "This is another pull request",
          state: "open",
          created_at: "2024-01-13T12:00:00Z",
          updated_at: "2024-01-13T18:30:00Z",
          user: {
            login: "user2",
            avatar_url: "https://github.com/identicons/user2.png",
          },
          comments: 1,
          pull_request: {
            url: "https://api.github.com/repos/owner/repo/pulls/125",
            html_url: "https://github.com/owner/repo/pull/125",
            diff_url: "https://github.com/owner/repo/pull/125.diff",
            patch_url: "https://github.com/owner/repo/pull/125.patch",
          },
        },
      ],
    };

    vi.spyOn(mockOctokit.rest.issues, "listForRepo").mockResolvedValue(mockResponse);

    // Call the function
    const result = await getIssues("test-owner", "test-repo");

    // Verify that no items are returned since all were pull requests
    expect(result).toHaveLength(0);
  });

  it("should return issues without pull_request property unchanged", async () => {
    // Mock Octokit
    const { Octokit } = await import("@octokit/rest");
    const mockOctokit = new Octokit();
    
    // Mock API response with only actual issues
    const mockResponse = {
      data: [
        {
          id: 1,
          number: 123,
          title: "Issue 1",
          body: "This is issue 1",
          state: "open",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-16T14:22:00Z",
          user: {
            login: "user1",
            avatar_url: "https://github.com/identicons/user1.png",
          },
          comments: 5,
        },
        {
          id: 2,
          number: 124,
          title: "Issue 2",
          body: "This is issue 2",
          state: "closed",
          created_at: "2024-01-14T08:15:00Z",
          updated_at: "2024-01-14T16:45:00Z",
          user: {
            login: "user2",
            avatar_url: "https://github.com/identicons/user2.png",
          },
          comments: 3,
        },
      ],
    };

    vi.spyOn(mockOctokit.rest.issues, "listForRepo").mockResolvedValue(mockResponse);

    // Call the function
    const result = await getIssues("test-owner", "test-repo");

    // Verify that all issues are returned unchanged
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResponse.data[0]);
    expect(result[1]).toEqual(mockResponse.data[1]);
  });

  it("should fallback to mock data when API call fails", async () => {
    // Mock Octokit to throw an error
    const { Octokit } = await import("@octokit/rest");
    const mockOctokit = new Octokit();
    
    vi.spyOn(mockOctokit.rest.issues, "listForRepo").mockRejectedValue(new Error("API Error"));

    // Call the function
    const result = await getIssues("test-owner", "test-repo");

    // Verify that mock data is returned
    expect(result).toHaveLength(3);
    expect(result[0].number).toBe(123456);
    expect(result[0].title).toBe("Sample Issue: Feature Request for Better Editor Support");
    expect(result[1].number).toBe(123457);
    expect(result[1].title).toBe("Bug Report: Application Crashes on Startup");
    expect(result[2].number).toBe(123458);
    expect(result[2].title).toBe("Documentation Update: API Reference Improvements");

    // Verify that mock data contains no pull_request properties
    expect(result.every(item => !("pull_request" in item))).toBe(true);
  });

  it("should use default owner and repo when not provided", async () => {
    // Mock Octokit
    const { Octokit } = await import("@octokit/rest");
    const mockOctokit = new Octokit();
    
    const mockResponse = {
      data: [
        {
          id: 1,
          number: 123,
          title: "Test Issue",
          body: "Test body",
          state: "open",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-16T14:22:00Z",
          user: {
            login: "testuser",
            avatar_url: "https://github.com/identicons/testuser.png",
          },
          comments: 0,
        },
      ],
    };

    vi.spyOn(mockOctokit.rest.issues, "listForRepo").mockResolvedValue(mockResponse);

    // Call the function without parameters
    const result = await getIssues();

    // Verify that default values are used
    expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
      owner: "microsoft",
      repo: "vscode",
      state: "open",
      per_page: 20,
    });

    expect(result).toHaveLength(1);
  });
});