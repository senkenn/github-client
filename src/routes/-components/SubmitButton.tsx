import { useFormStatus } from "react-dom";

export function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`bg-blue-500 text-white p-2 rounded ${className}`}
    >
      {pending ? "Fetching..." : "Fetch Comments"}
    </button>
  );
}
