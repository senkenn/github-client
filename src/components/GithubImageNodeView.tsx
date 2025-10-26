import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  isGithubAttachmentUrl,
  normalizeGithubAttachmentUrl,
  toProxiedGithubUrl,
} from "../lib/githubAttachmentUtils";

export function GithubImageNodeView({ node, selected }: NodeViewProps) {
  const attrs = node.attrs as Record<string, string | number | null>;
  const srcOrig = String(attrs.src || "");

  let displaySrc = srcOrig;
  if (srcOrig && isGithubAttachmentUrl(srcOrig)) {
    displaySrc = toProxiedGithubUrl(normalizeGithubAttachmentUrl(srcOrig));
  }

  const { alt, title, width, height } = attrs;

  return (
    <NodeViewWrapper
      as="span"
      contentEditable={false}
      data-type="github-image"
      data-selected={selected ? "true" : undefined}
    >
      {/* Don’t inject extra attributes; use only existing ones and computed src */}
      <img
        src={displaySrc}
        alt={alt ? String(alt) : ""}
        title={title ? String(title) : undefined}
        width={width ? Number(width) : undefined}
        height={height ? Number(height) : undefined}
        draggable={false}
      />
    </NodeViewWrapper>
  );
}
