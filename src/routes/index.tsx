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
  });

  return (
    <>
      <IssueForm action={action} data={state} />
      <IssueComments data={state} />
    </>
  );
}
