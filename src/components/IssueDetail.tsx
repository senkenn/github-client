import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatDateFromIso } from "../lib/dateUtils";
import { getIssue, getIssueComments, updateComment } from "../lib/github";
import type { GitHubComment, GitHubIssue } from "../types/github";
import { TiptapEditor } from "./TiptapEditor";

interface IssueDetailProps {
  issueNumber: number;
  owner?: string;
  repo?: string;
}

export function IssueDetail({ issueNumber, owner, repo }: IssueDetailProps) {
  const [issue, setIssue] = useState<GitHubIssue | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issueData, commentsData] = await Promise.all([
          getIssue(issueNumber, owner, repo),
          getIssueComments(issueNumber, owner, repo),
        ]);
        setIssue(issueData);
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to fetch issue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [issueNumber, owner, repo]);

  const handleUpdateComment = (commentId: number, newContent: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              body: newContent,
              updated_at: new Date().toISOString(),
            }
          : comment,
      ),
    );
    // ここで実際のAPI更新を行う
    console.log("Updating comment:", commentId, newContent);
    updateComment(owner || "", repo || "", commentId, newContent);
  };

  const handleUpdateIssueBody = (id: number, newContent: string) => {
    if (issue) {
      setIssue((prev) =>
        prev
          ? { ...prev, body: newContent, updated_at: new Date().toISOString() }
          : null,
      );
      // ここで実際のAPI更新を行う
      updateComment(owner || "", repo || "", id, newContent);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Issue Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The issue #{issueNumber} could not be found.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back to Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Issues
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              #{issue.number} {issue.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <img
                  src={issue.user.avatar_url}
                  alt={issue.user.login}
                  className="w-6 h-6 rounded-full"
                />
                <span>{issue.user.login}</span>
              </div>
              <span>•</span>
              <span>opened {formatDateFromIso(issue.created_at)}</span>
              <span>•</span>
              <span>{comments.length} comments</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              issue.state === "open"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {issue.state}
          </span>
        </div>
      </div>

      {/* Issue Body */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <img
                src={issue.user.avatar_url}
                alt={issue.user.login}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <span className="font-medium">{issue.user.login}</span>
                <span className="text-gray-500 text-sm ml-2">
                  commented on {formatDateFromIso(issue.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <TiptapEditor
              content={issue.body}
              onSave={(content) => handleUpdateIssueBody(issue.id, content)}
              onCancel={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white border border-gray-200 rounded-lg"
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <img
                  src={comment.user.avatar_url}
                  alt={comment.user.login}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-medium">{comment.user.login}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    commented on {formatDateFromIso(comment.created_at)}
                    {comment.updated_at !== comment.created_at && (
                      <span className="ml-1">(edited)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 group">
              <TiptapEditor
                content={comment.body}
                onSave={(content) => handleUpdateComment(comment.id, content)}
                onCancel={() => {}}
              />
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">No comments yet.</div>
        )}
      </div>
    </div>
  );
}
