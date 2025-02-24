import { createFileRoute } from "@tanstack/react-router";
import { Octokit } from "octokit";
import { useActionState } from "react";
import { SubmitButton } from "./-components/SubmitButton";

export const Route: unknown = createFileRoute("/")({
  component: Index,
});

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});

async function fetchCommentsAction(
  _state: IssueParams,
  formData: FormData
): Promise<IssueParams> {
  const inputOwner = formData.get("owner") as string;
  const inputRepo = formData.get("repo") as string;
  const inputIssueNumber = formData.get("issueNumber") as string;

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
    issueNumber: inputIssueNumber,
    issueComments: comments,
  };
}

type IssueParams = {
  owner: string;
  repo: string;
  issueNumber: string;
  issueComments: string[] | undefined;
};

function Index() {
  const [{ owner, repo, issueNumber, issueComments }, action] = useActionState(
    fetchCommentsAction,
    {
      owner: "senkenn",
      repo: "sqlsurge",
      issueNumber: "1",
      issueComments: [],
    }
  );

  return (
    <>
      <form action={action} className="p-2">
        <input
          type="text"
          placeholder="Enter Owner (e.g. user)"
          className="border border-gray-300 rounded p-2 mb-4 w-full"
          name="owner"
          defaultValue={owner}
        />
        <input
          type="text"
          placeholder="Enter Repo (e.g. repo)"
          className="border border-gray-300 rounded p-2 mb-4 w-full"
          name="repo"
          defaultValue={repo}
        />
        <input
          type="text"
          placeholder="Enter Issue Number (e.g. 1)"
          className="border border-gray-300 rounded p-2 mb-4 w-full"
          name="issueNumber"
          defaultValue={issueNumber.toString()}
        />
        <SubmitButton />
      </form>

      {/* Display comments */}
      {!issueComments ? (
        <div className="p-2">No comments found</div>
      ) : (
        issueComments.map((comment, index) => {
          return (
            <div
              contentEditable="true"
              key={index}
              className="border border-gray-300 rounded p-2 font-mono bg-gray-100 w-full whitespace-pre-wrap"
              suppressContentEditableWarning={true}
            >
              {comment}
            </div>
          );
        })
      )}
    </>
  );
}
