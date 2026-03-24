"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { clearToken } from "@/utils/token";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Placeholders that look like type annotations — treat as unset
const PLACEHOLDER = /^(string|number|boolean|null|undefined|object|any)$/i;

function displayName(fullName: string | null | undefined, email: string): string {
  if (fullName && fullName.trim() && !PLACEHOLDER.test(fullName.trim())) {
    return fullName.trim();
  }
  // Fall back to the part before @ in the email
  return email.split("@")[0] ?? email;
}

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    clearAuth();
    router.push("/login");
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href="/dashboard" className="text-base font-semibold text-zinc-900 dark:text-white">
          AI Document Companion
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user?.email && (
          <span className="hidden sm:inline text-sm text-zinc-500 dark:text-zinc-400">
            {displayName(user.full_name, user.email)}
          </span>
        )}
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
