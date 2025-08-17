import MarkdownIt from "markdown-it";
import TurndownService from "turndown";

/**
 * Converts markdown text to HTML
 */
export function markdownToHtml(markdown: string): string {
  const md = new MarkdownIt();
  const html = md
    .render(markdown)
    // <pre><code...> タグ内の末尾の改行(\n</code>)を削除する
    .replace(/(<pre><code[^>]*>.*?)\n(<\/code><\/pre>)/gs, "$1$2");
  return html;
}

/**
 * Converts HTML text to markdown
 */
export function htmlToMarkdown(html: string): string {
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
      // hasProcessedHeader is reset for each table since this function is called once per table
      let hasProcessedHeader = false;
      let headerCells: Element[] = [];

      // ヘッダー行の処理（theadから探す）
      const thead = table.querySelector("thead");
      if (thead) {
        const headerRow = thead.querySelector("tr");
        if (headerRow) {
          headerCells = Array.from(headerRow.querySelectorAll("th"));
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
          hasProcessedHeader = true;
        }
      }

      // ボディ行の処理
      const tbody = table.querySelector("tbody");
      if (tbody) {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        for (const row of rows) {
          // 最初の行にthが含まれている場合はヘッダー行として処理
          const thCells = Array.from(row.querySelectorAll("th"));
          const tdCells = Array.from(row.querySelectorAll("td"));

          if (thCells.length > 0 && !hasProcessedHeader) {
            // tbody内のthをヘッダーとして処理
            markdown += "|";
            for (const cell of thCells) {
              markdown += ` ${cell.textContent || ""} |`;
            }
            markdown += "\n|";

            // アラインメント行の処理
            for (const cell of thCells) {
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
            hasProcessedHeader = true;
          } else if (tdCells.length > 0) {
            // 通常のデータ行として処理
            markdown += "|";
            for (const cell of tdCells) {
              markdown += ` ${cell.textContent || ""} |`;
            }
            markdown += "\n";
          }
        }
      }

      return markdown;
    },
  });

  let markdown = turndownService
    .turndown(html)
    // Trim trailing spaces and normalize line endings
    // example: `hello  ` -> `hello`
    .replace(/[ ]+$/gm, "")
    // Convert 4-space indentation to 2-space for unordered lists
    // example: `    - ` -> `  - `
    .replace(/^[ ]{4}(-\s)/gm, "  $1")
    // Convert 4-space indentation to 3-space for ordered lists
    // example: `    1. ` -> `   1. `
    .replace(/^[ ]{4}(\d+\.\s)/gm, "   $1")
    // Normalize unordered list spacing: ensure single space after bullet
    // example: `-  item` -> `- item`
    .replace(/^(\s*)-\s+/gm, "$1- ")
    // Normalize ordered list spacing: ensure single space after number
    // example: `1.  item` -> `1. item`
    .replace(/^(\s*)(\d+)\.\s+/gm, "$1$2. ");

  // Handle mixed nested lists by checking context
  const lines = markdown.split("\n");
  let inOrderedList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're in an ordered list context
    if (/^\d+\.\s/.test(line)) {
      inOrderedList = true;
    } else if (line.trim() === "" || /^[^\s]/.test(line)) {
      inOrderedList = false;
    }

    // If we're in an ordered list context and this is a nested unordered list item
    if (inOrderedList && /^[ ]{2}-\s/.test(line)) {
      lines[i] = line.replace(/^[ ]{2}/, "   ");
    }
  }
  markdown = lines.join("\n");

  return markdown;
}
