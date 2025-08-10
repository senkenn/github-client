import { createFileRoute } from "@tanstack/react-router";
import { FilterBar } from "../components/FilterBar";
import { IssuesList } from "../components/IssuesList";
import { Route as IssuesRoute } from "./issues";

export const Route = createFileRoute("/issues/")({
  component: IssuesIndexPage,
});

function IssuesIndexPage() {
  // Use parent's validated search to avoid duplicate validation
  const { owner, repo, state, search, author } = IssuesRoute.useSearch();

  return (
    <div>
      <FilterBar
        currentState={state || "open"}
        currentSearch={search || ""}
        currentAuthor={author || ""}
        owner={owner}
        repo={repo}
      />
      <IssuesList
        owner={owner}
        repo={repo}
        filters={{
          state: state || "open",
          search,
          author,
        }}
      />
    </div>
  );
}
