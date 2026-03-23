import api from "./client";
import type { User, TokenResponse, RegisterRequest } from "@/types/auth";

export const authApi = {
  register: (body: RegisterRequest) =>
    api.post<User>("/auth/register", body).then((r) => r.data),

  login: (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    return api
      .post<TokenResponse>("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((r) => r.data);
  },

  me: () => api.get<User>("/auth/me").then((r) => r.data),
};
