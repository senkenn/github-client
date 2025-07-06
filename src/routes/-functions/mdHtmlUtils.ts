import MarkdownIt from "markdown-it";
import TurndownService from "turndown";
// @ts-ignore // TODO: 型定義を追加する
// import { tables } from "turndown-plugin-gfm";

export function markdownToHtml(markdown: string): string {
  const md = new MarkdownIt();
  const html = md
    .render(markdown)
    // <pre><code...> タグ内の末尾の改行(\n</code>)を削除する
    .replace(/(<pre><code[^>]*>.*?)\n(<\/code><\/pre>)/gs, "$1$2");
  return html;
}

export function htmlToMarkdown(html: string): string {
  console.log(html);

  // TODO: html -> markdown の変換に使っている Turndown のオプションを調整できるようにする
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  // カスタムテーブルルールを追加
  turndownService.addRule("tables", {
    filter: "table",
    replacement: (_content, node) => {
      const table = node as HTMLTableElement;
      let markdown = "\n";

      // ヘッダー行の処理
      const thead = table.querySelector("thead");
      if (thead) {
        const headerRow = thead.querySelector("tr");
        if (headerRow) {
          const headerCells = Array.from(headerRow.querySelectorAll("th"));
          markdown += "|";
          for (const cell of headerCells) {
            markdown += ` ${cell.textContent || ""} |`;
          }
          markdown += "\n|";

          // アラインメント行の処理
          for (const cell of headerCells) {
            const style = cell.getAttribute("style") || "";
            let align = " --- ";
            if (style.includes("text-align:left")) {
              align = " :--- ";
            } else if (style.includes("text-align:center")) {
              align = " :---: ";
            } else if (style.includes("text-align:right")) {
              align = " ---: ";
            }
            markdown += `${align}|`;
          }
          markdown += "\n";
        }
      }

      // ボディ行の処理
      const tbody = table.querySelector("tbody");
      if (tbody) {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll("td"));
          markdown += "|";
          for (const cell of cells) {
            markdown += ` ${cell.textContent || ""} |`;
          }
          markdown += "\n";
        }
      }

      return markdown;
    },
  });

  const markdown = turndownService.turndown(html);
  // // Replace "-   " at the beginning of lines with "- " to fix extra spacing
  // .replace(/^- {3}/gm, "- ")
  // // Normalize nested list indent to two spaces
  // .replace(/^ {4}-\s+/gm, "  - ")
  // // Normalize ordered list spacing: convert '1.  ' to '1. '
  // .replace(/^(\d+)\.\s{2}/gm, "$1. ");
  console.log("markdown", markdown); // TODO: ロガーを使う
  return markdown;
}
