import { redirect } from "next/navigation";

// Root "/" — proxy guard redirects unauthenticated users to /login.
// Authenticated users land here and get sent to /dashboard.
export default function RootPage() {
  redirect("/dashboard");
}
