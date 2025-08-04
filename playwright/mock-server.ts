import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { GitHubComment, GitHubIssue } from "../src/types/github";

const app = new Hono();
app.use("/*", cors());

// モックデータ
const mockIssues: GitHubIssue[] = [
  {
    id: 1,
    number: 123,
    title: "Test Issue 1",
    body: "Test body 1",
    state: "open",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      login: "testuser1",
      avatar_url: "https://example.com/avatar1.png",
    },
    comments: 0,
  },
  {
    id: 2,
    number: 124,
    title: "Test Issue 2",
    body: "Test body 2",
    state: "closed",
    created_at: "2024-01-14T08:15:30Z",
    updated_at: "2024-01-14T08:15:30Z",
    user: {
      login: "testuser2",
      avatar_url: "https://example.com/avatar2.png",
    },
    comments: 2,
  },
];

const mockComments: GitHubComment[] = [
  {
    id: 1,
    body: "This is a test comment",
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
    user: {
      login: "commenter1",
      avatar_url: "https://example.com/commenter1.png",
    },
  },
];

// GitHub API エンドポイントのモック
app.get("/repos/:owner/:repo", (c) => {
  const { owner, repo } = c.req.param();
  return c.json({
    id: 1,
    name: repo,
    full_name: `${owner}/${repo}`,
    owner: {
      login: owner,
    },
  });
});

app.get("/repos/:owner/:repo/issues", (c) => {
  return c.json(mockIssues);
});

app.get("/repos/:owner/:repo/issues/:issue_number", (c) => {
  const issueNumber = parseInt(c.req.param("issue_number"));
  const issue = mockIssues.find((issue) => issue.number === issueNumber);

  if (!issue) {
    return c.json({ message: "Not Found" }, 404);
  }

  return c.json(issue);
});

app.get("/repos/:owner/:repo/issues/:issue_number/comments", (c) => {
  return c.json(mockComments);
});

app.post("/repos/:owner/:repo/issues/:issue_number/comments", async (c) => {
  const body = await c.req.json();
  const newComment: GitHubComment = {
    id: Date.now(),
    body: body.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      login: "test-user",
      avatar_url: "https://example.com/test-user.png",
    },
  };

  return c.json(newComment, 201);
});

const port = Number(process.env.PORT) || 3001;

console.log(`Mock GitHub API server running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down mock server...");
  process.exit(0);
});

export default app;
