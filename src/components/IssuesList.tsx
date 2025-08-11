import { useEffect, useState } from "react";
import { getIssues } from "../lib/github";
import type { GitHubIssue } from "../types/github";
import { IssuesListUI } from "./IssuesListUI";

interface IssuesListProps {
  owner?: string;
  repo?: string;
  issues?: GitHubIssue[];
}

export function IssuesList({
  owner,
  repo,
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
  }, [owner, repo, propIssues]);

  return (
    <IssuesListUI
      issues={issues}
      loading={loading}
      getIssueHref={(i) =>
        owner && repo
          ? `/issues/${i.number}?owner=${owner}&repo=${repo}`
          : undefined
      }
    />
  );
}
