"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import "katex/dist/katex.min.css";
import type { Components } from "react-markdown";

interface RichContentProps {
  content: string;
  /** True while streaming — skips expensive async transforms */
  isStreaming?: boolean;
}

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark",
};

// Shared react-markdown component overrides (used during streaming)
const mdComponents: Components = {
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm my-3">
      {children}
    </pre>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-xs">
        {children}
      </code>
    ),
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
    <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-1.5">{children}</td>
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
  p: ({ children }) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  ),
  // Inline images from AI responses
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
};

/**
 * Async processor for finalised messages.
 * unified().process() supports async plugins (rehype-pretty-code / Shiki).
 */
async function processMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  return String(file);
}

export function RichContent({ content, isStreaming = false }: RichContentProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (isStreaming) {
      setHtml(null);
      return;
    }
    let cancelled = false;
    processMarkdown(content).then((result) => {
      if (!cancelled) setHtml(result);
    }).catch(() => {
      if (!cancelled) setHtml(null); // fall back to react-markdown below
    });
    return () => { cancelled = true; };
  }, [content, isStreaming]);

  const wrapClass = "text-sm text-zinc-900 dark:text-zinc-100 max-w-none";

  // While streaming OR while async processing hasn't completed yet — use fast sync renderer
  if (isStreaming || html === null) {
    return (
      <div className={wrapClass}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          components={mdComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Final message: render fully-processed HTML (KaTeX + Shiki applied)
  return (
    <div
      className={`${wrapClass} rich-content`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
