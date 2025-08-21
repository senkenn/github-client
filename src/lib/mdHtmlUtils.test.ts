import { htmlToMarkdown, markdownToHtml } from "./mdHtmlUtils";

describe("markdown ↔ html roundtrip", () => {
  const cases = [
    {
      description: "heading and paragraph",
      markdown: `# Hello World

This is a test.`,
    },
    {
      description: "code block without language",
      markdown: `\`\`\`
console.log('Hello, world!');
\`\`\``,
    },
    {
      description: "code block with language",
      markdown: `\`\`\`js
console.log('Hello, world!');
\`\`\``,
    },
    {
      description: "ordered list",
      markdown: `1. Item 1
2. Item 2
3. Item 3`,
    },
    {
      description: "unordered list",
      markdown: `- Item 1
- Item 2
- Item 3`,
    },
    {
      description: "nested unordered list",
      markdown: `- Item 1
  - Nested Item 1
  - Nested Item 2
- Item 2
  - Nested Item 3`,
    },
    {
      description: "nested ordered list",
      markdown: `1. Item 1
   1. Nested Item 1
   2. Nested Item 2
2. Item 2
   1. Nested Item 3`,
    },
    {
      description: "mixed nested list",
      markdown: `1. Item 1
   - Nested Item 1
   - Nested Item 2
2. Item 2
   - Nested Item 3`,
    },
    {
      description: "simple table",
      markdown: `| Name | Age |
| --- | --- |
| John | 25 |
| Jane | 30 |`,
    },
    {
      description: "table with alignment",
      markdown: `| Left | Center | Right |
| :--- | :---: | ---: |
| L1 | C1 | R1 |
| L2 | C2 | R2 |`,
    },
  ];

  it.each(cases)("should roundtrip $description", ({ markdown }) => {
    const html = markdownToHtml(markdown);
    const result = htmlToMarkdown(html);
    expect(result).toBe(markdown);
  });
});

describe("markdown/html edge cases", () => {
  it("should handle empty input", () => {
    expect(markdownToHtml("")).toBe("");
    expect(htmlToMarkdown("")).toBe("");
  });

  it("should handle inline code", () => {
    const markdown = "Use `console.log()` for debugging";
    const html = markdownToHtml(markdown);
    const result = htmlToMarkdown(html);
    expect(result).toBe(markdown);
  });

  it("should handle links", () => {
    const markdown = "[GitHub](https://github.com)";
    const html = markdownToHtml(markdown);
    const result = htmlToMarkdown(html);
    expect(result).toBe(markdown);
  });

  it("should handle bold and italic text", () => {
    const markdown = "**bold** and *italic* text";
    const html = markdownToHtml(markdown);
    const result = htmlToMarkdown(html);
    // Turndown converts * to _ for italics
    expect(result).toBe("**bold** and _italic_ text");
  });

  it("should remove trailing newlines from code blocks", () => {
    const markdown = "```\ncode\n```";
    const html = markdownToHtml(markdown);
    // Should not contain \n</code>
    expect(html).not.toMatch(/\n<\/code><\/pre>/);
    expect(html).toContain("<pre><code>code</code></pre>");
  });

  it("should handle empty code blocks", () => {
    const markdown = "```\n```";
    const html = markdownToHtml(markdown);
    const result = htmlToMarkdown(html);
    // Empty code blocks get converted to empty string by turndown
    expect(result).toBe("");
  });

  it("should handle multiple tables in the same HTML correctly", () => {
    // Test case to verify that hasProcessedHeader is properly reset between tables
    const htmlWithMultipleTables = `
      <table>
        <thead>
          <tr><th>Header1</th><th>Header2</th></tr>
        </thead>
        <tbody>
          <tr><td>Data1</td><td>Data2</td></tr>
        </tbody>
      </table>
      
      <p>Some text between tables</p>
      
      <table>
        <thead>
          <tr><th>Name</th><th>Age</th></tr>
        </thead>
        <tbody>
          <tr><td>Alice</td><td>25</td></tr>
        </tbody>
      </table>
    `;

    const result = htmlToMarkdown(htmlWithMultipleTables);

    // Both tables should have proper headers
    expect(result).toContain("| Header1 | Header2 |");
    expect(result).toContain("| Data1 | Data2 |");
    expect(result).toContain("| Name | Age |");
    expect(result).toContain("| Alice | 25 |");

    // Count the number of header separator lines (should be 2, one for each table)
    const headerSeparatorLines = result.match(/\|\s*---\s*\|\s*---\s*\|/g);
    expect(headerSeparatorLines).toHaveLength(2);
  });

  it("should handle multiple tables with tbody-only headers correctly", () => {
    // Test edge case where tables use th in tbody instead of thead
    const htmlWithMultipleTables = `
      <table>
        <tbody>
          <tr><th>First</th><th>Second</th></tr>
          <tr><td>A</td><td>B</td></tr>
        </tbody>
      </table>
      
      <table>
        <tbody>
          <tr><th>Name</th><th>Value</th></tr>
          <tr><td>Test</td><td>123</td></tr>
        </tbody>
      </table>
    `;

    const result = htmlToMarkdown(htmlWithMultipleTables);

    // Both tables should have proper headers processed
    expect(result).toContain("| First | Second |");
    expect(result).toContain("| A | B |");
    expect(result).toContain("| Name | Value |");
    expect(result).toContain("| Test | 123 |");

    // Count the number of header separator lines (should be 2, one for each table)
    const headerSeparatorLines = result.match(/\|\s*---\s*\|\s*---\s*\|/g);
    expect(headerSeparatorLines).toHaveLength(2);
  });
});
