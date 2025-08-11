import { Octokit } from "@octokit/rest";
import type { GitHubComment, GitHubIssue } from "../types/github";

// デモ用の設定（実際のプロジェクトではenvから取得）
const OWNER = "microsoft";
const REPO = "vscode";

// テスト環境ではモックサーバーを使用
// Playwrightコンポーネントテストの場合、location.hostnameでctPort (3100) を検出
const isTestEnv =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  window.location.port === "3100";
const baseUrl = isTestEnv ? "http://localhost:3001" : undefined;

const octokit = new Octokit({
  baseUrl,
  auth: import.meta.env.VITE_GITHUB_TOKEN, // 必要に応じてトークンを設定
});

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

export async function getIssues(
  owner?: string,
  repo?: string,
  filters?: IssueFilters,
): Promise<GitHubIssue[]> {
  try {
    const response = await octokit.rest.issues.listForRepo({
      owner: owner || OWNER,
      repo: repo || REPO,
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
    throw new Error(
      `Failed to fetch issues: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getIssue(
  issueNumber: number,
  owner?: string,
  repo?: string,
): Promise<GitHubIssue | null> {
  try {
    const response = await octokit.rest.issues.get({
      owner: owner || OWNER,
      repo: repo || REPO,
      issue_number: issueNumber,
    });

    return response.data as GitHubIssue;
  } catch (error) {
    throw new Error(
      `Failed to fetch issue ${issueNumber}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getIssueComments(
  issueNumber: number,
  owner?: string,
  repo?: string,
): Promise<GitHubComment[]> {
  try {
    const response = await octokit.rest.issues.listComments({
      owner: owner || OWNER,
      repo: repo || REPO,
      issue_number: issueNumber,
    });

    return response.data as GitHubComment[];
  } catch (error) {
    throw new Error(
      `Failed to fetch comments for issue ${issueNumber}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
