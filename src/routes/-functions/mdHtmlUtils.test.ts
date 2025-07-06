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
      markdown: `1.  Item 1
2.  Item 2
3.  Item 3`,
    },
    {
      description: "unordered list",
      markdown: `-   Item 1
-   Item 2
-   Item 3`,
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
