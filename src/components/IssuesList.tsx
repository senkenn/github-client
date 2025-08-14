import { useEffect, useState } from "react";
import { getIssues, type IssueFilters } from "../lib/github";
import type { GitHubIssue } from "../types/github";
import { IssuesListUI } from "./IssuesListUI";

interface IssuesListProps {
  owner?: string;
  repo?: string;
  issues?: GitHubIssue[];
  filters?: IssueFilters;
}

export function IssuesList({
  owner,
  repo,
  filters,
  issues: propIssues,
}: IssuesListProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>(propIssues || []);
  const [loading, setLoading] = useState(!propIssues);

  // Update issues and loading state if propIssues changes
  useEffect(() => {
    if (propIssues) {
      setIssues(propIssues);
      setLoading(false);
    }
  }, [propIssues]);

  // Fetch issues only if propIssues is not provided
  useEffect(() => {
    if (propIssues) return;
    if (!owner || !repo) return; // Don't fetch if owner or repo is missing

    const fetchIssues = async () => {
      try {
        const data = await getIssues(owner, repo, filters);
        setIssues(data);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [owner, repo, filters, propIssues]);

  return (
    <IssuesListUI issues={issues} loading={loading} owner={owner} repo={repo} />
  );
}
