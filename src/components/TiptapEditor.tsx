import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import { useRef, useState } from "react";
import { uploadImage } from "../lib/github";
import { htmlToMarkdown, markdownToHtml } from "../lib/mdHtmlUtils";
import { CodeBlockComponent } from "./CodeBlockComponent";

const lowlight = createLowlight(all);

const extensions = [
  StarterKit,
  Image,
  Table,
  TableRow,
  TableHeader,
  TableCell,
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
}

export function TiptapEditor({ content, onSave, onCancel }: TiptapEditorProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [isTableActive, setIsTableActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions,
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border border-gray-300 rounded-lg",
      },
      handlePaste: (_view, event, _slice) => {
        // Handle image paste from clipboard
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") === 0) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                handleImageFromClipboard(file);
              }
              return true; // Prevent default paste behavior
            }
          }
        }
        return false; // Allow default paste behavior for non-images
      },
    },
    onUpdate: ({ editor }) => {
      // Check if content has changed from original
      const currentContent = htmlToMarkdown(editor.getHTML());
      setHasChanges(currentContent.trim() !== content.trim());

      // Check if cursor is in a table
      const tableActive = editor.isActive("table");
      setIsTableActive(tableActive);
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if cursor is in a table
      const tableActive = editor.isActive("table");
      setIsTableActive(tableActive);
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      try {
        const imageUrl = await uploadImage(file);
        editor
          .chain()
          .focus()
          .setImage({ src: imageUrl, alt: file.name })
          .run();
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageFromClipboard = async (file: File) => {
    if (editor) {
      try {
        const imageUrl = await uploadImage(file);
        editor
          .chain()
          .focus()
          .setImage({ src: imageUrl, alt: `pasted-image-${Date.now()}` })
          .run();
      } catch (error) {
        console.error("Failed to upload clipboard image:", error);
      }
    }
  };

  const handleSave = () => {
    if (editor) {
      onSave(htmlToMarkdown(editor.getHTML()));
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    if (editor) {
      editor.commands.setContent(markdownToHtml(content));
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
      {
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
            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
              title="Insert Table"
            >
              Table
            </button>
            {isTableActive && (
              <>
                <div className="h-6 w-px bg-gray-400 mx-2"></div>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
                  title="Add Row"
                >
                  +Row
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="px-2 py-1 rounded text-xs bg-orange-200 text-orange-700 hover:bg-orange-300"
                  title="Delete Row"
                >
                  -Row
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
                  title="Add Column"
                >
                  +Col
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="px-2 py-1 rounded text-xs bg-orange-200 text-orange-700 hover:bg-orange-300"
                  title="Delete Column"
                >
                  -Col
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="px-2 py-1 rounded text-xs bg-red-200 text-red-700 hover:bg-red-300"
                  title="Delete Table"
                >
                  ×Table
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              📷
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
              disabled={!hasChanges}
              className={`px-4 py-2 rounded text-sm ${
                hasChanges
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      }

      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
    </div>
  );
}
