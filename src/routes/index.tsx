import { createFileRoute } from "@tanstack/react-router";
import { useActionState, useCallback, useEffect, useState } from "react";
import { CommentItem } from "./-components/CommentItem";
import type { IssueComment } from "./-components/IssueComments";
import { IssueForm } from "./-components/IssueForm";
import {
  fetchCommentsAction,
  updateComment,
} from "./-functions/commentsAction";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [comments, setComments] = useState<IssueComment[]>([]);

  const [state, action] = useActionState(fetchCommentsAction, {
    owner: "",
    repo: "",
    number: "",
    body: "",
    comments: [],
    error: undefined,
  });
  const { owner, repo, number, comments: fetchedComments } = state;

  useEffect(() => {
    setComments(fetchedComments);
  }, [fetchedComments]);

  const handleUpdateComment = useCallback(
    async (
      commentId: IssueComment["id"],
      updatedBody: IssueComment["body"],
    ) => {
      // APIを呼び出してコメントを更新
      const updatedComment = await updateComment(
        owner,
        repo,
        commentId,
        updatedBody,
      );

      // ローカルのコメントリストを更新
      setComments((prevComments) =>
        prevComments.map(
          (comment) =>
            comment.id === commentId
              ? { ...comment, ...updatedComment }
              : comment, // 更新されたコメントで置き換え
        ),
      );
    },
    [owner, repo],
  ); // 依存配列

  return (
    <>
      <IssueForm action={action} data={state} />
      {state.error && <div className="p-2">Error: {state.error.message}</div>}

      {/** Issue URL */}
      {owner && repo && number && (
        <div className="p-2">
          URL:
          <a
            href={`https://github.com/${owner}/${repo}/issues/${number}`}
            className="p-2 text-blue-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {`https://github.com/${owner}/${repo}/issues/${number}`}
          </a>
        </div>
      )}

      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onUpdateComment={handleUpdateComment}
        />
      ))}
    </>
  );
}
