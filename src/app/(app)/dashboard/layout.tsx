import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents — AI Document Companion",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
