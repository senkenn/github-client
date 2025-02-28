import { Octokit } from "octokit";
import { IssueParams } from "../-components/IssueComments";

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});

export async function fetchCommentsAction(
  _state: IssueParams,
  formData: FormData
): Promise<IssueParams> {
  try {
    const inputOwner = formData.get("owner") as string;
    const inputRepo = formData.get("repo") as string;
    const inputIssueNumber = formData.get("issueNumber") as string;

    // fetch body
    const issueSummaryRes = await octokit.rest.issues.get({
      owner: inputOwner,
      repo: inputRepo,
      issue_number: parseInt(inputIssueNumber, 10),
    });
    const body = issueSummaryRes.data.body ?? "No description provided.";

    // fetch comments
    const response = await octokit.rest.issues.listComments({
      owner: inputOwner,
      repo: inputRepo,
      issue_number: parseInt(inputIssueNumber, 10),
    });
    const comments = response.data
      .map((comment) => comment.body)
      .filter((body): body is string => body !== undefined);

    return {
      owner: inputOwner,
      repo: inputRepo,
      number: inputIssueNumber,
      body,
      comments,
    };
  } catch (error) {
    console.error("Error fetching comments", error);
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
