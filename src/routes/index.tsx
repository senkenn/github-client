import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { checkRepositoryExists } from "../lib/github";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (owner && repo) {
      setError("");
      setIsLoading(true);

      try {
        const exists = await checkRepositoryExists(owner, repo);
        if (exists) {
          navigate({ to: "/issues", search: { owner, repo } });
        } else {
          setError(`リポジトリ "${owner}/${repo}" が見つかりません。`);
        }
      } catch (err) {
        setError("リポジトリの確認中にエラーが発生しました。");
        console.error("Repository check error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          GitHub Issues Viewer
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="owner"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Owner
            </label>
            <input
              type="text"
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="例: microsoft"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="repo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Repository
            </label>
            <input
              type="text"
              id="repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="例: vscode"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "確認中..." : "Issues を表示"}
          </button>
        </form>
      </div>
    </div>
  );
}
