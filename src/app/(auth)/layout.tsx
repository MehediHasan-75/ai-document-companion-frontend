import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Document Companion",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
