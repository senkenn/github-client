import { createFileRoute } from "@tanstack/react-router";
import { IssuesList } from "../components/IssuesList";

type IssuesSearch = {
  owner?: string;
  repo?: string;
};

export const Route = createFileRoute("/issues/")({
  component: IssuesIndexPage,
  validateSearch: (search: Record<string, unknown>): IssuesSearch => {
    return {
      owner: typeof search.owner === "string" ? search.owner : undefined,
      repo: typeof search.repo === "string" ? search.repo : undefined,
    };
  },
});

function IssuesIndexPage() {
  const { owner, repo } = Route.useSearch();

  return <IssuesList owner={owner} repo={repo} />;
}