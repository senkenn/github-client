import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import {
  EditorContent,
  EditorProvider,
  ReactNodeViewRenderer,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import { useCallback, useMemo, useState } from "react";
import { htmlToMarkdown, markdownToHtml } from "../-functions/mdHtmlUtils";
import { CodeBlockComponent } from "./CodeBlockComponent";

const lowlight = createLowlight(all);

const extensions = [
  StarterKit,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent);
    },
  }).configure({ lowlight }),
];

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [content, setContent] = useState(markdownToHtml(comment.body));

  const handleSave = async () => {
    setIsSaving(true);
    setError(undefined);
    try {
      const updatedBody = htmlToMarkdown(content);
      await onUpdateComment(comment.id, updatedBody);
    } catch (err) {
      console.error("コメントの更新に失敗しました:", err);
      setError("コメントの更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    setContent(markdownToHtml(comment.body));
    setError(undefined);
  }, [comment.body]);

  const commentHtml = useMemo(
    () => markdownToHtml(comment.body),
    [comment.body],
  );

  const editor = useEditor({
    extensions,
    content: `
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th colspan="3">Description</th>
        </tr>
        <tr>
          <td>Cyndi Lauper</td>
          <td>Singer</td>
          <td>Songwriter</td>
          <td>Actress</td>
        </tr>
      </tbody>
    </table>
  `,
  });
  return (
    <div>
      <EditorContent editor={editor} />
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
