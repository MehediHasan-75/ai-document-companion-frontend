# Frontend Deep-Dive: React, Next.js, TypeScript & Tailwind CSS

> **Target audience:** Junior developers and anyone new to modern web development. This guide walks through every major file and concept in the AI Document Companion frontend, explains *what* it does, *why* it was built that way, and *how* it works under the hood. Real analogies. No handwaving.

---

## Table of Contents

1. [Technology Stack at a Glance](#technology-stack-at-a-glance)
2. [Project Layout](#project-layout)
3. [React Fundamentals — The Big Picture](#react-fundamentals--the-big-picture)
4. [TypeScript — Safety Belts for JavaScript](#typescript--safety-belts-for-javascript)
5. [Tailwind CSS — Styling Without Leaving HTML](#tailwind-css--styling-without-leaving-html)
6. [Next.js App Router — File-Based Everything](#nextjs-app-router--file-based-everything)
7. [Entry Points: `layout.tsx` and `page.tsx`](#entry-points-layouttsx-and-pagetsx)
8. [Authentication — Route Groups and Middleware](#authentication--route-groups-and-middleware)
9. [Global Styles: `globals.css`](#global-styles-globalscss)
10. [State Management with Zustand](#state-management-with-zustand)
11. [The API Layer — Axios and Typed Modules](#the-api-layer--axios-and-typed-modules)
12. [TypeScript Types Catalogue](#typescript-types-catalogue)
13. [Custom Hooks — Reusable Async Logic](#custom-hooks--reusable-async-logic)
14. [The Chat System — Streaming in Real Time](#the-chat-system--streaming-in-real-time)
15. [Rich Content Rendering](#rich-content-rendering)
16. [File Management — Upload, Process, Poll](#file-management--upload-process-poll)
17. [Layout Components](#layout-components)
18. [UI Primitives](#ui-primitives)
19. [Utility Functions](#utility-functions)
20. [Environment Variables](#environment-variables)
21. [Configuration Files](#configuration-files)
22. [Common Patterns Quick-Reference](#common-patterns-quick-reference)

---

## Technology Stack at a Glance

| Layer | Library / Version | Purpose |
|---|---|---|
| Framework | **Next.js 16.2** | Routing, SSR, file conventions, middleware |
| UI Library | **React 19** | Component model, hooks, Virtual DOM |
| Language | **TypeScript 5.9** | Static type checking |
| Styling | **Tailwind CSS v4** | Utility-first CSS |
| State | **Zustand 5** | Lightweight global stores |
| Forms | **React Hook Form + Zod** | Validation without re-render hell |
| HTTP | **Axios** | Typed API calls with interceptors |
| Markdown | **react-markdown + plugins** | Render rich AI responses |
| Diagrams | **Mermaid 11** | Flow charts, sequence diagrams |
| Math | **KaTeX** | LaTeX math formulas |
| Security | **DOMPurify** | Sanitise SVG before DOM injection |

---

## Project Layout

```
src/
├── app/                   ← Next.js App Router pages & layouts
│   ├── (auth)/            ← Route group: login + register
│   ├── (app)/             ← Route group: authenticated pages
│   ├── globals.css        ← Tailwind import + theme tokens + rich-content styles
│   ├── layout.tsx         ← Root HTML shell
│   └── page.tsx           ← "/" → redirects to /dashboard
│
├── api/                   ← Axios API modules (one per resource)
│   ├── client.ts          ← Base Axios instance with interceptors
│   ├── auth.ts            ← login / register / me
│   ├── conversations.ts   ← CRUD + messages
│   └── files.ts           ← upload / process / status / delete
│
├── components/
│   ├── chat/              ← Everything you see in the chat window
│   ├── files/             ← Dashboard file cards and uploader
│   ├── layout/            ← TopBar + ConversationSidebar
│   └── ui/                ← Generic primitives (Skeleton, Toaster, Theme)
│
├── hooks/                 ← Custom React hooks
│   ├── useStreamingChat.ts   ← The heart of the SSE streaming pipeline
│   ├── useConversations.ts   ← Load/create/delete conversations
│   └── useFileStatus.ts      ← Poll file processing status
│
├── store/                 ← Zustand global stores
│   ├── authStore.ts
│   ├── chatStore.ts
│   ├── conversationStore.ts
│   ├── fileStore.ts
│   └── toastStore.ts
│
├── types/                 ← TypeScript interfaces shared across the app
│   ├── auth.ts
│   ├── chat.ts
│   ├── file.ts
│   └── api.ts
│
├── utils/
│   ├── cn.ts              ← Tailwind class merger
│   ├── sse.ts             ← Server-Sent Event parser
│   └── token.ts           ← JWT token storage (localStorage + cookie)
│
└── proxy.ts               ← Next.js middleware (auth guard)
```

---

## React Fundamentals — The Big Picture

### What is React?

React is a JavaScript library for building user interfaces. Its central idea is simple: **describe what you want the screen to look like, and React figures out how to update the real browser DOM efficiently**.

Before React, developers wrote code like this:

```javascript
// Vanilla JS — imperative: you tell the browser exactly what to do
const button = document.getElementById("myButton");
button.textContent = "Clicked!";
button.style.color = "red";
```

With React, you describe the *desired state* and React decides what DOM changes are needed:

```tsx
// React — declarative: you describe what it should look like
function Button({ clicked }: { clicked: boolean }) {
  return (
    <button style={{ color: clicked ? "red" : "black" }}>
      {clicked ? "Clicked!" : "Click me"}
    </button>
  );
}
```

### Components

A component is just a JavaScript function that returns JSX (HTML-like syntax). Think of it like a custom HTML tag you define yourself.

```tsx
// This is a React component — a function that returns JSX
function MessageBubble({ text }: { text: string }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-zinc-900 text-white">
      {text}
    </div>
  );
}

// Used just like an HTML tag
<MessageBubble text="Hello, world!" />
```

Every component in this project lives in `src/components/`. They're small, focused, and composed together like LEGO bricks.

### Props

Props (short for *properties*) are the arguments you pass to a component. They flow **down** from parent to child — never the other way. TypeScript interfaces document exactly what shape props must take.

```tsx
// src/components/chat/ChatInput.tsx
interface ChatInputProps {
  onSend: (question: string) => void;  // a function the parent provides
  onAbort: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export function ChatInput({ onSend, onAbort, isStreaming, disabled }: ChatInputProps) {
  // ... uses these props internally
}
```

**Under the hood:** When a parent re-renders and passes new prop values, React compares the old and new virtual DOM trees (a process called *reconciliation*). If a prop changed, the child's output may differ, and React surgically updates only the affected real DOM nodes.

### State

State is memory that belongs to a component. When state changes, React re-renders the component.

```tsx
// src/components/chat/ChatInput.tsx
const [value, setValue] = useState("");  // "" is the initial value

// When the user types:
onChange={(e) => setValue(e.target.value)}
// → React queues a re-render with the new value
```

**Under the hood:** `useState` doesn't live inside the function. React maintains a list of "hooks" for each component instance in a hidden data structure. Every time the component function runs, hooks are called in the same order, so React can match `useState` calls to their stored values. This is why hooks must never be called inside `if` blocks or loops.

### The Virtual DOM

React never writes directly to the browser DOM on every change. Instead it:

1. Keeps an in-memory copy called the **Virtual DOM** (a plain JavaScript object tree)
2. On state change, builds a **new** virtual DOM tree
3. **Diffs** the new tree against the old one (O(n) algorithm, not O(n³) like naive approaches)
4. Only applies the **minimum set of real DOM operations** needed

Analogy: imagine editing a Google Doc. Instead of re-printing the whole document every time you type a letter, Google Docs only updates the changed paragraph. The Virtual DOM is that diffing engine for UIs.

```
State changes → New virtual DOM → Diff → Patch real DOM
                                          ↑ Only this node changed
```

### The `"use client"` Directive

Next.js 13+ introduced Server Components by default. You must opt a component into browser rendering by writing `"use client"` at the very top of the file.

```tsx
"use client";          // ← This component runs in the browser

import { useState } from "react";  // hooks only work client-side
```

**Why does this matter?** Without `"use client"`, the component runs only on the server during build/request time. It cannot use hooks (`useState`, `useEffect`), cannot access `window` or `document`, and cannot respond to user events. Most of the interactive components in this project are Client Components.

### `useEffect` — Synchronising with the Outside World

`useEffect` runs code **after** the component renders. It's used for things React doesn't control: fetching data, setting up event listeners, manipulating the DOM directly.

```tsx
// Runs after first render and after `conversationId` changes
useEffect(() => {
  conversationsApi.messages(conversationId).then(setMessages);
}, [conversationId]);   // ← dependency array
```

**Under the hood:** React schedules the effect to run after the browser has painted. The dependency array tells React "only re-run this effect if one of these values changed between renders." An empty array `[]` means "run once, after the first render." No array means "run after every render" — usually a bug.

The function can return a **cleanup function**, called before the next effect run or on unmount:

```tsx
useEffect(() => {
  const interval = setInterval(pollStatus, 3000);
  return () => clearInterval(interval);  // cleanup: stop polling when unmounted
}, []);
```

### `useRef` — Escape Hatch to the Real DOM

`useRef` gives you a mutable box that survives re-renders without causing them. Two main uses:

1. **DOM access** — `scrollContainerRef.current` points to the real `<div>` in the browser
2. **Instance variables** — values that must persist but shouldn't trigger re-renders

```tsx
// src/components/chat/ChatWindow.tsx
const scrollContainerRef = useRef<HTMLDivElement>(null);
const autoScrollRef = useRef(true);   // changing this won't re-render the component

// Access the real DOM node:
scrollContainerRef.current?.scrollTo({ top: el.scrollHeight });
```

### `useCallback` — Stable Function References

When a component re-renders, every function defined inside it is recreated. `useCallback` caches a function so it only changes when its dependencies change, preventing unnecessary re-renders of child components that receive it as a prop.

```tsx
// src/hooks/useStreamingChat.ts
const sendMessage = useCallback(
  async (question: string) => { /* ... */ },
  [conversationId, docId, addMessage, /* ... */]  // only recreate if these change
);
```

### `useContext` — Sharing Data Without Prop Drilling

Prop drilling means passing data through many intermediate components just to get it to a deeply nested one. Context creates a "broadcast channel" any component in the tree can subscribe to.

```tsx
// src/components/ui/ThemeProvider.tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Any component can read the theme without props:
export function useTheme() {
  return useContext(ThemeContext);
}
```

---

## TypeScript — Safety Belts for JavaScript

### Why TypeScript?

JavaScript is dynamically typed — you can assign any value to any variable, which is flexible but error-prone. TypeScript adds *static types* checked at compile time, before the code ever runs.

```typescript
// JavaScript: this crashes at runtime, not at build time
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42);  // ← crashes: 42.toUpperCase is not a function

// TypeScript: caught at build time
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}
greet(42);  // ← TypeScript error: Argument of type 'number' is not assignable to 'string'
```

In a large codebase, this prevents entire classes of bugs: typos in property names, passing the wrong argument, calling `.map()` on something that might be `null`.

### Interfaces

An interface describes the *shape* of an object. It's purely a TypeScript construct — it compiles away to nothing at runtime.

```typescript
// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  full_name: string | null;   // string OR null — explicit about what can be absent
  is_active: boolean;
  created_at: string;         // ISO date string from the API
}
```

Now everywhere `User` is used, TypeScript ensures you only access valid properties:

```typescript
const user: User = { id: "abc", email: "me@x.com", full_name: "Jane", is_active: true, created_at: "..." };
console.log(user.name);   // ← TypeScript error: Property 'name' does not exist on type 'User'
console.log(user.email);  // ✓ fine
```

### Union Types

A union type says "this value can be one of several types." The `|` reads as "or."

```typescript
// src/types/file.ts
export type FileStatus = "uploaded" | "processing" | "processed" | "failed" | "deleted";

// TypeScript now knows only these five strings are valid:
function badge(status: FileStatus) { /* ... */ }
badge("uploaded");    // ✓
badge("corrupted");   // ← TypeScript error: not assignable to type 'FileStatus'
```

### Discriminated Unions

SSE events from the backend come in five flavours. Rather than a single messy type with all optional fields, we use a **discriminated union** — each variant has a unique `type` tag:

```typescript
// src/types/chat.ts
export type SSEEvent =
  | { type: "status";   content: string }
  | { type: "thinking"; content: string }
  | { type: "delta";    content: string }
  | { type: "complete"; content: string; conversation_id: string; sources: Source[]; images?: string[] }
  | { type: "error";    content: string };
```

TypeScript narrows the type automatically inside each branch:

```typescript
if (event.type === "complete") {
  event.sources;   // ✓ TypeScript knows this exists — only "complete" has sources
  event.images;    // ✓ optional on "complete"
}
if (event.type === "status") {
  event.sources;   // ← TypeScript error — "status" has no "sources"
}
```

### `z.infer<typeof schema>` — Deriving Types from Validation Schemas

Zod validates data at runtime. The clever trick is using `z.infer` to derive a TypeScript type *from* the schema so you don't write the same shape twice:

```typescript
// src/app/(auth)/login/page.tsx
const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;
// TypeScript now infers: { email: string; password: string }
// No need to write a separate interface!
```

### Generics

Generics are like type parameters — they let you write reusable code that works with many types while staying type-safe.

```typescript
// Axios generic: tells TypeScript what shape the response data has
api.get<User>("/auth/me")        // → Promise<AxiosResponse<User>>
api.post<Conversation>("/...")   // → Promise<AxiosResponse<Conversation>>
```

Without the generic, `.data` would be typed as `any` (unsafe). With it, TypeScript knows exactly what fields are on `.data`.

### `tsconfig.json` Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,                    // enables all strict checks
    "noUncheckedIndexedAccess": true,  // arr[0] is T | undefined, not T
    "noImplicitReturns": true,         // every code path must return
    "exactOptionalPropertyTypes": true // { x?: string } ≠ { x: string | undefined }
  }
}
```

These settings are intentionally aggressive. `noUncheckedIndexedAccess` is particularly educational: it reminds you that array element access can return `undefined` if the index is out of bounds.

---

## Tailwind CSS — Styling Without Leaving HTML

### What is Utility-First CSS?

Traditional CSS: you write a class name, then define its styles in a separate `.css` file.

```css
/* styles.css */
.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background-color: #18181b;
  color: white;
}
```

```html
<div class="message-bubble">Hello</div>
```

Tailwind: you compose styles directly in the HTML from tiny single-purpose classes.

```tsx
<div className="px-4 py-3 rounded-2xl bg-zinc-900 text-white">
  Hello
</div>
```

`px-4` = `padding-left: 1rem; padding-right: 1rem;`
`py-3` = `padding-top: 0.75rem; padding-bottom: 0.75rem;`
`rounded-2xl` = `border-radius: 1rem;`

**Why not just use inline styles?** Unlike inline styles, Tailwind classes participate in CSS cascade, support media queries, hover/focus states, and generate no runtime overhead. They're extracted and bundled into a single tiny CSS file at build time.

### Dark Mode

The project uses Tailwind's `dark:` variant combined with a class-based strategy. When the `<html>` element has the `dark` class, all `dark:` utilities activate:

```tsx
// Same element, different colours in light vs dark mode
<div className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
```

```css
/* globals.css — teaches Tailwind to use class-based dark mode */
@variant dark (&:where(.dark, .dark *));
```

**How it works:** `ThemeProvider` adds/removes the `dark` class on `document.documentElement` when the user toggles the theme. The CSS selector `.dark *` matches every descendant, so all `dark:` classes activate instantly.

### The `cn()` Utility

Tailwind classes can conflict. For example, `bg-red-500 bg-blue-500` — which wins? And sometimes you need to conditionally add or override classes.

```tsx
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

`clsx` handles conditional classes. `tailwind-merge` resolves Tailwind conflicts intelligently:

```tsx
cn("px-4 py-2", isActive && "bg-blue-500", "px-6")
// → "py-2 bg-blue-500 px-6"  (px-4 removed because px-6 wins, isActive=true so bg-blue-500 kept)
```

### Responsive Design

Tailwind uses breakpoint prefixes: `sm:`, `md:`, `lg:`, `xl:`. The default is mobile-first (no prefix = smallest screens).

```tsx
// src/app/(app)/layout.tsx
<aside className={`
  fixed inset-y-0 left-0 z-40 w-64        ← mobile: position fixed (overlay)
  md:relative md:translate-x-0 md:pt-0    ← ≥768px: position relative (in-flow)
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
`}>
```

On mobile, the sidebar slides in as an overlay. On `md` (≥768px) and larger, it sits in the normal document flow beside the main content.

### `@theme inline` — CSS Custom Properties as Design Tokens

Tailwind v4 uses CSS variables for the design token system. The project defines its palette in `globals.css`:

```css
@theme inline {
  --color-primary: #2563eb;
  --color-zinc-50:  #fafafa;
  /* ... */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "Fira Code", "Cascadia Code", Menlo, Monaco, Consolas, monospace;
}
```

This means `bg-primary` in any component resolves to `#2563eb`, and changing the token in one place updates the whole app.

---

## Next.js App Router — File-Based Everything

### What is the App Router?

Next.js uses the file system as the routing engine. Every folder inside `src/app/` with a `page.tsx` becomes a URL.

```
src/app/
├── page.tsx                          → URL: /
├── (auth)/login/page.tsx             → URL: /login
├── (auth)/register/page.tsx          → URL: /register
├── (app)/dashboard/page.tsx          → URL: /dashboard
├── (app)/chat/page.tsx               → URL: /chat
└── (app)/chat/[conversationId]/page.tsx  → URL: /chat/:conversationId
```

### Route Groups `(name)`

Folders wrapped in parentheses are **route groups** — they affect file organisation and which layout wraps the pages, but they're invisible in the URL.

```
(auth)/login/page.tsx → /login   ← the "(auth)" part doesn't appear in the URL
(app)/dashboard/page.tsx → /dashboard
```

This lets us apply one layout to authenticated pages and a different layout to auth pages, without changing URLs.

### Layouts

A `layout.tsx` file wraps all pages in its directory and subdirectories. Layouts are persistent — they don't remount when you navigate between pages inside them.

```
src/app/layout.tsx         ← wraps everything (html, body, ThemeProvider, Toaster)
src/app/(app)/layout.tsx   ← wraps /dashboard, /chat, /chat/[id]  (TopBar + Sidebar)
src/app/(auth)/layout.tsx  ← wraps /login, /register  (minimal, no sidebar)
```

Analogy: think of Russian nesting dolls. The innermost doll is the page. Each doll around it is a layout.

```
RootLayout (html + body + ThemeProvider)
  └── AppLayout (TopBar + Sidebar)
        └── DashboardPage (file list)
```

### Dynamic Segments `[param]`

Square brackets in a folder name create a URL parameter:

```
src/app/(app)/chat/[conversationId]/page.tsx
```

Navigating to `/chat/abc-123` makes `params.conversationId = "abc-123"` available inside the page.

```tsx
// src/app/(app)/chat/[conversationId]/page.tsx
export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ doc_id?: string }>;
}) {
  const { conversationId } = await params;
  const { doc_id } = await searchParams;
  return <ChatWindow conversationId={conversationId} docId={doc_id} />;
}
```

### Server vs Client Components

A subtle but important distinction in Next.js 13+:

| | Server Component | Client Component |
|---|---|---|
| Runs where | Server at build/request time | Browser at runtime |
| Can use hooks | No | Yes (`useState`, `useEffect`, etc.) |
| Can access `window`/`document` | No | Yes |
| Can read env variables | Yes (including secrets) | Only `NEXT_PUBLIC_` ones |
| Default | Yes | Only with `"use client"` at top |

**Why have server components?** They can fetch data and render to HTML before the browser loads any JavaScript. The initial page load is faster because the user sees content sooner, and the browser downloads less JavaScript.

In this project, most page components are server components that simply receive params and pass them down to client components. The interactive chat and file UI are all client components.

### Error Boundaries

Each route that could fail has an `error.tsx` sibling. When the page component throws an error, Next.js renders this fallback instead of a blank screen.

```tsx
// src/app/(app)/chat/[conversationId]/error.tsx
"use client";

export default function ConversationError() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
      <p className="text-zinc-500">Something went wrong loading this conversation.</p>
    </div>
  );
}
```

### `metadata` — Page Titles and SEO

Layout and page files can export a `metadata` object. Next.js automatically generates the correct `<title>` and `<meta>` tags in the `<head>`.

```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "AI Document Companion",
  description: "Upload documents and ask questions with AI-powered RAG",
};
```

---

## Entry Points: `layout.tsx` and `page.tsx`

### Root Layout: `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**`suppressHydrationWarning`:** When `ThemeProvider` reads `localStorage` and adds the `dark` class to `<html>`, this creates a mismatch between the server-rendered HTML (which has no `dark` class) and what the browser renders. React would normally print a warning. This attribute tells React "I know about this, it's intentional."

**`children`:** In React, `children` is a special prop representing everything between a component's opening and closing tags. Every page in the app tree gets injected here.

**`antialiased`:** A Tailwind utility that applies `-webkit-font-smoothing: antialiased` for sharper text rendering on modern displays.

### Root Page: `src/app/page.tsx`

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
```

The root URL `/` isn't a real page — it just redirects to `/dashboard`. Unauthenticated users trying to reach `/dashboard` are caught by the middleware (see below) and sent to `/login` first.

---

## Authentication — Route Groups and Middleware

### The Proxy / Middleware: `src/proxy.ts`

```tsx
const PUBLIC = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
```

This is a **Next.js Middleware** — code that runs on the server *before* a request reaches any page. It checks for a cookie named `token`.

**Why a cookie instead of localStorage?** Middleware runs on the server. The server has no access to the browser's `localStorage`. Cookies, however, are sent with every HTTP request automatically by the browser, so the server can read them. This is why `setToken()` stores the token in *both* `localStorage` (for API calls made from the browser) and as a cookie (for the middleware to read).

**The `matcher` pattern:** `/((?!_next|api|favicon.ico).*)` runs the middleware on every URL except Next.js internals (`_next`), API routes, and the favicon. Without this, Next.js would run the middleware on static assets like CSS and images too.

**Under the hood:** Next.js Middleware runs in the **Edge Runtime** — a lightweight V8 environment with no access to Node.js built-ins (no `fs`, no `path`). It's designed for ultra-fast execution at CDN edge nodes close to the user.

### Token Storage: `src/utils/token.ts`

```typescript
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  // Write a cookie so the proxy (server-side) can read it for auth guards
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  // Expire the cookie immediately
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
```

`SameSite=Lax` prevents the cookie from being sent on cross-site requests from third-party pages (a CSRF protection measure). The cookie isn't marked `HttpOnly` because it must be writable from JavaScript (`document.cookie`). In a production system with higher security requirements, you'd use an `HttpOnly` cookie set by the server and rely on refresh token rotation.

### Login Page: `src/app/(auth)/login/page.tsx`

```tsx
"use client";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const tokenRes = await authApi.login(values.email, values.password);
      setToken(tokenRes.access_token);
      const user = await authApi.me();
      setAuth(user, tokenRes.access_token);
      router.push("/dashboard");
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  }
  // ...
}
```

**React Hook Form** manages the form state. Without it, you'd need `useState` for every field, plus manual validation logic. `useForm` tracks values, errors, and submission state internally — your component only re-renders when it needs to (e.g., when showing an error).

**`zodResolver`** connects the Zod schema to React Hook Form so validation happens automatically on submit and on field blur.

**`{...register("email")}`** is a spread of four props (`name`, `onChange`, `onBlur`, `ref`) that React Hook Form needs to track the input. It's shorthand for wiring up the input manually.

**`errors.root`** is a special field for errors that don't belong to a specific input — used here for the "Invalid credentials" API error.

**`isSubmitting`** is `true` while the async `onSubmit` is running. We use it to disable the button and change its label to "Signing in…", preventing double submissions.

**Login flow:**

```
1. User submits form
2. Zod validates email format and non-empty password
3. POST /auth/login → receive JWT token
4. Store token in localStorage + cookie
5. GET /auth/me → receive User profile
6. Store user in Zustand authStore
7. Navigate to /dashboard
```

---

## Global Styles: `globals.css`

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-primary: #2563eb;
  --color-zinc-50: #fafafa;
  /* ... more tokens */
}
```

The `@import "tailwindcss"` line replaces the old `@tailwind base; @tailwind components; @tailwind utilities;` from Tailwind v3. Tailwind v4 uses a single import.

### The `.rich-content` Class

AI assistant messages are rendered as Markdown and need custom styling. The `.rich-content` CSS class is applied to the wrapper `div`, and all the rules beneath it style specific HTML tags generated by the Markdown renderer:

```css
.rich-content pre {
  overflow-x: auto;
  max-width: 100%;
  border-radius: 0.5rem;
  /* ... */
}
```

This is a case where global CSS is more appropriate than Tailwind utilities, because the Markdown renderer generates raw `<pre>`, `<table>`, `<blockquote>` tags without class attributes. You can't target them with Tailwind because you don't control their output.

---

## State Management with Zustand

### Why Not Redux?

Redux is the classic React state management library, but it requires boilerplate: actions, reducers, selectors, a `<Provider>` wrapper. Zustand gives you a global store in ~10 lines:

```typescript
import { create } from "zustand";

const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

// In a component:
const count = useStore((s) => s.count);
const increment = useStore((s) => s.increment);
```

Any component that subscribes to a piece of state will automatically re-render when that slice changes. Components that subscribe to different slices are unaffected.

### `authStore.ts` — JWT + User Profile

```typescript
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        setToken(token);         // sync localStorage + cookie
        set({ user, token });    // update Zustand state
      },
      clearAuth: () => {
        clearToken();
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth",              // localStorage key
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setToken(state.token);
          // Silently refresh user profile from API
          import("@/api/auth").then(({ authApi }) => {
            authApi.me().then((user) => {
              useAuthStore.setState({ user });
            }).catch(() => {});
          });
        }
      },
    }
  )
);
```

**`persist` middleware:** Zustand's `persist` plugin serialises the store state to `localStorage` and restores it when the page loads. This means logging in once persists across page refreshes.

**`onRehydrateStorage`:** Called after `persist` rehydrates the store from `localStorage`. We use it to:
1. Resync the cookie (necessary because cookies expire but `localStorage` doesn't)
2. Refresh the user profile from the API (the stored profile might be stale if the user's name changed)

**Why call `setToken` again on rehydrate?** After a page refresh, the persisted token is restored to Zustand, but the cookie might have expired. `setToken` writes a fresh cookie so the middleware's auth guard can read it.

### `chatStore.ts` — Live Streaming State

```typescript
interface ChatStore {
  conversationMessages: Record<string, Message[]>;  // keyed by conversationId
  isStreaming: boolean;
  streamingConversationId: string | null;
  statusLabel: string;       // current pipeline step label ("Searching documents…")
  statusHistory: string[];   // all steps seen so far (for the progress list)
  partialContent: string;    // tokens received so far in current stream
  thinkingContent: string;   // AI reasoning tokens (shown in ThinkingBlock)
  // ...
}
```

Storing `conversationMessages` as a dictionary (`Record<string, Message[]>`) is a deliberate choice. When you switch conversations, you don't want a loading flash if you've already loaded that conversation. The dictionary acts as an in-memory cache: if the messages for `conversationId` already exist, display them immediately while optionally refreshing in the background.

**`statusHistory` vs `statusLabel`:** The backend sends status events like "Searching documents…", "Building prompt…", "Generating response…" in sequence. `statusLabel` holds the *current* one; `statusHistory` is an accumulation of all seen steps. The `StreamingMessage` component renders the history as a checklist — completed steps get a green checkmark, the active step spins.

### `conversationStore.ts` — Conversation List + Doc Filters

```typescript
export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      // ...
      docFilters: {},   // { conversationId: docId }
    }),
    {
      name: "conversations",
      partialize: (s) => ({ docFilters: s.docFilters }),  // only persist docFilters
    }
  )
);
```

**`partialize`:** We only persist `docFilters` to `localStorage`, not the entire conversations list. The conversations list is fetched fresh from the API on every mount. `docFilters` needs to persist because it remembers which document each conversation is scoped to — without this, opening a conversation that was started from a specific document would lose the filter on page refresh.

### `toastStore.ts` — Global Notifications

```typescript
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, variant = "info") => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
}));

// Module-level helper — callable without a hook
export function toast(message: string, variant: ToastVariant = "info") {
  useToastStore.getState().push(message, variant);
}
```

The key insight is `useToastStore.getState()` — Zustand stores have a `.getState()` method that works outside React components. This means `toast("File uploaded!", "success")` can be called from anywhere: event handlers, API utilities, hooks — without needing `useToastStore` hook access.

---

## The API Layer — Axios and Typed Modules

### Base Client: `src/api/client.ts`

```typescript
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL ?? "" });

// Request interceptor — attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
```

**Interceptors** are middleware for HTTP calls. Instead of adding `Authorization: Bearer ...` to every API call manually, one interceptor on the base client handles it for all requests. Similarly, if any request gets a 401 (token expired or invalid), the response interceptor clears the session and redirects to login — from one place.

**`NEXT_PUBLIC_API_URL`** is an environment variable (see [Environment Variables](#environment-variables)). Only variables prefixed `NEXT_PUBLIC_` are embedded in the browser bundle. Everything else is server-only.

### Auth API: `src/api/auth.ts`

```typescript
export const authApi = {
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
```

**Why `URLSearchParams` for login?** The backend (FastAPI) uses the OAuth2 `password` grant, which expects the body as `application/x-www-form-urlencoded` with a field named `username` (not `email`). This is a FastAPI convention. `URLSearchParams` automatically serialises `{ username: email, password }` into `username=you%40example.com&password=...`.

### Files API: `src/api/files.ts`

```typescript
upload: (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api
    .post<{ file_id: string; message: string }>("/files/upload", form)
    .then((r) => r.data);
},
```

**`FormData`** is the browser API for sending files over HTTP. When you pass `FormData` to Axios, it automatically sets `Content-Type: multipart/form-data` with a unique boundary string. Do not set the content type manually — Axios needs to include the boundary.

---

## TypeScript Types Catalogue

### `src/types/chat.ts` — The SSE Contract

```typescript
export type SSEEvent =
  | { type: "status";   content: string }
  | { type: "thinking"; content: string }
  | { type: "delta";    content: string }
  | { type: "complete"; content: string; conversation_id: string; sources: Source[]; images?: string[] }
  | { type: "error";    content: string };
```

This union mirrors exactly what the backend sends over the Server-Sent Event stream. By declaring it here, every piece of code that processes SSE events gets TypeScript's exhaustive check — if you add a new event type on the backend and forget to handle it in the frontend, TypeScript will warn you.

### `src/types/file.ts` — Document Lifecycle

```typescript
export type FileStatus = "uploaded" | "processing" | "processed" | "failed" | "deleted";

export interface Document {
  id: string;
  filename: string;
  status: FileStatus;
  // populated by backend once processing completes
  page_count?: number;    // ← optional: only set after processing
  chunk_count?: number;
  image_count?: number;
  table_count?: number;
  file_size?: number;
}
```

The `?` on `page_count` etc. is TypeScript's way of saying "this field might not exist." The backend only populates these after ingestion completes. Code that accesses these must account for `undefined` — TypeScript enforces this with `noUncheckedIndexedAccess`.

---

## Custom Hooks — Reusable Async Logic

Custom hooks are just functions whose names start with `use` and that call other hooks inside. They let you extract stateful logic from components and share it.

### `useConversations.ts`

```typescript
export function useConversations() {
  const { conversations, setConversations, addConversation, removeConversation } =
    useConversationStore();
  const router = useRouter();

  useEffect(() => {
    conversationsApi.list().then(setConversations).catch(() => {});
  }, [setConversations]);

  async function createConversation(): Promise<string | null> {
    try {
      const conv = await conversationsApi.create();
      addConversation(conv);
      return conv.id;
    } catch {
      return null;
    }
  }

  return { conversations, createConversation, deleteConversation };
}
```

This hook encapsulates:
- Fetching conversations on first render
- Creating a new conversation (adds to both API + local store)
- Deleting a conversation (removes from both API + local store, then navigates away)

Any component that needs conversation management imports this one hook instead of duplicating the logic.

### `useFileStatus.ts` — Polling with Elapsed Timer

```typescript
const TERMINAL: FileStatus[] = ["processed", "failed", "deleted"];
const POLL_INTERVAL_MS = 3000;
const STUCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function useFileStatus(fileId: string, initial: FileStatus) {
  const [status, setStatus] = useState<FileStatus>(initial);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // ...

  // Polling loop
  useEffect(() => {
    if (TERMINAL.includes(initial)) return; // already done — no polling needed

    const interval = setInterval(async () => {
      const data = await filesApi.status(fileId);
      setStatus(data.status);
      if (TERMINAL.includes(data.status)) {
        clearInterval(interval); // stop polling when done
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval); // cleanup on unmount
  }, [fileId, initial, updateFile]);

  const isStuck = status === "processing" && elapsedSeconds * 1000 >= STUCK_THRESHOLD_MS;
  return { status, error, elapsedSeconds, isStuck };
}
```

**Why poll instead of WebSockets?** Polling is simpler to implement, stateless (no persistent connection to manage), and works fine for a low-frequency status check. The backend already pushes real-time tokens via SSE for chat; file processing status doesn't need sub-second latency.

**The `TERMINAL` array:** Processing eventually ends in one of three states. The hook stops polling as soon as it reaches a terminal state — no point checking a file that's already done.

**`isStuck`:** If a file has been `processing` for more than 5 minutes, something has likely gone wrong on the backend. The flag surfaces a warning banner in `FileCard` suggesting the user delete and re-upload the file.

---

## The Chat System — Streaming in Real Time

The chat system is the most complex part of this project. It deserves a full walkthrough.

### What is Server-Sent Events (SSE)?

Regular HTTP is request-response: client asks, server answers, connection closes. WebSockets keep the connection open bidirectionally. SSE is a middle ground: the connection stays open, but data flows only **server → client**.

```
Client                          Server
  │                               │
  │  POST /conversations/ask      │
  │ ──────────────────────────────▶│
  │                               │  ← begins streaming
  │  data: {"type":"status",...}  │
  │ ◀──────────────────────────────│
  │  data: {"type":"delta",...}   │
  │ ◀──────────────────────────────│
  │  data: {"type":"complete",...}│
  │ ◀──────────────────────────────│
```

SSE is perfect for AI responses: the model generates tokens one by one, and you want to display them as they arrive rather than waiting for the entire response.

### The SSE Parser: `src/utils/sse.ts`

```typescript
export function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const raw = line.slice(6).trim();
    if (!raw) continue;

    try {
      const event = JSON.parse(raw) as SSEEvent;
      events.push(event);
    } catch {
      // malformed line — skip
    }
  }

  return events;
}
```

SSE format is text-based. Each event looks like:

```
data: {"type":"delta","content":"Hello"}
```

The parser splits on newlines, extracts `data: ` prefixed lines, parses the JSON payload, and returns typed `SSEEvent` objects. Multiple events can arrive in one network chunk (TCP batching), so we process all lines, not just the first.

### The Core Hook: `useStreamingChat.ts`

This hook manages the entire conversation lifecycle for a single chat view. Let's walk through it step by step.

#### AbortController — Cancellable Streams

```typescript
// Module-level (not inside the hook) — one controller for the whole app
let activeController: AbortController | null = null;

const sendMessage = useCallback(async (question: string) => {
  activeController?.abort();          // cancel any previous stream
  activeController = new AbortController();
  const { signal } = activeController;
  // ...
  const response = await fetch(url, { signal, /* ... */ });
}, [/* ... */]);
```

`AbortController` is a browser API for cancelling fetch requests. When the user clicks "Stop" or starts a new message while one is streaming, calling `.abort()` causes the `fetch` to throw an `AbortError`, which we catch and handle gracefully.

Using a **module-level** variable (not state) means only one stream can be active at a time across the entire app, regardless of how many `useStreamingChat` instances exist.

#### Chunked Reading with Buffer Management

```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  bufferRef.current += decoder.decode(value, { stream: true });
  const lastNewline = bufferRef.current.lastIndexOf("\n");
  if (lastNewline === -1) continue;

  const complete = bufferRef.current.slice(0, lastNewline + 1);
  bufferRef.current = bufferRef.current.slice(lastNewline + 1);
  processEvents(complete);
}
```

`response.body` is a `ReadableStream`. `getReader()` lets us pull chunks as they arrive. TCP doesn't guarantee that one SSE event = one chunk. A chunk might contain half an event, or three events. The buffer pattern handles this:

1. Append the new chunk to a buffer
2. Find the last complete line (ending in `\n`)
3. Process everything up to that point
4. Keep the incomplete tail in the buffer for next time

`TextDecoder` with `{ stream: true }` handles multi-byte UTF-8 characters that might be split across chunks.

#### Auto-Title Generation

```typescript
function generateTitle(question: string): string {
  const trimmed = question.trim();
  if (trimmed.length <= 40) return trimmed;
  const cut = trimmed.slice(0, 40);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut) + "…";
}

// On first message only:
if (isFirstMessage) {
  const title = generateTitle(question);
  renameConversation(conversationId, title);                   // optimistic local update
  conversationsApi.rename(conversationId, title).catch(() => {}); // best-effort API call
}
```

The conversation title is set to a truncated version of the first question. The local store is updated immediately (optimistic) so the sidebar title changes without waiting for the API. The API call is "best-effort" — if it fails, it's not a critical error.

### The Chat Window: `src/components/chat/ChatWindow.tsx`

#### rAF-Coalesced Auto-Scroll

This is one of the most technically interesting parts of the codebase. During fast streaming, React may produce many state updates per animation frame (one per token). If each update triggers a `scrollTop` write, the browser must interrupt compositing and re-layout after each one — producing visible stutter.

The solution: **coalesce all scroll writes into one per animation frame using `requestAnimationFrame`**.

```typescript
const rafRef = useRef<number | null>(null);
const isProgrammaticScrollRef = useRef(false);

useEffect(() => {
  if (!autoScrollRef.current) return;
  if (rafRef.current !== null) return;  // already queued — skip

  rafRef.current = requestAnimationFrame(() => {
    rafRef.current = null;
    const el = scrollContainerRef.current;
    if (!el || !autoScrollRef.current) return;

    isProgrammaticScrollRef.current = true;   // flag: ignore next scroll event
    el.scrollTop = el.scrollHeight;
    requestAnimationFrame(() => { isProgrammaticScrollRef.current = false; });
  });
}, [messages, partialContent, thinkingContent]);
```

**How `requestAnimationFrame` works:** The browser renders frames at up to 60fps. `requestAnimationFrame(callback)` schedules `callback` to run at the beginning of the *next* frame. All DOM mutations in one frame are batched by the compositor.

The `rafRef.current !== null` guard is the key: if an rAF is already queued, skip scheduling another one. The next frame's callback will scroll to wherever the content is at that point — which includes all the tokens that arrived since the last frame.

**The `isProgrammaticScrollRef` trick:** Setting `scrollTop` triggers a `scroll` event. Our `onScroll` handler uses scroll events to detect user intent ("has the user scrolled up? disable auto-scroll"). Without the flag, our own programmatic scroll would be misinterpreted as user intent.

#### User Scroll Intent Detection

```typescript
const onUserScrollIntent = () => {
  requestAnimationFrame(() => {
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom > 80) {
      autoScrollRef.current = false;  // user scrolled up — stop chasing
    }
  });
};

const onScroll = () => {
  if (isProgrammaticScrollRef.current) return;  // our own scroll — ignore
  const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  autoScrollRef.current = distFromBottom <= 80; // re-enable if near bottom
};
```

Reading `scrollTop` inside `wheel`/`touchstart` handlers is a race condition — the scroll hasn't happened yet when those events fire. We read it one frame later with `requestAnimationFrame(() => ...)` to get the actual post-scroll position.

### `StreamingMessage.tsx` — The Pipeline Progress Display

```tsx
{statusHistory.map((step, i) => {
  const isActive = step === statusLabel && !content;
  const isDone = content || step !== statusLabel;
  return (
    <li key={i} className="flex items-center gap-2">
      {isDone ? (
        <svg className="w-3 h-3 text-green-500">...</svg>  // checkmark
      ) : isActive ? (
        <svg className="w-3 h-3 text-primary animate-spin">...</svg>  // spinner
      ) : (
        <span className="w-3 h-3 rounded-full border border-zinc-400" />  // dot
      )}
      <span className={isActive ? "text-primary font-medium animate-pulse" : "..."}>
        {step}
      </span>
    </li>
  );
})}
```

**`animate-spin`** and **`animate-pulse`** are Tailwind animation utilities. They map to CSS `@keyframes` animations bundled with Tailwind — no custom CSS required.

**Why show pipeline steps?** Without status events, users see a blank area for several seconds while the backend searches documents, builds the prompt, and starts generating. The step checklist provides progress feedback that makes the wait feel intentional and transparent.

---

## Rich Content Rendering

### `RichContent.tsx` — Markdown with Superpowers

```tsx
export function RichContent({ content, isStreaming = false }: RichContentProps) {
  return (
    <div className="text-sm text-zinc-900 dark:text-zinc-100 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={buildComponents(isStreaming)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

The plugin pipeline:

| Plugin | Handles |
|---|---|
| `remark-gfm` | GitHub Flavored Markdown (tables, task lists, strikethrough) |
| `remark-math` | `$inline math$` and `$$block math$$` notation |
| `rehype-katex` | Converts parsed math to KaTeX HTML |
| `rehype-raw` | Allows raw HTML in Markdown (e.g., `<br>`, `<img>`) |

**`remark` vs `rehype`:** Markdown processing is a pipeline. `remark` plugins operate on the Markdown AST (Abstract Syntax Tree). `rehype` plugins operate on the HTML AST after Markdown-to-HTML conversion. Math rendering requires both phases: `remark-math` parses the `$...$` syntax in Markdown; `rehype-katex` renders it to HTML in the second phase.

### Mermaid Detection Logic

```typescript
const MERMAID_KEYWORDS =
  /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|...)\b/i;

function looksLikeMermaid(code: string): boolean {
  return MERMAID_KEYWORDS.test(code.trimStart());
}

// In the code renderer:
if ((match && match[1] === "mermaid") || (!match && looksLikeMermaid(code))) {
  return <MermaidDiagram code={code} isStreaming={isStreaming} />;
}
```

AI models frequently generate Mermaid diagrams without the ` ```mermaid ` language tag — they just start with `flowchart TD` or `sequenceDiagram`. The keyword regex catches these cases and routes them to the Mermaid renderer regardless.

### `MermaidDiagram.tsx` — SVG with DOMPurify

```typescript
const { svg } = await mermaid.render(id, code);

const sanitized = DOMPurify.sanitize(svg, {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ["foreignObject"],
  HTML_INTEGRATION_POINTS: { foreignobject: true },
});

containerRef.current.innerHTML = sanitized;
```

**Why sanitize?** Mermaid renders to an SVG string. Injecting arbitrary SVG via `innerHTML` is an XSS (Cross-Site Scripting) risk — SVG can contain `<script>` tags, event handlers (`onload=...`), and other attack vectors. DOMPurify strips all dangerous content.

**`ADD_TAGS: ["foreignObject"]`:** DOMPurify 3.1.7+ strips `<foreignObject>` by default to prevent [mXSS attacks](https://cure53.de/fp170.pdf). Mermaid uses `foreignObject` legitimately for text wrapping in diagrams. We explicitly allow it while still blocking everything else unsafe.

**`isStreaming` guard:** Mermaid cannot render incomplete diagram syntax. If the AI is still streaming tokens, we show a placeholder skeleton rather than trying to render a half-written diagram that would throw parse errors.

**Lazy import:** `await import("mermaid")` loads the Mermaid library only when a diagram is actually present. Mermaid is a large library (~2.5MB). Lazy-loading keeps the initial bundle small.

### `ThinkingBlock.tsx` — AI Reasoning Display

Some AI models (like DeepSeek-R1) emit `<think>` tokens before answering — their internal reasoning process. The backend forwards these as `type: "thinking"` SSE events.

```tsx
// Auto-open when thinking starts; auto-close when answer starts
useEffect(() => {
  if (isStreaming) {
    setOpen(true);   // open the panel when thinking begins
  } else if (wasStreamingRef.current) {
    setOpen(false);  // collapse it when the answer starts arriving
  }
}, [isStreaming]);
```

`wasStreamingRef` is a ref (not state) because we need to track "was it streaming in the previous render?" without causing an extra render. Refs are mutable and synchronous — perfect for this kind of "previous value" tracking.

---

## File Management — Upload, Process, Poll

### The Upload Flow

```
User drops file → FileUploader → filesApi.upload() → server saves raw file
                                                   → returns file_id
                ↓
            addFile() in fileStore  (optimistic: show immediately)
                ↓
            FileCard appears with status "Uploaded" + "Process" button
                ↓
User clicks Process → filesApi.process(file_id) → server queues background job
                                                 → returns immediately
                ↓
            FileCard.useFileStatus polls /files/status/{id} every 3 seconds
                ↓
            When status = "processed": fetch full file details, update FileCard stats
```

### Drag and Drop: `FileUploader.tsx`

```tsx
function handleDrag(e: React.DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(e.type === "dragenter" || e.type === "dragover");
}

function handleDrop(e: React.DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  const file = e.dataTransfer.files[0];
  if (file) void upload(file);
}
```

**`e.preventDefault()`** stops the browser's default drag-and-drop behaviour (which would open the file in a new tab). **`e.stopPropagation()`** prevents the event from bubbling up to parent elements that might also have drag handlers.

**`void upload(file)`** calls an async function and explicitly discards the returned Promise. This is necessary in event handler positions where TypeScript would otherwise warn about unhandled Promises.

### `FileCard.tsx` — "Ask Something About This Document"

```tsx
async function handleAsk() {
  const conv = await conversationsApi.create(`Questions about ${file.filename}`);
  addConversation(conv);
  setActiveId(conv.id);
  setDocFilter(conv.id, file.id);
  router.push(`/chat/${conv.id}?doc_id=${file.id}`);
}
```

This creates a new conversation pre-scoped to the specific document. `setDocFilter(conv.id, file.id)` stores the association in the persisted conversation store, so even after a page refresh, navigating to this conversation will still include `?doc_id=...` in the URL and scope all RAG queries to this document.

---

## Layout Components

### `TopBar.tsx` — The Header

```tsx
function displayName(fullName: string | null | undefined, email: string): string {
  if (fullName && fullName.trim() && !PLACEHOLDER.test(fullName.trim())) {
    return fullName.trim();
  }
  return email.split("@")[0] ?? email;
}
```

`PLACEHOLDER` regex (`/^(string|number|boolean|null|...)$/i`) is a defensive guard against test data where someone literally set `full_name = "string"` or `full_name = "null"` — common mistakes during API testing. If the name looks like a type annotation, fall back to the email prefix.

**Logout flow:**
```typescript
function handleLogout() {
  clearToken();   // remove from localStorage + expire cookie
  clearAuth();    // clear Zustand auth state
  router.push("/login");
}
```

The Next.js middleware will then block any subsequent navigation to protected routes until the user logs in again.

### `ConversationSidebar.tsx` — Navigation with Active State

```tsx
const isActive = pathname === `/chat/${conv.id}`;

<Link
  href={docFilters[conv.id] ? `/chat/${conv.id}?doc_id=${docFilters[conv.id]}` : `/chat/${conv.id}`}
  className={`... ${isActive ? "bg-zinc-200 dark:bg-zinc-800 font-medium" : "hover:bg-zinc-100"}`}
>
```

`usePathname()` returns the current URL path as a string. Comparing it to the conversation's expected URL determines whether to apply the active style.

The sidebar adds `?doc_id=...` to links for conversations that have a document filter, ensuring the document scope is preserved when returning to a conversation.

**Delete on hover pattern:**

```tsx
<div className="group relative">
  <Link ...>...</Link>
  <button
    className="absolute right-2 hidden group-hover:flex ..."  ← only visible on hover
    onClick={() => deleteConversation(conv.id)}
  >
    <TrashIcon />
  </button>
</div>
```

`group` marks the parent. `group-hover:flex` activates when the parent is hovered. This is a pure CSS approach — no JavaScript state needed.

### The Mobile Responsive Sidebar

```tsx
// src/app/(app)/layout.tsx
const [sidebarOpen, setSidebarOpen] = useState(false);

return (
  <div className="flex flex-col h-screen">
    <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />
    <div className="flex flex-1 overflow-hidden">

      {/* Dark backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64        ← mobile: overlay
        md:relative md:translate-x-0             ← desktop: in-flow
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <ConversationSidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  </div>
);
```

On mobile (`< md = 768px`): The sidebar is `position: fixed` and slides in/out using CSS `transform`. A semi-transparent overlay covers the main content. Clicking the overlay closes the sidebar.

On desktop (`≥ md`): The sidebar is `position: relative` — part of the normal flow. `translate-x-0` is forced with `md:translate-x-0` so it's always visible regardless of `sidebarOpen`.

**`overflow-hidden` on the flex container:** Without this, the fixed-position sidebar would still visually appear but the hidden state (`-translate-x-full`) would let the content beneath scroll horizontally. `overflow-hidden` clips anything that transforms outside the viewport.

---

## UI Primitives

### `ThemeProvider.tsx` — Dark Mode Engine

```tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
    applyTheme(stored ?? preferred);
  }, []);

  function applyTheme(t: Theme) {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("theme", t);
  }
}
```

`window.matchMedia("(prefers-color-scheme: dark)")` reads the user's OS-level dark mode preference. The priority order is:
1. Explicitly stored user preference (`localStorage`)
2. OS preference (`prefers-color-scheme`)

`document.documentElement.classList.toggle("dark", condition)` adds the class if `condition` is true, removes it if false — cleaner than separate `add`/`remove` calls.

**`createContext` and `useContext`:**

```tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Consumer — any descendant component
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

The runtime `throw` in `useTheme` provides a clear error message if someone uses the hook outside the provider tree — much more helpful than the cryptic `TypeError: Cannot read properties of null` you'd get otherwise.

### `Skeleton.tsx` — Loading Placeholders

```tsx
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800", className)} />
  );
}
```

`animate-pulse` is a Tailwind animation that alternates opacity between 100% and 40%. When rendered in the same layout positions as the real content, it gives the user an accurate preview of the content structure before it loads — better UX than a spinner.

### `Toaster.tsx` — Toast Notification Overlay

```tsx
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`... animate-in fade-in slide-in-from-bottom-2 ...`}
        >
          {t.message}
          <button onClick={() => dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

**`animate-in fade-in slide-in-from-bottom-2`** are Tailwind animation utilities. They animate the element's entry: it fades in and slides up from 8px below. No JavaScript animation library required.

**`z-50`** places the toast stack above all other content (`z-index: 50` in Tailwind's scale).

The `Toaster` is mounted in `RootLayout`, so it's always present regardless of which page is shown.

---

## Utility Functions

### `cn()` — The Class Name Helper

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Every component that applies conditional classes uses `cn()`. Example:

```tsx
<div className={cn(
  "rounded-xl border px-4 py-3",
  isError && "border-red-300 bg-red-50",
  isSuccess && "border-green-300 bg-green-50",
  className  // allows parent to extend styles
)}>
```

`clsx` handles the conditional logic. `twMerge` resolves conflicts — if `className` passes `border-blue-500`, it correctly overrides `border-red-300` rather than having both in the class list (which would cause unpredictable CSS specificity).

### `parseSSEChunk()` — Typed Event Extraction

```typescript
export function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const raw = line.slice(6).trim();   // strip "data: " prefix
    try {
      events.push(JSON.parse(raw) as SSEEvent);
    } catch {
      // malformed — skip
    }
  }

  return events;
}
```

This is a **pure function** — same input always produces same output, no side effects. Pure functions are easy to test and reason about. The `try/catch` makes it defensive: a single malformed event doesn't crash the whole stream.

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Next.js has two categories of environment variables:

| Prefix | Available where | Example use |
|---|---|---|
| `NEXT_PUBLIC_` | Browser + Server | API URL, public keys |
| *(none)* | Server only | Database credentials, secrets |

`NEXT_PUBLIC_API_URL` is embedded into the browser bundle at build time. The browser calls this URL directly for streaming requests (SSE via `fetch`) and Axios API calls.

**Never put secrets in `NEXT_PUBLIC_` variables.** They're visible in the browser's JavaScript source.

---

## Configuration Files

### `next.config.mjs`

```javascript
const nextConfig = {
  transpilePackages: ["mermaid"],
};
export default nextConfig;
```

`transpilePackages` tells Next.js to run specific `node_modules` packages through Babel/SWC. Mermaid ships as ES modules with modern syntax that older bundler configurations can't handle. This flag forces Next.js to transpile it for compatibility.

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`@/*` is a path alias. `import { cn } from "@/utils/cn"` resolves to `src/utils/cn.ts`. Without this alias, you'd write `import { cn } from "../../../utils/cn"` — fragile paths that break when you move files.

### `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

PostCSS is a CSS transformation pipeline. The `@tailwindcss/postcss` plugin processes your CSS files: it finds all the Tailwind classes used in your project, generates the corresponding CSS rules, and removes everything unused. This is called **tree-shaking** for CSS — a production build with 50 components only ships CSS for the Tailwind classes those components actually use.

---

## Common Patterns Quick-Reference

### Optimistic Updates

```typescript
// Show the change immediately in the UI
addMessage(conversationId, userMsg);    // ← instant
// Then fire the API call in the background
await fetch("/api/...");                // ← may take a second
```

Users see their message appear instantly. If the API call fails, you can roll back the optimistic update. This pattern makes the UI feel fast.

### API + Store Sync Pattern

```typescript
// Delete example
async function deleteConversation(id: string) {
  await conversationsApi.delete(id);  // 1. API
  removeConversation(id);             // 2. local store
  router.push("/chat");              // 3. navigate
}
```

Always update the local store after a successful API call. Never rely on re-fetching the whole list after every mutation — it causes flicker and unnecessary requests.

### Cleanup in `useEffect`

```typescript
useEffect(() => {
  const interval = setInterval(pollStatus, 3000);
  return () => clearInterval(interval);  // ← always clean up
}, [fileId]);
```

Returning a cleanup function from `useEffect` is essential for effects that set up subscriptions, timers, or event listeners. Without cleanup, effects accumulate on every re-render, causing memory leaks and duplicate operations.

### TypeScript Narrowing

```typescript
// TypeScript doesn't know what `err` is — could be anything
} catch (err: unknown) {
  const text = err instanceof Error ? err.message : "Something went wrong";
}
```

Typing `catch` clauses as `unknown` (not `any`) forces you to narrow the type before using it. `err instanceof Error` is the standard guard. This prevents accidental `.message` access on non-Error objects like strings or numbers.

---

> **You've reached the end of the deep-dive.** Every file in this project is explained above. The architecture is intentionally layered: types at the bottom, API calls above them, stores that cache API results, hooks that orchestrate stores and side effects, and components that compose hooks into visual UI. Each layer has a single responsibility, and the TypeScript type system acts as a safety net that enforces the contracts between them.
