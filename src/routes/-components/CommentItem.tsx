import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { EditorProvider, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import MarkdownIt from "markdown-it";
import { useMemo, useState } from "react";
import { CodeBlockComponent } from "./CodeBlockComponent";

const lowlight = createLowlight(all);

const extensions = [
  StarterKit,
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent);
    },
  }).configure({ lowlight }),
];

const markdownToHtml = (markdown: string): string => {
  const md = new MarkdownIt();
  const html = md
    .render(markdown)
    // <pre><code...> タグ内の末尾の改行(\n</code>)を削除する
    .replace(/(<pre><code[^>]*>.*?)\n(<\/code><\/pre>)/gs, "$1$2");
  return html;
};

export type IssueComment = {
  id: number;
  body: string;
};

export type IssueParams = {
  owner: string;
  repo: string;
  number: string;
  body: string;
  comments: IssueComment[];
  error?: Error;
};

type CommentItemProps = {
  comment: IssueComment;
  onUpdateComment: (id: number, updatedBody: string) => Promise<void>;
};

export function CommentItem({ comment, onUpdateComment }: CommentItemProps) {
  const [editedBody, setEditedBody] = useState(comment.body);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<any>(undefined);
  const [content, setContent] = useState(markdownToHtml(comment.body));

  const handleSave = async () => {
    setIsSaving(true);
    setError(undefined);
    try {
      await onUpdateComment(comment.id, editedBody);
    } catch (err) {
      console.error("コメントの更新に失敗しました:", err);
      setError("コメントの更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedBody(comment.body); // 編集内容を元に戻す
    setError(undefined);
  };

  const commentHtml = useMemo(
    () => markdownToHtml(comment.body),
    [comment.body],
  );

  return (
    <div>
      <div
        key={comment.id}
        className="border border-gray-300 rounded m-2 p-2 font-mono bg-gray-100 whitespace-pre-wrap"
      >
        <EditorProvider
          extensions={extensions}
          content={content}
          onUpdate={({ editor }) => setContent(editor.getHTML())}
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || content === commentHtml} // 保存中または変更がない場合は無効
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
