export type IssueState = "open" | "closed" | "all";

export interface ParsedQuery {
  text?: string;
  state?: IssueState;
  author?: string;
}

/**
 * Parse a GitHub-like issues search query.
 * Supports minimal qualifiers:
 * - is:open | is:closed | is:issue (ignored) | is:pr (ignored)
 * - author:<login>
 * Any remaining words become free-text `text`.
 */
export function parseGitHubLikeQuery(
  input: string | undefined | null,
): ParsedQuery {
  if (!input) return {};
  const parts = tokenize(input);
  let state: IssueState | undefined;
  let author: string | undefined;
  const textParts: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const token = parts[i];
    const lower = token.toLowerCase();
    if (lower.startsWith("is:")) {
      const val = lower.slice(3);
      if (val === "open" || val === "closed" || val === "all") {
        state = val;
        continue;
      }
      // Ignore is:issue / is:pr like GitHub, since we already filter out PRs
      if (val === "issue" || val === "pr" || val === "pull-request") {
        continue;
      }
    }
    if (lower === "author:" || lower.startsWith("author:")) {
      let val = token.slice(7); // after 'author:'
      if (!val && i + 1 < parts.length) {
        // value is in the next token (quoted or not)
        i += 1;
        val = parts[i];
      }
      if (val) {
        author = stripQuotes(val);
        continue;
      }
    }
    textParts.push(stripQuotes(token));
  }

  const text = textParts.join(" ").trim();
  return {
    state,
    author,
    text: text.length ? text : undefined,
  };
}

/** Tokenize respecting simple quoted phrases */
function tokenize(q: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuotes: '"' | "'" | null = null;
  for (let i = 0; i < q.length; i++) {
    const ch = q[i];
    if (inQuotes) {
      if (ch === inQuotes) {
        inQuotes = null;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      // start quoted
      if (current) {
        tokens.push(current);
        current = "";
      }
      inQuotes = ch as '"' | "'";
      continue;
    }
    if (ch === " ") {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function stripQuotes(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}
