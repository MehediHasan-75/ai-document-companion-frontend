"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import "katex/dist/katex.min.css";
import type { Components } from "react-markdown";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

interface RichContentProps {
  content: string;
  /** True while streaming — skips expensive rehype transforms */
  isStreaming?: boolean;
}

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark",
};

const mdComponents: Components = {
  // Scrollable code block
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm my-3">
      {children}
    </pre>
  ),
  // Inline vs block code
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-xs">
        {children}
      </code>
    ),
  // Horizontally scrollable tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-1.5">
      {children}
    </td>
  ),
  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-zinc-400 dark:border-zinc-600 pl-4 italic text-zinc-500 dark:text-zinc-400 my-3">
      {children}
    </blockquote>
  ),
  // Headings
  h1: ({ children }) => (
    <h1 className="text-xl font-bold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold mt-3 mb-1.5 text-zinc-900 dark:text-zinc-100">{children}</h3>
  ),
  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 space-y-1 my-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 space-y-1 my-2">{children}</ol>
  ),
  // Paragraphs
  p: ({ children }) => (
    <p className="leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  // Links
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
};

export function RichContent({ content, isStreaming = false }: RichContentProps) {
  return (
    <div className="text-sm text-zinc-900 dark:text-zinc-100 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={
          isStreaming
            ? [] // skip heavy transforms while tokens arrive
            : [rehypeKatex, [rehypePrettyCode, prettyCodeOptions]]
        }
        components={mdComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
