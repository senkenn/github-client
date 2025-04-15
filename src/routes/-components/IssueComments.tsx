import { EditorProvider, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MarkdownIt from "markdown-it";
import { useEffect, useMemo, useState } from "react";

export type IssueParams = {
  owner: string;
  repo: string;
  number: string;
  body: string;
  comments: string[];
  error?: Error;
};

type IssueCommentsProps = {
  issueBody: string;
  issueComments: string[];
};

// define your extension array
const extensions = [StarterKit];

// Helper function to convert Markdown to HTML
const markdownToHtml = (markdown: string): string => {
  const md = new MarkdownIt();
  return md.render(markdown);
};

export function IssueComments({
  issueBody,
  issueComments,
}: IssueCommentsProps) {
  // Convert markdown to HTML for the issue body
  const bodyHtml = useMemo(
    () => (issueBody ? markdownToHtml(issueBody) : ""),
    [issueBody]
  );
  const commentsHtml = useMemo(
    () => issueComments.map((comment) => markdownToHtml(comment)),
    [issueComments]
  );

  // States to manage the edited comments
  const [editedComments, setEditedComments] = useState<string[]>([
    ...issueComments,
  ]);
  const [originalComments, setOriginalComments] = useState<string[]>([
    ...issueComments,
  ]);
  const [editingIndices, setEditingIndices] = useState<Set<number>>(new Set());

  // States to manage the edited issue body
  const [editedBody, setEditedBody] = useState<string>(issueBody);
  const [originalBody, setOriginalBody] = useState<string>(issueBody);
  const [isEditingBody, setIsEditingBody] = useState<boolean>(false);

  // issueCommentsとissueBodyが変わったときに状態を更新する
  useEffect(() => {
    setEditedComments([...issueComments]);
    setOriginalComments([...issueComments]);
    // 編集中のインデックスもリセット
    setEditingIndices(new Set());

    // Issue bodyの状態もリセット
    setEditedBody(issueBody);
    setOriginalBody(issueBody);
    setIsEditingBody(false);
  }, [issueComments, issueBody]);

  const handleCommentChange = (index: number, value: string) => {
    const newComments = [...editedComments];
    newComments[index] = value;
    setEditedComments(newComments);
    setEditingIndices(new Set(editingIndices.add(index)));
  };

  const handleBodyChange = (value: string) => {
    setEditedBody(value);
    setIsEditingBody(true);
  };

  const handleSave = (index: number) => {
    const newOriginalComments = [...originalComments];
    newOriginalComments[index] = editedComments[index];
    setOriginalComments(newOriginalComments);

    const newEditingIndices = new Set(editingIndices);
    newEditingIndices.delete(index);
    setEditingIndices(newEditingIndices);

    // ここに実際の保存処理を追加する（例：APIリクエスト）
    console.log(`Saved comment ${index}:`, editedComments[index]);
  };

  const handleCancel = (index: number) => {
    const newEditedComments = [...editedComments];
    newEditedComments[index] = originalComments[index];
    setEditedComments(newEditedComments);

    const newEditingIndices = new Set(editingIndices);
    newEditingIndices.delete(index);
    setEditingIndices(newEditingIndices);
  };

  const handleSaveBody = () => {
    setOriginalBody(editedBody);
    setIsEditingBody(false);

    // ここに実際の保存処理を追加する（例：APIリクエスト）
    console.log(`Saved issue body:`, editedBody);
  };

  const handleCancelBody = () => {
    setEditedBody(originalBody);
    setIsEditingBody(false);
  };

  return (
    <>
      {/** Issue body */}
      {issueBody && (
        <div className="m-2 border border-gray-300 rounded p-2 font-mono bg-gray-100">
          <EditorProvider extensions={extensions} content={bodyHtml}>
            <FloatingMenu editor={null}>This is the floating menu</FloatingMenu>
          </EditorProvider>
        </div>
      )}
      {editedBody && (
        <div className="m-2">
          <div
            contentEditable="true"
            className="border border-gray-300 rounded p-2 font-mono bg-gray-100 w-full whitespace-pre-wrap"
            suppressContentEditableWarning={true}
            onInput={(e) => handleBodyChange(e.currentTarget.textContent || "")}
          >
            {editedBody}
          </div>

          {isEditingBody && (
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleCancelBody}
              >
                キャンセル
              </button>
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSaveBody}
              >
                保存
              </button>
            </div>
          )}
        </div>
      )}

      {/** Issue comments */}
      {commentsHtml.map((commentHtml, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded m-2 p-2 font-mono bg-gray-100 w-full whitespace-pre-wrap"
        >
          <EditorProvider extensions={extensions} content={commentHtml}>
            <FloatingMenu editor={null}>This is the floating menu</FloatingMenu>
          </EditorProvider>
        </div>
      ))}
      {editedComments.map((comment, index) => (
        <div key={index} className="m-2">
          <div
            contentEditable="true"
            className="border border-gray-300 rounded p-2 font-mono bg-gray-100 w-full whitespace-pre-wrap"
            suppressContentEditableWarning={true}
            onInput={(e) =>
              handleCommentChange(index, e.currentTarget.textContent || "")
            }
          >
            {comment}
          </div>

          {editingIndices.has(index) && (
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => handleCancel(index)}
              >
                キャンセル
              </button>
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleSave(index)}
              >
                保存
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
