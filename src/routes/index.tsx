import { createFileRoute } from "@tanstack/react-router";
import { useActionState } from "react";
import { IssueForm } from "./-components/IssueForm";
import { IssueComments } from "./-components/IssueComments";
import { fetchCommentsAction } from "./-functions/commentsAction";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [state, action] = useActionState(fetchCommentsAction, {
    owner: "",
    repo: "",
    number: "",
    body: "",
    comments: [],
    error: undefined,
  });
  const { owner, repo, number } = state;

  return (
    <>
      <IssueForm action={action} data={state} />
      {state.error && <div className="p-2">Error: {state.error.message}</div>}

      {/** Issue URL */}
      {owner && repo && number && (
        <div className="p-2">
          URL:
          <a
            href={`https://github.com/${owner}/${repo}/issues/${number}`}
            className="p-2 text-blue-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {`https://github.com/${owner}/${repo}/issues/${number}`}
          </a>
        </div>
      )}

      <IssueComments issueBody={state.body} issueComments={state.comments} />
    </>
  );
}
