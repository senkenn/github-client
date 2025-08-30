import {
  githubAttachmentRegex,
  isGithubAttachmentUrl,
  normalizeGithubAttachmentUrl,
} from "./githubAttachmentUtils";

describe("githubAttachmentUtils", () => {
  it("matches GitHub user-attachments URLs", () => {
    const url =
      "https://github.com/user-attachments/assets/dceb430a-7e82-42b0-83e9-b623d15b32b0";
    expect(isGithubAttachmentUrl(url)).toBe(true);
    expect(githubAttachmentRegex.test(url)).toBe(true);
  });

  it("does not match non-attachment URLs", () => {
    const urls = [
      "https://github.com/owner/repo",
      "https://avatars.githubusercontent.com/u/1?v=4",
      "https://raw.githubusercontent.com/owner/repo/main/file.png",
    ];
    for (const u of urls) {
      expect(isGithubAttachmentUrl(u)).toBe(false);
    }
  });

  it("adds ?download=1 if missing", () => {
    const base =
      "https://github.com/user-attachments/assets/dceb430a-7e82-42b0-83e9-b623d15b32b0";
    expect(normalizeGithubAttachmentUrl(base)).toBe(`${base}?download=1`);
  });

  it("appends &download=1 when query exists", () => {
    const withQuery =
      "https://github.com/user-attachments/assets/dceb430a-7e82-42b0-83e9-b623d15b32b0?foo=bar";
    expect(normalizeGithubAttachmentUrl(withQuery)).toBe(
      `${withQuery}&download=1`,
    );
  });

  it("keeps download=1 when already present", () => {
    const withDownload =
      "https://github.com/user-attachments/assets/dceb430a-7e82-42b0-83e9-b623d15b32b0?download=1";
    expect(normalizeGithubAttachmentUrl(withDownload)).toBe(withDownload);
  });
});
