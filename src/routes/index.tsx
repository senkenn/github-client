import { createFileRoute } from "@tanstack/react-router";
import { useActionState, useCallback } from "react";
import { CommentItem } from "./-components/CommentItem";
import type { IssueComment } from "./-components/CommentItem";
import { IssueForm } from "./-components/IssueForm";
import {
  fetchCommentsAction,
  updateComment,
} from "./-functions/commentsAction";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [state, action] = useActionState(fetchCommentsAction, {
    owner: "senkenn",
    repo: "dotfiles",
    number: "1",
    body: "",
    comments: [],
    error: undefined,
  });
  const { owner, repo, number, comments: fetchedComments } = state;

  // TODO: コメント編集して 再 fetch してもコメントが更新されない

  const handleUpdateComment = useCallback(
    async (
      commentId: IssueComment["id"],
      updatedBody: IssueComment["body"],
    ) => {
      await updateComment(owner, repo, commentId, updatedBody);
    },
    [owner, repo],
  );

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

      {fetchedComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onUpdateComment={handleUpdateComment}
        />
      ))}

      {/* TODO: コメント追加の場合 */}
    </>
  );
}
