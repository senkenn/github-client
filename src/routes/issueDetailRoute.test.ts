import { describe, expect, it } from "vitest";
import { Route } from "./issues.$issueNumber";

// Test the search parameter validation for issue detail route
describe("Issue Detail Route Search Validation", () => {
  // Get the validateSearch function from the route
  const validateSearch = (Route as any).options.validateSearch;

  it("should validate owner and repo parameters", () => {
    const result = validateSearch({
      owner: "testowner",
      repo: "testrepo",
    });

    expect(result).toEqual({
      owner: "testowner",
      repo: "testrepo",
      state: undefined,
      search: undefined,
      author: undefined,
    });
  });

  it("should validate state parameter correctly", () => {
    const result = validateSearch({
      owner: "testowner",
      repo: "testrepo",
      state: "open",
    });

    expect(result).toEqual({
      owner: "testowner",
      repo: "testrepo",
      state: "open",
      search: undefined,
      author: undefined,
    });
  });

  it("should validate all valid state values", () => {
    const states = ["open", "closed", "all"];
    
    for (const state of states) {
      const result = validateSearch({
        owner: "testowner",
        repo: "testrepo",
        state,
      });

      expect(result.state).toBe(state);
    }
  });

  it("should reject invalid state values", () => {
    const result = validateSearch({
      owner: "testowner",
      repo: "testrepo",
      state: "invalid",
    });

    expect(result.state).toBeUndefined();
  });

  it("should validate search and author parameters", () => {
    const result = validateSearch({
      owner: "testowner",
      repo: "testrepo",
      search: "bug",
      author: "user123",
    });

    expect(result).toEqual({
      owner: "testowner",
      repo: "testrepo",
      state: undefined,
      search: "bug",
      author: "user123",
    });
  });

  it("should handle all parameters together", () => {
    const result = validateSearch({
      owner: "senkenn",
      repo: "github-client",
      state: "open",
      search: "bug fix",
      author: "testuser",
    });

    expect(result).toEqual({
      owner: "senkenn",
      repo: "github-client",
      state: "open",
      search: "bug fix",
      author: "testuser",
    });
  });

  it("should handle non-string values gracefully", () => {
    const result = validateSearch({
      owner: 123,
      repo: null,
      state: true,
      search: ["invalid"],
      author: { invalid: "object" },
    });

    expect(result).toEqual({
      owner: undefined,
      repo: undefined,
      state: undefined,
      search: undefined,
      author: undefined,
    });
  });
});