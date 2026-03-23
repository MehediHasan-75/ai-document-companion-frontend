"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ConversationSidebar } from "@/components/layout/ConversationSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 pt-14 transform transition-transform duration-200
            md:relative md:translate-x-0 md:pt-0 md:z-auto md:flex-shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <ConversationSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
