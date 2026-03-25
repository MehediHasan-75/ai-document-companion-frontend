"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { useTheme } from "@/components/ui/ThemeProvider";

let initializedTheme: string | null = null;
let counter = 0;

interface MermaidDiagramProps {
  code: string;
  isStreaming?: boolean;
}

export function MermaidDiagram({ code, isStreaming = false }: MermaidDiagramProps) {
  const id = useRef(`mermaid-${++counter}`).current;
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Buffering: don't attempt to render while the LLM is still streaming this block
    if (isStreaming) return;

    let cancelled = false;
    const mermaidTheme = "default";

    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        if (initializedTheme !== mermaidTheme) {
          mermaid.initialize({
            startOnLoad: false,
            theme: mermaidTheme,
            securityLevel: "strict",
            suppressErrorRendering: true,
          });
          initializedTheme = mermaidTheme;
        }

        const { svg } = await mermaid.render(id, code);

        if (cancelled || !containerRef.current) return;

        // Sanitize SVG before DOM injection.
        // ADD_TAGS/HTML_INTEGRATION_POINTS preserve <foreignObject> for Mermaid text
        // wrapping, which DOMPurify 3.1.7+ strips by default to prevent mXSS.
        const sanitized = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ["foreignObject"],
          HTML_INTEGRATION_POINTS: { foreignobject: true },
        });

        containerRef.current.innerHTML = sanitized;
      } catch (e: unknown) {
        if (!cancelled) setError(String(e));
      }
    })();

    return () => { cancelled = true; };
  }, [code, id, isStreaming, theme]);

  if (isStreaming) {
    return (
      <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 h-40 w-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center my-3">
        <span className="font-mono text-xs text-zinc-400">Generating diagram…</span>
      </div>
    );
  }

  if (error) {
    return (
      <pre className="rounded bg-zinc-800 p-3 text-xs text-red-400 overflow-x-auto my-3">
        {code}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-3 flex justify-center overflow-x-auto [&_svg]:max-w-full rounded-xl dark:bg-white dark:p-3"
    />
  );
}
