import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { parseGitHubLikeQuery } from "../lib/searchParser";

interface FilterBarProps {
  currentState: "open" | "closed" | "all";
  currentSearch: string;
  currentAuthor: string;
  owner?: string;
  repo?: string;
}

export function FilterBar({
  currentState,
  currentSearch,
  currentAuthor,
  owner,
  repo,
}: FilterBarProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [authorInput, setAuthorInput] = useState(currentAuthor);

  const handleFilterChange = (
    newState?: "open" | "closed" | "all",
    newSearch?: string,
    newAuthor?: string,
  ) => {
    navigate({
      to: "/issues",
      search: {
        owner,
        repo,
        state: newState ?? currentState,
        search: newSearch ?? (searchInput || undefined),
        author: newAuthor ?? (authorInput || undefined),
      },
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse GitHub-like query from the main search box
    const parsed = parseGitHubLikeQuery(searchInput);
    // Prefer explicit author input if provided; otherwise use parsed.author
    const author = authorInput || parsed.author;
    const nextSearch = parsed.text ?? "";
    handleFilterChange(parsed.state, nextSearch, author);
  };

  const clearFilters = () => {
    setSearchInput("");
    setAuthorInput("");
    navigate({
      to: "/issues",
      search: {
        owner,
        repo,
        state: "open",
      },
    });
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex space-x-2">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Author"
          value={authorInput}
          onChange={(e) => setAuthorInput(e.target.value)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
        {(searchInput || authorInput || currentState !== "open") && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        )}
      </form>

      {/* State Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {(["open", "closed", "all"] as const).map((state) => (
          <button
            type="button"
            key={state}
            onClick={() => handleFilterChange(state)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentState === state
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {state === "all"
              ? "All"
              : `${state.charAt(0).toUpperCase()}${state.slice(1)}`}{" "}
            Issues
          </button>
        ))}
      </div>

      {/* Active Filters Display */}
      {(currentSearch || currentAuthor) && (
        <div className="flex flex-wrap gap-2">
          {currentSearch && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{currentSearch}"
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  handleFilterChange(undefined, "");
                }}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {currentAuthor && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Author: {currentAuthor}
              <button
                type="button"
                onClick={() => {
                  setAuthorInput("");
                  handleFilterChange(undefined, undefined, "");
                }}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
