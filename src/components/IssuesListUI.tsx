import { Link } from "@tanstack/react-router";
import { formatDateFromIso } from "../lib/dateUtils";
import type { GitHubIssue } from "../types/github";
import { IssueBadge } from "./IssueBadge";
import { LoadingSpinner } from "./LoadingSpinner";
import { UserAvatar } from "./UserAvatar";

export interface IssuesListUIProps {
  issues: GitHubIssue[];
  loading?: boolean;
  owner?: string;
  repo?: string;
}

export function IssuesListUI({
  issues,
  loading,
  owner,
  repo,
}: IssuesListUIProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  // If owner and repo are not provided, show a message to add them
  if (!owner || !repo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          Please specify the repository owner and name in the URL parameters.
        </p>
        <p className="text-sm text-gray-400">
          Example: /issues?owner=facebook&repo=react&state=open
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div
          key={issue.id}
          data-testid="issue-item"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                to="/issues/$issueNumber"
                params={{ issueNumber: String(issue.number) }}
                search={{ owner: owner || "", repo: repo || "" }}
                className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
              >
                #{issue.number} {issue.title}
              </Link>
              <p className="text-gray-600 mb-3 line-clamp-2">{issue.body}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <UserAvatar user={issue.user} size="sm" />
                  <span>{issue.user.login}</span>
                </div>
                <span>•</span>
                <span>{formatDateFromIso(issue.created_at)}</span>
                <span>•</span>
                <span>{issue.comments} comments</span>
              </div>
            </div>
            <IssueBadge state={issue.state} size="sm" />
          </div>
        </div>
      ))}

      {issues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No issues found.</p>
        </div>
      )}
    </div>
  );
}
