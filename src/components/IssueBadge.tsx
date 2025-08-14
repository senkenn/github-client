interface IssueBadgeProps {
  state: "open" | "closed";
  size?: "sm" | "md";
  className?: string;
}

/**
 * Reusable issue state badge component
 */
export function IssueBadge({
  state,
  size = "md",
  className = "",
}: IssueBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const colorClasses =
    state === "open"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <span
      className={`rounded-full font-medium ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {state}
    </span>
  );
}
