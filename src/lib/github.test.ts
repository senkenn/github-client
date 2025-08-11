import type { GitHubComment, GitHubIssue } from "../types/github";

// Create mock functions
const mockListForRepo = vi.fn();
const mockGetRepo = vi.fn();
const mockGetIssue = vi.fn();
const mockListComments = vi.fn();

// Mock Octokit before importing the module
vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: mockGetRepo,
      },
      issues: {
        listForRepo: mockListForRepo,
        get: mockGetIssue,
        listComments: mockListComments,
      },
    },
  })),
}));

// Import after mocking
const { getIssues, checkRepositoryExists, getIssue, getIssueComments } =
  await import("./github");

describe("github.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getIssues", () => {
    it("should filter out pull requests from the response", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 1,
            title: "Real Issue",
            body: "This is a real issue",
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "user1", avatar_url: "avatar1.jpg" },
            comments: 0,
            // No pull_request property - this is a real issue
          },
          {
            id: 2,
            number: 2,
            title: "Pull Request",
            body: "This is a pull request",
            state: "open",
            created_at: "2024-01-02T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
            user: { login: "user2", avatar_url: "avatar2.jpg" },
            comments: 1,
            pull_request: {
              url: "https://api.github.com/repos/test/test/pulls/2",
              html_url: "https://github.com/test/test/pull/2",
              diff_url: "https://github.com/test/test/pull/2.diff",
              patch_url: "https://github.com/test/test/pull/2.patch",
            },
          },
          {
            id: 3,
            number: 3,
            title: "Another Real Issue",
            body: "This is another real issue",
            state: "closed",
            created_at: "2024-01-03T00:00:00Z",
            updated_at: "2024-01-03T00:00:00Z",
            user: { login: "user3", avatar_url: "avatar3.jpg" },
            comments: 2,
            // No pull_request property - this is a real issue
          },
        ],
      };

      mockListForRepo.mockResolvedValueOnce(mockResponse);

      const result = await getIssues("test-owner", "test-repo");

      expect(result).toHaveLength(2);
      expect(result[0].number).toBe(1);
      expect(result[1].number).toBe(3);
      // expect(result.every((issue) => !issue.pull_request)).toBe(true);
    });

    it("should return empty array when all items are pull requests", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 1,
            title: "Pull Request 1",
            body: "This is a pull request",
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "user1", avatar_url: "avatar1.jpg" },
            comments: 0,
            pull_request: {
              url: "https://api.github.com/repos/test/test/pulls/1",
              html_url: "https://github.com/test/test/pull/1",
              diff_url: "https://github.com/test/test/pull/1.diff",
              patch_url: "https://github.com/test/test/pull/1.patch",
            },
          },
          {
            id: 2,
            number: 2,
            title: "Pull Request 2",
            body: "This is another pull request",
            state: "closed",
            created_at: "2024-01-02T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
            user: { login: "user2", avatar_url: "avatar2.jpg" },
            comments: 1,
            pull_request: {
              url: "https://api.github.com/repos/test/test/pulls/2",
              html_url: "https://github.com/test/test/pull/2",
              diff_url: "https://github.com/test/test/pull/2.diff",
              patch_url: "https://github.com/test/test/pull/2.patch",
            },
          },
        ],
      };

      mockListForRepo.mockResolvedValueOnce(mockResponse);

      const result = await getIssues("test-owner", "test-repo");

      expect(result).toHaveLength(0);
    });

    it("should handle empty response", async () => {
      const mockResponse = { data: [] };

      mockListForRepo.mockResolvedValueOnce(mockResponse);

      const result = await getIssues("test-owner", "test-repo");

      expect(result).toHaveLength(0);
    });

    it("should use default owner and repo when not provided", async () => {
      const mockResponse = { data: [] };

      mockListForRepo.mockResolvedValueOnce(mockResponse);

      await getIssues();

      expect(mockListForRepo).toHaveBeenCalledWith({
        owner: "microsoft",
        repo: "vscode",
        state: "open",
        creator: undefined,
        per_page: 100,
      });
    });

    it("should throw error when API fails", async () => {
      const error = new Error("API Error");
      mockListForRepo.mockRejectedValueOnce(error);

      await expect(getIssues("test-owner", "test-repo")).rejects.toThrow(
        "Failed to fetch issues: API Error",
      );
    });

    it("should apply state filter", async () => {
      const mockResponse = { data: [] };
      mockListForRepo.mockResolvedValueOnce(mockResponse);

      await getIssues("test-owner", "test-repo", { state: "closed" });

      expect(mockListForRepo).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        state: "closed",
        creator: undefined,
        per_page: 100,
      });
    });

    it("should apply author filter", async () => {
      const mockResponse = { data: [] };
      mockListForRepo.mockResolvedValueOnce(mockResponse);

      await getIssues("test-owner", "test-repo", { author: "testuser" });

      expect(mockListForRepo).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        state: "open",
        creator: "testuser",
        per_page: 100,
      });
    });

    it("should filter issues by search term in title", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 1,
            title: "Bug in authentication",
            body: "Description of the bug",
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "user1", avatar_url: "avatar1.jpg" },
            comments: 0,
          },
          {
            id: 2,
            number: 2,
            title: "Feature request for UI",
            body: "New feature description",
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "user2", avatar_url: "avatar2.jpg" },
            comments: 1,
          },
        ],
      };
      mockListForRepo.mockResolvedValueOnce(mockResponse);

      const result = await getIssues("test-owner", "test-repo", {
        search: "bug",
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Bug in authentication");
    });

    it("should filter issues by search term in body", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 1,
            title: "Issue title",
            body: "This has authentication problems",
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "user1", avatar_url: "avatar1.jpg" },
            comments: 0,
          },
          {
            id: 2,
            number: 2,
            title: "Other issue",
            body: "This is different",
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "user2", avatar_url: "avatar2.jpg" },
            comments: 1,
          },
        ],
      };
      mockListForRepo.mockResolvedValueOnce(mockResponse);

      const result = await getIssues("test-owner", "test-repo", {
        search: "authentication",
      });

      expect(result).toHaveLength(1);
      expect(result[0].body).toBe("This has authentication problems");
    });

    it("should be case-insensitive when searching", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 1,
            title: "BUG in Authentication",
            body: "Description",
            state: "open",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            user: { login: "user1", avatar_url: "avatar1.jpg" },
            comments: 0,
          },
        ],
      };
      mockListForRepo.mockResolvedValueOnce(mockResponse);

      const result = await getIssues("test-owner", "test-repo", {
        search: "bug",
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("BUG in Authentication");
    });
  });

  describe("checkRepositoryExists", () => {
    it("should return true when repository exists", async () => {
      mockGetRepo.mockResolvedValueOnce({ data: {} });

      const result = await checkRepositoryExists("test-owner", "test-repo");

      expect(result).toBe(true);
      expect(mockGetRepo).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
      });
    });

    it("should return false when repository does not exist (404)", async () => {
      const error = { status: 404 };
      mockGetRepo.mockRejectedValueOnce(error);

      const result = await checkRepositoryExists("test-owner", "test-repo");

      expect(result).toBe(false);
    });

    it("should rethrow non-404 errors", async () => {
      const error = { status: 500, message: "Server Error" };
      mockGetRepo.mockRejectedValueOnce(error);

      await expect(
        checkRepositoryExists("test-owner", "test-repo"),
      ).rejects.toEqual(error);
    });
  });

  describe("getIssue", () => {
    it("should fetch single issue successfully", async () => {
      const mockIssue: GitHubIssue = {
        id: 1,
        number: 123,
        title: "Test Issue",
        body: "Test body",
        state: "open",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        user: { login: "testuser", avatar_url: "avatar.jpg" },
        comments: 5,
      };

      mockGetIssue.mockResolvedValueOnce({ data: mockIssue });

      const result = await getIssue(123, "test-owner", "test-repo");

      expect(result).toEqual(mockIssue);
      expect(mockGetIssue).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        issue_number: 123,
      });
    });

    it("should use default owner and repo when not provided", async () => {
      const mockIssue: GitHubIssue = {
        id: 1,
        number: 123,
        title: "Test Issue",
        body: "Test body",
        state: "open",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        user: { login: "testuser", avatar_url: "avatar.jpg" },
        comments: 5,
      };

      mockGetIssue.mockResolvedValueOnce({ data: mockIssue });

      await getIssue(123);

      expect(mockGetIssue).toHaveBeenCalledWith({
        owner: "microsoft",
        repo: "vscode",
        issue_number: 123,
      });
    });

    it("should throw error when API fails", async () => {
      const error = new Error("API Error");
      mockGetIssue.mockRejectedValueOnce(error);

      await expect(getIssue(123, "test-owner", "test-repo")).rejects.toThrow(
        "Failed to fetch issue 123: API Error",
      );
    });
  });

  describe("getIssueComments", () => {
    it("should fetch issue comments successfully", async () => {
      const mockComments: GitHubComment[] = [
        {
          id: 1,
          body: "First comment",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          user: { login: "user1", avatar_url: "avatar1.jpg" },
        },
        {
          id: 2,
          body: "Second comment",
          created_at: "2024-01-02T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
          user: { login: "user2", avatar_url: "avatar2.jpg" },
        },
      ];

      mockListComments.mockResolvedValueOnce({ data: mockComments });

      const result = await getIssueComments(123, "test-owner", "test-repo");

      expect(result).toEqual(mockComments);
      expect(mockListComments).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        issue_number: 123,
      });
    });

    it("should use default owner and repo when not provided", async () => {
      mockListComments.mockResolvedValueOnce({ data: [] });

      await getIssueComments(123);

      expect(mockListComments).toHaveBeenCalledWith({
        owner: "microsoft",
        repo: "vscode",
        issue_number: 123,
      });
    });

    it("should throw error when API fails", async () => {
      const error = new Error("API Error");
      mockListComments.mockRejectedValueOnce(error);

      await expect(
        getIssueComments(123, "test-owner", "test-repo"),
      ).rejects.toThrow("Failed to fetch comments for issue 123: API Error");
    });
  });
});
