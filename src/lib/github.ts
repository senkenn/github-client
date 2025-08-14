import { Octokit } from "@octokit/rest";
import type { GitHubComment, GitHubIssue } from "../types/github";

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});

/**
 * Helper function to create consistent error messages
 */
function createErrorMessage(operation: string, details?: string): string {
  return `Failed to ${operation}${details ? `: ${details}` : ""}`;
}

/**
 * Helper function to handle API errors consistently
 */
function handleApiError(operation: string, error: unknown): never {
  const message = error instanceof Error ? error.message : "Unknown error";
  throw new Error(createErrorMessage(operation, message));
}

/**
 * Check if a GitHub repository exists
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @returns Promise that resolves to true if repository exists, false if not found
 * @throws Error for other API failures (authentication, network, etc.)
 */
export async function checkRepositoryExists(
  owner: string,
  repo: string,
): Promise<boolean> {
  try {
    await octokit.rest.repos.get({
      owner,
      repo,
    });
    return true;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return false;
    }
    // その他のエラーの場合は再スロー
    throw error;
  }
}

export interface IssueFilters {
  state?: "open" | "closed" | "all";
  search?: string;
  author?: string;
}

/**
 * Fetch issues from a GitHub repository with filtering support
 * @param owner - Repository owner username (defaults to 'microsoft')
 * @param repo - Repository name (defaults to 'vscode')
 * @param filters - Optional filters for state, search, and author
 * @returns Promise that resolves to array of GitHub issues (excludes pull requests)
 */
export async function getIssues(
  owner: string,
  repo: string,
  filters?: IssueFilters,
): Promise<GitHubIssue[]> {
  try {
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: filters?.state || "open", // Default to open issues
      creator: filters?.author,
      per_page: 100, // Increase to support client-side search filtering
    });

    // Filter out pull requests - GitHub API includes PRs in issues endpoint
    let issuesOnly = response.data.filter((item) => !item.pull_request);

    // Client-side search filtering if search term is provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      issuesOnly = issuesOnly.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm) ||
          issue.body?.toLowerCase().includes(searchTerm),
      );
    }

    return issuesOnly as GitHubIssue[];
  } catch (error) {
    handleApiError("fetch issues", error);
  }
}

/**
 * Fetch a specific issue by number
 * @param issueNumber - Issue number to fetch
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @returns Promise that resolves to the GitHub issue or null if not found
 */
export async function getIssue(
  issueNumber: number,
  owner: string,
  repo: string,
): Promise<GitHubIssue | null> {
  try {
    const response = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    return response.data as GitHubIssue;
  } catch (error) {
    handleApiError(`fetch issue ${issueNumber}`, error);
  }
}

/**
 * Fetch comments for a specific issue
 * @param issueNumber - Issue number to fetch comments for
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @returns Promise that resolves to array of GitHub comments
 */
export async function getIssueComments(
  issueNumber: number,
  owner: string,
  repo: string,
): Promise<GitHubComment[]> {
  try {
    const response = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    });

    return response.data as GitHubComment[];
  } catch (error) {
    handleApiError(`fetch comments for issue ${issueNumber}`, error);
  }
}

/**
 * Update a comment's content
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @param commentId - Comment ID to update
 * @param updatedMarkdown - New markdown content for the comment
 * @returns Promise that resolves to updated comment data
 */
export async function updateComment(
  owner: string,
  repo: string,
  commentId: number,
  updatedMarkdown: string,
) {
  try {
    const response = await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: commentId,
      body: updatedMarkdown,
    });
    return {
      id: response.data.id,
      body: response.data.body,
      user: { login: response.data.user?.login ?? "unknown" },
      updated_at: response.data.updated_at,
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

/**
 * Update an issue's body content
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @param issueNumber - Issue number to update
 * @param updatedMarkdown - New markdown content for the issue body
 * @returns Promise that resolves to updated issue data
 */
export async function updateIssueBody(
  owner: string,
  repo: string,
  issueNumber: number,
  updatedMarkdown: string,
): Promise<GitHubIssue> {
  try {
    const response = await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      body: updatedMarkdown,
    });
    return response.data as GitHubIssue;
  } catch (error) {
    console.error("Error updating issue body:", error);
    throw error;
  }
}
