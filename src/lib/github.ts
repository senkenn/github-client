import { Octokit } from "@octokit/rest";
import type { GitHubComment, GitHubIssue } from "../types/github";

// デモ用の設定（実際のプロジェクトではenvから取得）
const OWNER = "microsoft";
const REPO = "vscode";

const octokit = new Octokit({
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

export async function getIssues(
  owner?: string,
  repo?: string,
): Promise<GitHubIssue[]> {
  try {
    const response = await octokit.rest.issues.listForRepo({
      owner: owner || OWNER,
      repo: repo || REPO,
      state: "open",
      per_page: 20,
    });

    return response.data as GitHubIssue[];
  } catch (error) {
    console.error("Error fetching issues:", error);
    // フォールバック用のモックデータ
    return mockIssues;
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
    console.error("Error fetching issue:", error);
    return mockIssues.find((issue) => issue.number === issueNumber) || null;
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
    console.error("Error fetching comments:", error);
    return mockComments;
  }
}

// モックデータ（API制限やトークンがない場合の代替）
const mockIssues: GitHubIssue[] = [
  {
    id: 1,
    number: 123456,
    title: "Sample Issue: Feature Request for Better Editor Support",
    body: "This is a sample issue description. We need better editor support for modern development workflows.",
    state: "open",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:22:00Z",
    user: {
      login: "developer123",
      avatar_url: "https://github.com/identicons/developer123.png",
    },
    comments: 5,
  },
  {
    id: 2,
    number: 123457,
    title: "Bug Report: Application Crashes on Startup",
    body: "The application consistently crashes when starting up with specific configuration files.",
    state: "open",
    created_at: "2024-01-14T08:15:00Z",
    updated_at: "2024-01-14T16:45:00Z",
    user: {
      login: "bugfinder",
      avatar_url: "https://github.com/identicons/bugfinder.png",
    },
    comments: 12,
  },
  {
    id: 3,
    number: 123458,
    title: "Documentation Update: API Reference Improvements",
    body: "The current API documentation is incomplete and needs comprehensive updates.",
    state: "open",
    created_at: "2024-01-13T12:00:00Z",
    updated_at: "2024-01-13T18:30:00Z",
    user: {
      login: "docwriter",
      avatar_url: "https://github.com/identicons/docwriter.png",
    },
    comments: 3,
  },
];

const mockComments: GitHubComment[] = [
  {
    id: 1,
    body: "This is a great suggestion! I think we should definitely consider implementing this feature.",
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
    user: {
      login: "maintainer1",
      avatar_url: "https://github.com/identicons/maintainer1.png",
    },
  },
  {
    id: 2,
    body: "I agree with the above comment. However, we need to consider the performance implications.",
    created_at: "2024-01-15T14:30:00Z",
    updated_at: "2024-01-15T14:30:00Z",
    user: {
      login: "performance_expert",
      avatar_url: "https://github.com/identicons/performance_expert.png",
    },
  },
  {
    id: 3,
    body: "Here are some additional thoughts on the implementation approach...",
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-16T09:15:00Z",
    user: {
      login: "architect",
      avatar_url: "https://github.com/identicons/architect.png",
    },
  },
];
