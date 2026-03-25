"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import type { Components } from "react-markdown";
import { MermaidDiagram } from "./MermaidDiagram";

interface RichContentProps {
  content: string;
  isStreaming?: boolean;
}

/** True when the code block content looks like a markdown table or rich text */
function looksLikeMarkdown(code: string): boolean {
  const lines = code.trim().split("\n").filter(Boolean);
  const tableLines = lines.filter((l) => l.trim().startsWith("|"));
  return tableLines.length >= 2;
}

// Mermaid diagrams are often returned by the AI without an explicit ```mermaid
// language tag — just a bare code fence or ```flowchart. Detect by the first
// non-whitespace keyword of the block so they still render correctly.
const MERMAID_KEYWORDS =
  /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|xychart-beta|block-beta|architecture-beta)\b/i;

function looksLikeMermaid(code: string): boolean {
  return MERMAID_KEYWORDS.test(code.trimStart());
}

function buildComponents(isStreaming: boolean): Components {
  return {
  // Syntax-highlighted code blocks
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const code = String(children).replace(/\n$/, "");

    // Mermaid diagrams — explicit ```mermaid tag OR content-based detection.
    // The AI frequently omits the language tag and just starts with "flowchart TD"
    // etc., which caused the block to fall through to the plain code renderer.
    if ((match && match[1] === "mermaid") || (!match && looksLikeMermaid(code))) {
      return <MermaidDiagram code={code} isStreaming={isStreaming} />;
    }

    // Named language → syntax highlight
    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: "0.75rem 0",
            borderRadius: "0.5rem",
            fontSize: "0.8125rem",
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }

    // No language + looks like markdown table/text → re-render as markdown
    if (looksLikeMarkdown(code)) {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(isStreaming)}>
          {code}
        </ReactMarkdown>
      );
    }

    return (
      <code className="rounded bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 font-mono text-xs">
        {children}
      </code>
    );
  },

  pre({ children }) {
    // SyntaxHighlighter renders its own container; unwrap bare <pre>
    return <>{children}</>;
  },

  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="border-collapse text-sm" style={{ tableLayout: "auto", width: "auto" }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-left font-semibold text-xs whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-zinc-400 dark:border-zinc-600 pl-4 italic text-zinc-500 dark:text-zinc-400 my-3">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1.5">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1 my-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1 my-2">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  p: ({ children }) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <span className="block my-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        className="max-w-full rounded-lg border border-zinc-200 dark:border-zinc-700"
        loading="lazy"
      />
      {alt && (
        <span className="block mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 text-center italic">
          {alt}
        </span>
      )}
    </span>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-4 border-zinc-300 dark:border-zinc-700" />,
  };
}

export function RichContent({ content, isStreaming = false }: RichContentProps) {
  return (
    <div className="text-sm text-zinc-900 dark:text-zinc-100 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={buildComponents(isStreaming)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
