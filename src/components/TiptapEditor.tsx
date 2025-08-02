import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

interface TiptapEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function TiptapEditor({ content, onSave, onCancel }: TiptapEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border border-gray-300 rounded-lg",
      },
    },
  });

  const handleSave = () => {
    if (editor) {
      onSave(editor.getHTML());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (editor) {
      editor.commands.setContent(content);
      setIsEditing(false);
    }
    onCancel();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
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
