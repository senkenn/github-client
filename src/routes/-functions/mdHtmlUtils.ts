import MarkdownIt from "markdown-it";
import TurndownService from "turndown";

export function markdownToHtml(markdown: string): string {
  const md = new MarkdownIt();
  const html = md
    .render(markdown)
    // <pre><code...> タグ内の末尾の改行(\n</code>)を削除する
    .replace(/(<pre><code[^>]*>.*?)\n(<\/code><\/pre>)/gs, "$1$2");
  return html;
}

export function htmlToMarkdown(html: string): string {
  // TODO: html -> markdown の変換に使っている Turndown のオプションを調整できるようにする
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });
  const markdown = turndownService
    .turndown(html)
    // Replace "-   " at the beginning of lines with "- " to fix extra spacing
    .replace(/^- {3}/gm, "- ");
  console.debug("markdown", markdown); // TODO: ロガーを使う
  return markdown;
}
