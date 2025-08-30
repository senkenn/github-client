/**
 * Utilities for handling GitHub user-attachments URLs.
 */

// Example: https://github.com/user-attachments/assets/dceb430a-7e82-42b0-83e9-b623d15b32b0
export const githubAttachmentRegex =
  /https:\/\/github\.com\/user-attachments\/assets\/[a-zA-Z0-9-]+/;

/**
 * Returns true if the URL looks like a GitHub user-attachments asset URL.
 */
export function isGithubAttachmentUrl(url: string): boolean {
  return githubAttachmentRegex.test(url);
}

/**
 * Add `download=1` to the URL to encourage a direct asset redirect, which
 * works more reliably for <img src> without triggering CORS errors.
 */
export function normalizeGithubAttachmentUrl(url: string): string {
  if (!isGithubAttachmentUrl(url)) return url;

  const hasDownload = /[?&]download=1(?!\d)/.test(url);
  if (hasDownload) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}download=1`;
}
