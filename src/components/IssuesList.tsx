import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getIssues } from "../lib/github";
import type { GitHubIssue } from "../types/github";

interface IssuesListProps {
  owner?: string;
  repo?: string;
}

export function IssuesList({ owner, repo }: IssuesListProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await getIssues(owner, repo);
        setIssues(data);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                to="/issues/$issueNumber"
                params={{ issueNumber: issue.number.toString() }}
                search={{ owner, repo }}
                className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
              >
                #{issue.number} {issue.title}
              </Link>
              <p className="text-gray-600 mb-3 line-clamp-2">{issue.body}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <img
                    src={issue.user.avatar_url}
                    alt={issue.user.login}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{issue.user.login}</span>
                </div>
                <span>•</span>
                <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{issue.comments} comments</span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                issue.state === "open"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {issue.state}
            </span>
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
