import { useState } from "react";
import { TiptapEditor } from "./TiptapEditor";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function CommentForm({
  onSubmit,
  isSubmitting = false,
}: CommentFormProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState("");

  const handleSave = async (markdown: string) => {
    try {
      await onSubmit(markdown);
      setContent(""); // Clear content after successful submission
      setIsWriting(false);
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // Keep the form open with content preserved on error
    }
  };

  const handleCancel = () => {
    setContent("");
    setIsWriting(false);
  };

  const handleStartWriting = () => {
    setIsWriting(true);
  };

  if (!isWriting) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4">
          <button
            type="button"
            onClick={handleStartWriting}
            disabled={isSubmitting}
            className="w-full p-4 text-left text-gray-500 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
          >
            Write a comment...
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm text-gray-700">
            Write a comment
          </span>
        </div>
      </div>
      <div className="p-4">
        <TiptapEditor
          content={content}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        {isSubmitting && (
          <div className="mt-2 text-sm text-gray-500">
            Submitting comment...
          </div>
        )}
      </div>
    </div>
  );
}
