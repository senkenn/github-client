import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import { useState } from "react";
import { htmlToMarkdown, markdownToHtml } from "../lib/mdHtmlUtils";
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

interface TiptapEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  autoEdit?: boolean;
}

export function TiptapEditor({
  content,
  onSave,
  onCancel,
  autoEdit = false,
}: TiptapEditorProps) {
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [hasChanges, setHasChanges] = useState(false);

  const editor = useEditor({
    extensions,
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border border-gray-300 rounded-lg",
      },
    },
    onUpdate: ({ editor }) => {
      // Check if content has changed from original
      const currentContent = htmlToMarkdown(editor.getHTML());
      setHasChanges(currentContent.trim() !== content.trim());
    },
  });

  const handleSave = () => {
    if (editor) {
      onSave(htmlToMarkdown(editor.getHTML()));
      setIsEditing(false);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    if (editor) {
      editor.commands.setContent(markdownToHtml(content));
      setIsEditing(false);
      setHasChanges(false);
    }
    onCancel();
  };

  if (!editor) {
    return null;
  }

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white"
      data-testid="tiptap-editor"
    >
      {isEditing && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive("bold")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive("italic")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive("code")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Code
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive("bulletList")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              •
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded text-sm ${
                hasChanges
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <EditorContent editor={editor} />

        {!isEditing && (
          <button
            type="button"
            className="absolute inset-0 bg-transparent cursor-pointer"
            onClick={() => setIsEditing(true)}
            aria-label="編集を開始"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Edit
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
