import type { Editor } from "@tiptap/react";

export const MenuBar = ({ editor }: { editor: Editor }) => (
  <div style={{ border: "1px solid #ccc", padding: "8px" }}>
    <button
      onClick={() =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
      }
      type="button"
    >
      Insert Table
    </button>
    <button
      onClick={() => editor.chain().focus().addColumnBefore().run()}
      type="button"
    >
      Add Column Before
    </button>
    <button
      onClick={() => editor.chain().focus().addColumnAfter().run()}
      type="button"
    >
      Add Column After
    </button>
    <button
      onClick={() => editor.chain().focus().deleteColumn().run()}
      type="button"
    >
      Delete Column
    </button>
    <button
      onClick={() => editor.chain().focus().addRowBefore().run()}
      type="button"
    >
      Add Row Before
    </button>
    <button
      onClick={() => editor.chain().focus().addRowAfter().run()}
      type="button"
    >
      Add Row After
    </button>
    <button
      onClick={() => editor.chain().focus().deleteRow().run()}
      type="button"
    >
      Delete Row
    </button>
    <button
      onClick={() => editor.chain().focus().deleteTable().run()}
      type="button"
    >
      Delete Table
    </button>
    <button
      onClick={() => editor.chain().focus().mergeCells().run()}
      type="button"
    >
      Merge Cells
    </button>
    <button
      onClick={() => editor.chain().focus().splitCell().run()}
      type="button"
    >
      Split Cell
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
      type="button"
    >
      Toggle Header Column
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      type="button"
    >
      Toggle Header Row
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeaderCell().run()}
      type="button"
    >
      Toggle Header Cell
    </button>
    <button
      onClick={() => editor.chain().focus().mergeOrSplit().run()}
      type="button"
    >
      Merge or Split
    </button>
    <button
      onClick={() =>
        editor.chain().focus().setCellAttribute("colspan", 2).run()
      }
      type="button"
    >
      Set Cell Attribute
    </button>
    <button
      onClick={() => editor.chain().focus().fixTables().run()}
      type="button"
    >
      Fix Tables
    </button>
    <button
      onClick={() => editor.chain().focus().goToNextCell().run()}
      type="button"
    >
      Go to Next Cell
    </button>
    <button
      onClick={() => editor.chain().focus().goToPreviousCell().run()}
      type="button"
    >
      Go to Previous Cell
    </button>
  </div>
);

export const MenuItem = ({ children }: { children: React.ReactNode }) => (
  <div style={{ border: "1px solid #ccc", padding: "8px", marginRight: "8px" }}>
    {children}
  </div>
);
