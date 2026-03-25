# AI Document Companion — Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/MehediHasan-75/ai-document-companion-frontend/pulls)

> **Chat with your documents.** Upload files, ask questions, and get cited answers — streamed in real time with full AI reasoning transparency.

> 🔗 **Live demo:** coming soon

---

## Overview

AI Document Companion is a production-grade React/Next.js frontend for an AI-powered document Q&A system. Users upload documents, then converse with an AI that retrieves the most relevant passages and delivers answers with inline source citations.

What sets this apart from a standard chatbot UI:

- Responses are **streamed token-by-token** via Server-Sent Events — no waiting for a full response
- The AI's **internal reasoning** is surfaced in a collapsible ThinkingBlock panel before the answer appears
- Answers include **exact document citations**, so users can verify every claim
- Rich output — **Markdown, LaTeX, Mermaid diagrams, and syntax-highlighted code** — renders directly in chat

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Next.js App (App Router)                    │
│                                                                │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │  /dashboard │   │  /chat/:id   │   │  /login /register  │  │
│  └──────┬──────┘   └──────┬───────┘   └─────────┬──────────┘  │
│         │                 │                     │              │
│  ┌──────▼─────────────────▼─────────────────────▼──────────┐  │
│  │              Zustand Stores                              │  │
│  │   authStore · chatStore · conversationStore · fileStore  │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │         Axios Client (JWT interceptor + 401 redirect)    │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────┘
                              │ REST + SSE
                    ┌─────────▼──────────┐
                    │   Backend API      │
                    │  (FastAPI / RAG)   │
                    └────────────────────┘
```

**SSE event pipeline:** `status` → `thinking` → `delta` → `complete` / `error`

Each event type updates a distinct slice of UI state: status events update a progress indicator, thinking events accumulate into the collapsible ThinkingBlock, delta events append tokens to the streaming message, and complete/error events finalise or surface failures — all without unnecessary re-renders of unrelated components.

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/dashboard.webp" width="49%" alt="Dashboard — file library & upload" />
  <img src="docs/screenshots/chat-streaming.webp" width="49%" alt="Chat — streaming answer with citations" />
</p>
<p align="center">
  <em>Dashboard: drag-and-drop upload with live processing status polling</em>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <em>Chat: token-by-token streaming, inline Markdown, source citations</em>
</p>
<p align="center">
  <img src="docs/screenshots/chat-mermaid.webp" width="49%" alt="Chat — Mermaid diagram rendered inline" />
  <img src="docs/screenshots/thinking-block.webp" width="49%" alt="ThinkingBlock — AI reasoning panel" />
</p>
<p align="center">
  <em>Mermaid: AI-generated diagrams rendered without raw syntax leaking</em>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <em>ThinkingBlock: step-by-step reasoning exposed before the final answer</em>
</p>

---

## Features

| # | Feature | Detail |
|---|---------|--------|
| 1 | **Real-time streaming** | SSE-based token streaming via a custom `useStreamingChat` hook; handles `status`, `thinking`, `delta`, `done`, and `error` event types |
| 2 | **AI reasoning transparency** | `ThinkingBlock` component shows the model's step-by-step reasoning, auto-closes when the answer begins, and has its own internal scroll |
| 3 | **Document management** | Upload, process, delete files; live polling of processing status per file |
| 4 | **Source citations** | `SourcePanel` lists every retrieved passage that backs the answer |
| 5 | **Rich content rendering** | Markdown (React Markdown), LaTeX (KaTeX), Mermaid diagrams (light/dark), syntax-highlighted code blocks |
| 6 | **XSS protection** | All rendered HTML sanitized with DOMPurify before injection |
| 7 | **Multi-conversation sidebar** | Create, rename, switch, and delete conversations; background streams are preserved across navigation |
| 8 | **JWT authentication** | Register/login flow; JWT stored in Zustand `authStore` and attached to every API request via Axios interceptor |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2 |
| UI Library | React | 19.2 |
| Language | TypeScript | 5.9 |
| Styling | Tailwind CSS | 4 |
| State management | Zustand | 5 |
| HTTP client | Axios | 1.13 |
| Diagram rendering | Mermaid | 11 |
| Math rendering | KaTeX | 0.16 |
| Markdown parsing | React Markdown | 10 |
| HTML sanitization | DOMPurify | 3 |
| Forms & validation | React Hook Form + Zod | 7 / 4 |

**Performance notes:** Mermaid and KaTeX are browser-only and loaded only when the chat view mounts. Next.js App Router splits code at route boundaries automatically. The streaming SSE approach renders perceived latency near-zero — the first token appears within ~200 ms of the request.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (app)/                    # Authenticated route group
│   │   ├── dashboard/            # /dashboard — file library
│   │   └── chat/
│   │       ├── page.tsx          # /chat — new conversation entry
│   │       └── [conversationId]/ # /chat/:id — active conversation
│   └── (auth)/                   # Unauthenticated route group
│       ├── login/                # /login
│       └── register/             # /register
│
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx        # Main chat UI shell
│   │   ├── StreamingMessage.tsx  # Renders a single streamed message
│   │   ├── ThinkingBlock.tsx     # Collapsible reasoning panel
│   │   ├── RichContent.tsx       # Markdown / LaTeX / code dispatcher
│   │   ├── MermaidDiagram.tsx    # Mermaid renderer with XSS guard
│   │   └── SourcePanel.tsx       # Citation list sidebar
│   ├── files/                    # File upload & management components
│   ├── layout/
│   │   └── ConversationSidebar.tsx
│   └── ui/                       # Shared primitive UI components
│
├── hooks/
│   └── useStreamingChat.ts       # SSE streaming, event parsing, abort
│
├── store/                        # Zustand stores (client state)
│   ├── authStore.ts
│   ├── chatStore.ts
│   ├── conversationStore.ts
│   ├── fileStore.ts
│   └── toastStore.ts
│
├── types/                        # Shared TypeScript type definitions
├── utils/                        # Utility functions
│
└── api/                          # Axios API modules
    ├── auth.ts                   # register / login / me
    ├── files.ts                  # list / upload / process / status / delete
    └── conversations.ts          # create / list / messages / delete / rename
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- The [AI Document Companion backend](https://github.com/MehediHasan-75/ai-document-companion-backend) running at `http://localhost:8000`

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/MehediHasan-75/ai-document-companion-frontend.git
cd ai-document-companion-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local — see Environment Variables section below

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint (Next.js config) |

TypeScript is configured in **strict mode** with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitReturns`.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:8000` |

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Usage Walkthrough

**1. Authenticate**
Register at `/register`, then log in at `/login`. The JWT is stored in `authStore` and automatically attached to every request via an Axios interceptor.

**2. Upload documents**
Go to `/dashboard`. Drag and drop one or more files onto the `FileUploader`. The dashboard polls each file's processing status and marks it ready when the backend finishes indexing.

**3. Start a conversation**
Click **New Chat** in the sidebar or navigate to `/chat`. Type a question — `useStreamingChat` opens an SSE connection and appends tokens live as `delta` events arrive. The `ThinkingBlock` reveals the model's reasoning before the final answer.

**4. Review citations**
Once the answer completes, open the `SourcePanel` to see exactly which document passages the AI cited. Click any source to view the verbatim excerpt.

---

## Why This Project Matters

Building this UI required solving several non-trivial frontend engineering problems:

- **Streaming state management across navigation** — background streams are kept alive in `conversationStore`, trading a small memory footprint for seamless UX continuity; a user navigating away does not kill the in-flight stream and can return to see the full response.
- **XSS in AI-generated HTML** — DOMPurify sanitization with an SVG allowlist adds a DOM-parse overhead on every AI response but prevents mXSS from Mermaid's `<foreignObject>` output reaching the DOM unsanitised.
- **Concurrent event types in a single SSE stream** — a module-level `activeController` ref enables cross-page SSE cancellation with zero prop drilling, at the cost of limiting the client to a single active stream at a time (acceptable given sequential conversation semantics).
- **Mermaid + SSR** — Mermaid deferred rendering (skipped while `isStreaming=true`) avoids partial-diagram parse errors at the cost of a brief visual delay post-stream; it also required a carefully gated `useEffect` mount strategy to prevent SSR crashes in Next.js.

---

## Key Learnings

- Designing a robust custom hook (`useStreamingChat`) for SSE with per-conversation isolation and graceful abort
- Integrating multiple browser-only third-party renderers (Mermaid, KaTeX) safely within a Next.js App Router (SSR) environment
- Applying DOMPurify for XSS sanitization in a React context where dangerouslySetInnerHTML is unavoidable
- Structuring Zustand stores to handle cross-cutting concerns (auth, toasts, file state, conversation state) without prop drilling

---

## Roadmap

- [ ] Mobile-responsive layout for chat and dashboard
- [ ] Multi-file drag-and-drop with batch progress indicators
- [ ] Conversation search / full-text filter in sidebar
- [ ] Export conversation as PDF or Markdown

---

## FAQ

**The app loads but all API calls fail.**
Verify `NEXT_PUBLIC_API_URL` in `.env.local` points to the running backend. Test with `curl $NEXT_PUBLIC_API_URL/health`.

**Mermaid diagrams display as raw text.**
Mermaid is browser-only and initialises asynchronously. If raw text appears, a `useEffect` guard is missing or the component is being rendered server-side — check that `MermaidDiagram` is only mounted in the browser.

**Streaming stops mid-response with no error message.**
Navigating away from a conversation tab triggers an SSE abort. The partial response is preserved in `conversationStore` — return to the conversation to see what arrived before the abort.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a conventional message: `git commit -m "feat: describe your change"`
4. Push and open a Pull Request against `main`

Please follow the existing conventions: TypeScript strict mode, Tailwind utility classes, Zustand for all shared state.

---

## Author

**Mehedi Hasan**
[GitHub](https://github.com/MehediHasan-75) · [LinkedIn](https://www.linkedin.com/in/mehedi-hasan-075379206/) · [Portfolio](https://mehedi0.me/) · [Blog](https://mdmehedi.tech/)

---

## License

[MIT](LICENSE)
