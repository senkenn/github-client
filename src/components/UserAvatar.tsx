interface UserAvatarProps {
  user: {
    login: string;
    avatar_url: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Reusable user avatar component
 */
export function UserAvatar({
  user,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <img
      src={user.avatar_url}
      alt={user.login}
      className={`rounded-full ${sizeClasses[size]} ${className}`}
    />
  );
}
