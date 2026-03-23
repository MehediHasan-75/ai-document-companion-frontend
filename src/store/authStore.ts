import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setToken, clearToken } from "@/utils/token";
import type { User } from "@/types/auth";

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        setToken(token); // keeps localStorage + cookie in sync
        set({ user, token });
      },
      clearAuth: () => {
        clearToken(); // removes localStorage + expires cookie
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth",
      // Re-sync cookie whenever the persisted store rehydrates (page refresh)
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setToken(state.token);
          // Refresh user profile from API to avoid stale persisted data
          import("@/api/auth").then(({ authApi }) => {
            authApi.me().then((user) => {
              useAuthStore.setState({ user });
            }).catch(() => {/* token may be expired — proxy will redirect */});
          });
        }
      },
    }
  )
);
