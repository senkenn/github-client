import { createFileRoute } from "@tanstack/react-router";
import { IssuesList } from "../components/IssuesList";
import { Route as IssuesRoute } from "./issues";

export const Route = createFileRoute("/issues/")({
  component: IssuesIndexPage,
});

function IssuesIndexPage() {
  // Use parent's validated search to avoid duplicate validation
  const { owner, repo } = IssuesRoute.useSearch();

  return <IssuesList owner={owner} repo={repo} />;
}
