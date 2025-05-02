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
  const turndownService = new TurndownService();
  const markdown = turndownService.turndown(html);
  return markdown;
}
