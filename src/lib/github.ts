import { Octokit } from "@octokit/rest";
import type { GitHubComment, GitHubIssue } from "../types/github";

const githubToken = import.meta.env.VITE_GITHUB_TOKEN;

const octokit = new Octokit({
  auth: githubToken,
  userAgent: "github-client-app/1.0.0",
  request: {
    fetch: (url: string, options: RequestInit = {}) => {
      // タイムスタンプを追加してキャッシュを回避
      const separator = url.includes("?") ? "&" : "?";
      const urlWithTimestamp = `${url}${separator}_t=${Date.now()}`;

      // CORSに対応したfetchオプション
      const corsOptions: RequestInit = {
        ...options,
        mode: "cors",
        credentials: "omit",
        cache: "no-cache",
        headers: {
          ...options.headers,
          Accept: "application/vnd.github+json",
          "User-Agent": "github-client-app/1.0.0",
        },
      };

      return fetch(urlWithTimestamp, corsOptions).catch((error) => {
        throw new Error(`Network error: ${error.message}`);
      });
    },
  },
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

    // Apply client-side search filtering if search term is provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      issuesOnly = issuesOnly.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm) ||
          (issue.body || "").toLowerCase().includes(searchTerm),
      );
    }

    // Normalize the response data to ensure body is never undefined
    return issuesOnly.map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || "",
      state: issue.state as "open" | "closed",
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      user: {
        login: issue.user?.login || "unknown",
        avatar_url: issue.user?.avatar_url || "",
      },
      comments: issue.comments,
    })) satisfies GitHubIssue[];
  } catch (error) {
    handleApiError("fetch issues", error);
  }
}

/**
 * Fetch a specific issue by number
 * @param issueNumber - Issue number to fetch
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @returns Promise that resolves to the GitHub issue if found, or throws an error if not found or on API failure
 */
export async function getIssue(
  issueNumber: number,
  owner: string,
  repo: string,
): Promise<GitHubIssue> {
  try {
    const response = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    // Normalize the response data to ensure body is never undefined
    const issueData = response.data;
    return {
      id: issueData.id,
      number: issueData.number,
      title: issueData.title,
      body: issueData.body || "",
      state: issueData.state as "open" | "closed",
      created_at: issueData.created_at,
      updated_at: issueData.updated_at,
      user: {
        login: issueData.user?.login || "unknown",
        avatar_url: issueData.user?.avatar_url || "",
      },
      comments: issueData.comments,
    } satisfies GitHubIssue;
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

    // Normalize the response data to ensure body is never undefined
    return response.data.map((comment) => ({
      id: comment.id,
      body: comment.body || "",
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        login: comment.user?.login || "unknown",
        avatar_url: comment.user?.avatar_url || "",
      },
    })) satisfies GitHubComment[];
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
    handleApiError(`update comment ${commentId}`, error);
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

    const issueData = response.data;
    return {
      id: issueData.id,
      number: issueData.number,
      title: issueData.title,
      body: issueData.body || "",
      state: issueData.state as "open" | "closed",
      created_at: issueData.created_at,
      updated_at: issueData.updated_at,
      user: {
        login: issueData.user?.login || "unknown",
        avatar_url: issueData.user?.avatar_url || "",
      },
      comments: issueData.comments,
    } satisfies GitHubIssue;
  } catch (error) {
    handleApiError(`update issue ${issueNumber}`, error);
  }
}

/**
 * Upload an image file to GitHub using repository storage
 * @param file - File to upload
 * @returns Promise that resolves to a GitHub-hosted URL for the image
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 content (remove data:image/...;base64, prefix)
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Generate a unique filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${sanitizedFileName}`;

    // Try to get the current user to use their own repository for assets
    const user = await octokit.rest.users.getAuthenticated();
    const username = user.data.login;

    // Try to upload to a dedicated assets repository
    const assetRepo = "github-client-assets";

    try {
      // Try to create or get the assets repository
      let repoExists = true;
      try {
        await octokit.rest.repos.get({
          owner: username,
          repo: assetRepo,
        });
      } catch (_repoError) {
        // Repository doesn't exist, try to create it
        try {
          await octokit.rest.repos.createForAuthenticatedUser({
            name: assetRepo,
            description: "Asset storage for GitHub Client",
            public: true,
            auto_init: true,
          });
        } catch (createError) {
          console.warn("Could not create assets repository:", createError);
          repoExists = false;
        }
      }

      if (repoExists) {
        // Upload the file to the repository
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: username,
          repo: assetRepo,
          path: `images/${fileName}`,
          message: `Upload image: ${file.name}`,
          content: base64Content,
        });

        // Return the raw GitHub URL for the uploaded file
        const imageUrl = `https://raw.githubusercontent.com/${username}/${assetRepo}/main/images/${fileName}`;
        return imageUrl;
      }
    } catch (uploadError) {
      console.warn("GitHub repository upload failed:", uploadError);
    }

    // If repository upload fails, fall back to data URL
    throw new Error("GitHub upload failed");
  } catch (error) {
    // Fallback to data URL if GitHub upload fails
    console.warn("GitHub upload failed, falling back to data URL:", error);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return dataUrl;
    } catch (fallbackError) {
      handleApiError(`upload image ${file.name}`, fallbackError);
    }
  }
}
