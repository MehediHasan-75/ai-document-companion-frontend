"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ui/ThemeProvider";

let initializedTheme: string | null = null;
let counter = 0;

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const id = useRef(`mermaid-${++counter}`).current;
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    const mermaidTheme = "default";

    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        if (initializedTheme !== mermaidTheme) {
          mermaid.initialize({ startOnLoad: false, theme: mermaidTheme, securityLevel: "loose" });
          initializedTheme = mermaidTheme;
        }

        const { svg, bindFunctions } = await mermaid.render(id, code);

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
        bindFunctions?.(containerRef.current);
      } catch (e: unknown) {
        if (!cancelled) setError(String(e));
      }
    })();

    return () => { cancelled = true; };
  }, [code, id, theme]);

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
