import { createFileRoute } from "@tanstack/react-router";
import { IssueDetail } from "../components/IssueDetail";

type IssueDetailSearch = {
  owner?: string;
  repo?: string;
};

export const Route = createFileRoute("/issues/$issueNumber")({
  component: IssueDetailPage,
  validateSearch: (search: Record<string, unknown>): IssueDetailSearch => {
    return {
      owner: typeof search.owner === "string" ? search.owner : undefined,
      repo: typeof search.repo === "string" ? search.repo : undefined,
    };
  },
});

function IssueDetailPage() {
  const { issueNumber } = Route.useParams();
  const { owner, repo } = Route.useSearch();

  return (
    <div>
      <IssueDetail
        issueNumber={parseInt(issueNumber)}
        owner={owner}
        repo={repo}
      />
    </div>
  );
}
