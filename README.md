# AI Document Companion — Frontend

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

> Chat with your documents. Upload files, ask questions, and get cited answers — streamed in real time.

## Description

AI Document Companion is a React/Next.js frontend for an AI-powered document Q&A system. Users upload documents, then converse with an AI that retrieves relevant passages and answers questions with inline source citations. The app streams responses token-by-token via SSE, renders rich content (Markdown, LaTeX, Mermaid diagrams), and surfaces the AI's reasoning in collapsible thinking blocks.

---

## Screenshots

> **Note:** Replace the placeholders below with actual screenshots.

| Screen | Preview |
|--------|---------|
| Dashboard — file library | `docs/screenshots/dashboard.png` |
| Chat — streaming answer with citations | `docs/screenshots/chat-streaming.png` |
| Chat — Mermaid diagram rendered inline | `docs/screenshots/chat-mermaid.png` |
| ThinkingBlock — expanded reasoning panel | `docs/screenshots/thinking-block.png` |

---

## Features

- **Document management** — upload, process, and delete files; track processing status
- **Streaming chat** — SSE-based token streaming with per-conversation state and abort support
- **Thinking blocks** — collapsible panel that surfaces the model's step-by-step reasoning before the final answer
- **Rich content rendering** — Markdown, LaTeX (KaTeX), Mermaid diagrams (light/dark themed), syntax-highlighted code
- **Source citations** — SourcePanel lists the retrieved document passages that back each answer
- **Multi-conversation sidebar** — create, rename, switch, and delete conversations without losing in-flight streams
- **Authentication** — JWT-based register/login flow with protected routes
- **XSS-safe** — all HTML-containing content sanitized with DOMPurify before rendering

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
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

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── login/                  # /login
│   ├── register/               # /register
│   ├── dashboard/              # /dashboard — file library
│   └── chat/
│       ├── page.tsx            # /chat — new conversation entry
│       └── [conversationId]/   # /chat/:id — active conversation
│
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx      # Main chat UI shell
│   │   ├── StreamingMessage.tsx # Renders a single streamed message
│   │   ├── ThinkingBlock.tsx   # Collapsible reasoning panel
│   │   ├── RichContent.tsx     # Markdown / LaTeX / code dispatcher
│   │   ├── MermaidDiagram.tsx  # Mermaid renderer with XSS guard
│   │   └── SourcePanel.tsx     # Citation list sidebar
│   ├── dashboard/
│   │   └── FileUploader.tsx    # Drag-and-drop file upload
│   └── layout/
│       └── ConversationSidebar.tsx
│
├── hooks/
│   └── useStreamingChat.ts     # SSE streaming, event parsing, abort
│
├── store/                      # Zustand stores
│   ├── authStore.ts
│   ├── chatStore.ts
│   ├── conversationStore.ts
│   ├── fileStore.ts
│   └── toastStore.ts
│
└── api/                        # Axios API modules
    ├── auth.ts                 # register / login / me
    ├── files.ts                # list / upload / process / status / delete
    └── conversations.ts        # create / list / messages / delete / rename
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- A running instance of the [AI Document Companion backend](https://github.com/) (default: `http://localhost:8000`)

### Clone & install

```bash
git clone https://github.com/<your-username>/ai-document-companion-frontend.git
cd ai-document-companion-frontend
npm install
```

### Environment setup

```bash
cp .env.example .env.local
# then edit .env.local
```

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:8000` |

---

## Usage Walkthrough

1. **Authenticate** — Register a new account at `/register`, then log in at `/login`. The JWT is stored in Zustand's `authStore` and attached to every subsequent request.

2. **Upload documents** — Navigate to `/dashboard`. Use the drag-and-drop `FileUploader` to upload one or more files. The dashboard polls the processing status until each file is ready to query.

3. **Start a conversation** — Click **New Chat** in the sidebar or navigate to `/chat`. Type a question; `useStreamingChat` opens an SSE connection to the backend. Tokens arrive as `delta` events and are appended live. A `ThinkingBlock` shows the model's reasoning before the final answer appears.

4. **Review citations** — After the answer completes, open the `SourcePanel` to see which document passages the AI cited. Click a source to view the exact excerpt.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to your fork: `git push origin feat/my-feature`
5. Open a Pull Request against `main`

Please follow the existing code style (TypeScript strict, Tailwind utility classes, Zustand stores for shared state).

---

## Roadmap

- [ ] Mobile-responsive layout for chat and dashboard
- [ ] Multi-file drag-and-drop with batch progress indicators
- [ ] Conversation search / full-text filter in sidebar
- [ ] Export conversation as PDF or Markdown

---

## FAQ

**Q: The app loads but API calls fail immediately.**
A: Check that `NEXT_PUBLIC_API_URL` in `.env.local` points to the running backend and that the backend is accepting requests (try `curl $NEXT_PUBLIC_API_URL/health`).

**Q: Mermaid diagrams show raw text instead of rendering.**
A: Mermaid initialises asynchronously. If you see raw text on first load, it is likely a race condition in a custom SSR setup. The component uses a `useEffect` mount guard — ensure you are not running it in a non-browser environment.

**Q: Streaming stops mid-response without an error.**
A: The SSE connection is tied to the browser tab. Navigating away while a stream is active triggers an abort. Switch back to the conversation — the partial response is preserved in `conversationStore` and the UI will show what arrived before the abort.

---

## License

[MIT](LICENSE)

---

## Contact

Have questions or feedback? Open an issue on GitHub or reach out via the contact details on your profile.
