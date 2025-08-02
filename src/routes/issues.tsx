import { createFileRoute } from "@tanstack/react-router";
import { IssuesList } from "../components/IssuesList";

type IssuesSearch = {
  owner?: string;
  repo?: string;
};

export const Route = createFileRoute("/issues")({
  component: IssuesPage,
  validateSearch: (search: Record<string, unknown>): IssuesSearch => {
    return {
      owner: typeof search.owner === "string" ? search.owner : undefined,
      repo: typeof search.repo === "string" ? search.repo : undefined,
    };
  },
});

function IssuesPage() {
  const { owner, repo } = Route.useSearch();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Issues {owner && repo && `- ${owner}/${repo}`}
      </h1>
      <IssuesList owner={owner} repo={repo} />
    </div>
  );
}
