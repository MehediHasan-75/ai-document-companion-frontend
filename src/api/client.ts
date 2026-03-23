import axios from "axios";
import { getToken, clearToken } from "@/utils/token";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL ?? "" });

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 401
    ) {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
