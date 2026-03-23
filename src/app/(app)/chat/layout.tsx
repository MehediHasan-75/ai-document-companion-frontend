import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat — AI Document Companion",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
