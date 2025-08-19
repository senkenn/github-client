import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatDateFromIso } from "../lib/dateUtils";
import {
  createComment,
  getIssue,
  getIssueComments,
  updateComment,
  updateIssueBody,
} from "../lib/github";
import type { GitHubComment, GitHubIssue } from "../types/github";
import { CommentForm } from "./CommentForm";
import { IssueBadge } from "./IssueBadge";
import { LoadingSpinner } from "./LoadingSpinner";
import { TiptapEditor } from "./TiptapEditor";
import { UserAvatar } from "./UserAvatar";

interface IssueDetailProps {
  issueNumber: number;
  owner: string;
  repo: string;
}

export function IssueDetail({ issueNumber, owner, repo }: IssueDetailProps) {
  const [issue, setIssue] = useState<GitHubIssue | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingComment, setIsCreatingComment] = useState(false);

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

  const handleCreateComment = async (content: string) => {
    setIsCreatingComment(true);
    try {
      const newComment = await createComment(owner, repo, issueNumber, content);
      setComments((prev) => [...prev, newComment]);
      // Update issue comment count if available
      if (issue) {
        setIssue((prev) =>
          prev ? { ...prev, comments: prev.comments + 1 } : null,
        );
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
      throw error; // Re-throw to let CommentForm handle the error
    } finally {
      setIsCreatingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: number, newContent: string) => {
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
    try {
      await updateComment(owner, repo, commentId, newContent);
    } catch (e) {
      console.error("Failed to update comment", e);
      // Revert on failure by refetching comments
      try {
        const refreshedComments = await getIssueComments(
          issueNumber,
          owner,
          repo,
        );
        setComments(refreshedComments);
      } catch (inner) {
        console.error("Failed to refetch comments after update failure", inner);
      }
    }
  };

  const handleUpdateIssueBody = async (newContent: string) => {
    if (!issue) return;
    // Optimistic update
    setIssue((prev) =>
      prev
        ? { ...prev, body: newContent, updated_at: new Date().toISOString() }
        : null,
    );
    try {
      await updateIssueBody(owner, repo, issue.number, newContent);
    } catch (e) {
      console.error("Failed to update issue body", e);
      // Revert on failure by refetching
      try {
        const refreshed = await getIssue(issue.number, owner, repo);
        setIssue(refreshed);
      } catch (inner) {
        console.error("Failed to refetch issue after update failure", inner);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
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
          to="/issues"
          search={{ owner, repo }}
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
          to="/issues"
          search={{ owner, repo }}
          className="inline-flex items-center text-black hover:text-blue-600 mb-4"
        >
          ← Back to Issues
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              <a
                href={`https://github.com/${owner}/${repo}/issues/${issue.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-colors"
              >
                #{issue.number} {issue.title}
              </a>
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <UserAvatar user={issue.user} size="sm" />
                <span>{issue.user.login}</span>
              </div>
              <span>•</span>
              <span>opened {formatDateFromIso(issue.created_at)}</span>
              <span>•</span>
              <span>{comments.length} comments</span>
            </div>
          </div>
          <IssueBadge state={issue.state} />
        </div>
      </div>

      {/* Issue Body */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <UserAvatar user={issue.user} size="lg" />
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
              onSave={(content) => handleUpdateIssueBody(content)}
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
                <UserAvatar user={comment.user} size="lg" />
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

        {/* Add new comment form */}
        <CommentForm
          onSubmit={handleCreateComment}
          isSubmitting={isCreatingComment}
        />
      </div>
    </div>
  );
}
