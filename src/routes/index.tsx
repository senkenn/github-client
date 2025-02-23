import {
  createFileRoute,
  ErrorComponent,
  ErrorComponentProps,
} from "@tanstack/react-router";
import { Octokit } from "octokit";
import { useState } from "react";
import { SubmitButton } from "./-components/SubmitButton";

export const Route: unknown = createFileRoute("/")({
  component: Index,
  errorComponent: PostErrorComponent,
});

function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function Index() {
  const [issueComments, setIssueComments] = useState<string[]>([]);

  const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
  });

  const fetchComments = async (formData: any) => {
    try {
      const response = await octokit.rest.issues.listComments({
        owner: formData.get("owner"),
        repo: formData.get("repo"),
        issue_number: formData.get("issueNumber"),
      });
      setIssueComments(
        response.data
          .map((comment) => comment.body)
          .filter((body): body is string => body !== undefined)
      );
    } catch (error) {
      console.error("Error fetching data from GitHub:", error);
    }
  };

  return (
    <form action={fetchComments} className="p-2">
      <input
        type="text"
        placeholder="Enter Owner (e.g. user)"
        className="border border-gray-300 rounded p-2 mb-4 w-full"
        name="owner"
      />
      <input
        type="text"
        placeholder="Enter Repo (e.g. repo)"
        className="border border-gray-300 rounded p-2 mb-4 w-full"
        name="repo"
      />
      <input
        type="text"
        placeholder="Enter Issue Number (e.g. 1)"
        className="border border-gray-300 rounded p-2 mb-4 w-full"
        name="issueNumber"
      />
      <SubmitButton />
      {issueComments.map((comment, index) => {
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
      })}
    </form>
  );
}
