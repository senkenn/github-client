import { createFileRoute } from "@tanstack/react-router";
import { IssueDetail } from "../components/IssueDetail";
import { Route as IssuesRoute } from "./issues";

export const Route = createFileRoute("/issues/$issueNumber")({
  component: IssueDetailPage,
});

function IssueDetailPage() {
  const { issueNumber } = Route.useParams();
  // Use parent's validated search to avoid duplicate validation
  const { owner, repo } = IssuesRoute.useSearch();

  if (!owner || !repo) {
    return (
      <div className="p-4">
        <p className="text-red-600">
          Error: Owner and repository are required. Please make sure the URL
          includes valid owner and repo parameters.
        </p>
      </div>
    );
  }

  return (
    <div>
      <IssueDetail
        issueNumber={parseInt(issueNumber, 10)}
        owner={owner}
        repo={repo}
      />
    </div>
  );
}
