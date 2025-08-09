import { Octokit } from "@octokit/rest";
import type { IssueParams } from "../-components/CommentItem";

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});

export async function fetchCommentsAction(
  _state: IssueParams,
  formData: FormData,
): Promise<IssueParams> {
  try {
    const inputOwner = formData.get("owner") as string;
    const inputRepo = formData.get("repo") as string;
    const inputIssueNumber = formData.get("issueNumber") as string;

    // fetch body
    const issueSummaryRes = await octokit.rest.issues.get({
      owner: inputOwner,
      repo: inputRepo,
      issue_number: Number.parseInt(inputIssueNumber, 10),
    });
    const body = issueSummaryRes.data.body ?? "No description provided.";

    // fetch comments
    const response = await octokit.rest.issues.listComments({
      owner: inputOwner,
      repo: inputRepo,
      issue_number: Number.parseInt(inputIssueNumber, 10),
    });
    const comments = response.data
      .map((comment) => {
        return {
          id: comment.id,
          body: comment.body,
        };
      })
      .filter(
        (comment): comment is { id: number; body: string } =>
          comment.body !== undefined,
      );

    return {
      owner: inputOwner,
      repo: inputRepo,
      number: inputIssueNumber,
      body,
      comments: comments,
    };
  } catch (error) {
    console.error("Error fetching comments", error); // TODO: ロガーを使う
    return {
      owner: formData.get("owner") as string,
      repo: formData.get("repo") as string,
      number: formData.get("issueNumber") as string,
      body: "",
      comments: [],
      error: error as Error,
    };
  }
}

export async function updateComment(
  owner: string,
  repo: string,
  commentId: number,
  updatedBody: string,
) {
  try {
    const response = await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: commentId,
      body: updatedBody,
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
