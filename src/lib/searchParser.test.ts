import { describe, expect, it } from "vitest";
import { parseGitHubLikeQuery } from "./searchParser";

describe("parseGitHubLikeQuery", () => {
  it("returns empty object for empty input", () => {
    expect(parseGitHubLikeQuery("")).toEqual({});
    expect(parseGitHubLikeQuery(undefined)).toEqual({});
    expect(parseGitHubLikeQuery(null as unknown as string)).toEqual({});
  });

  it("parses is:open and free text", () => {
    expect(parseGitHubLikeQuery("is:open login bug")).toEqual({
      state: "open",
      text: "login bug",
    });
  });

  it("parses is:closed and author qualifier", () => {
    expect(parseGitHubLikeQuery("is:closed author:alice flaky test")).toEqual({
      state: "closed",
      author: "alice",
      text: "flaky test",
    });
  });

  it("ignores is:issue and is:pr while keeping text", () => {
    expect(parseGitHubLikeQuery("is:issue is:pr crash on start")).toEqual({
      text: "crash on start",
    });
  });

  it("supports quoted text and quoted author", () => {
    expect(
      parseGitHubLikeQuery('is:open author:"Some User" "exact phrase"'),
    ).toEqual({
      state: "open",
      author: "Some User",
      text: "exact phrase",
    });
  });

  it("supports author: followed by separate token", () => {
    expect(parseGitHubLikeQuery("is:open author: bob crash")).toEqual({
      state: "open",
      author: "bob",
      text: "crash",
    });
  });

  it("parses state all", () => {
    expect(parseGitHubLikeQuery("is:all slow build")).toEqual({
      state: "all",
      text: "slow build",
    });
  });
});
