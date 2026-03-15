# Ollama Chat UI

A modern web interface for chatting with [Ollama](https://ollama.com) models locally. Built with React, TypeScript, Vite, and Tailwind CSS. Supports streaming responses, multiple chat sessions, file attachments, and configurable server/model settings.

![Ollama Chat UI screenshot](Screenshot%202026-03-15%20at%201.10.13%20PM.png)

**Topics (add these as [GitHub repository topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics) for discoverability):**  
`ollama` `ollama-ui` `llm` `local-ai` `local-llm` `chat-ui` `streaming-chat` `react` `typescript` `vite` `tailwindcss` `openai-alternative` `llama` `ai-chat` `markdown` `zustand`

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- **Ollama** — [Install Ollama](https://ollama.com) and ensure it is running (default: `http://localhost:11434`). Pull at least one model, e.g. `ollama pull llama3.2`

---

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app

**Option A — Frontend only (Ollama must be running; chats stored in memory)**  
Uses Vite dev server with proxies to Ollama and the chats API.

```bash
npm run dev
```

- App: **http://localhost:3000**
- Vite proxies `/api` → Ollama (`http://localhost:11434`)
- Vite proxies `/chats-api` → Chats server (`http://localhost:3080`). If the chats server is not running, session list/load/save will fail; the rest of the app still works.

**Option B — Chats API server only**  
Stores and loads chat sessions as JSON files in the `chats/` directory.

```bash
npm run server
```

- Chats API: **http://localhost:3080**  
- Set `CHATS_DIR` to change storage directory (default: `./chats`)  
- Set `CHATS_PORT` to change port (default: `3080`)

**Option C — Full stack (recommended for development)**  
Starts both the Chats API server and the Vite dev server.

```bash
npm run dev:full
```

Then open **http://localhost:3000** in your browser.

### 3. Build for production

```bash
npm run build
```

Output is in `dist/`. Serve with any static host. For production you must either:

- Serve the app from a server that proxies `/api` to your Ollama instance and `/chats-api` to your Chats API, or  
- Configure **Settings → Server Configuration** in the app to point to your Ollama URL (and Chats API URL if you run it separately).

### 4. Preview production build locally

```bash
npm run preview
```

### 5. Other scripts

| Script            | Description                    |
|-------------------|--------------------------------|
| `npm run lint`    | Run ESLint                     |
| `npm run test`    | Run Vitest unit tests          |
| `npm run test:coverage` | Run tests with coverage  |
| `npm run test:e2e`     | Run E2E tests (if configured)  |

---

## Project Structure

```
ollama-chat-ui/
├── index.html              # HTML entry; loads /src/main.tsx
├── package.json            # Scripts and dependencies
├── vite.config.ts          # Vite config, aliases, dev proxies
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── server/
│   └── index.js            # Chats API (Express): list/save/load/rename/delete sessions
├── chats/                  # Chat session JSON files (when using Chats API)
├── public/                 # Static assets (e.g. icons)
└── src/
    ├── main.tsx            # App entry: React root, QueryClient, ErrorBoundary
    ├── App.tsx             # Main app: init, send message, stream from Ollama, debounced save
    ├── index.css           # Global styles (Tailwind)
    ├── types/              # Shared TypeScript types (Message, ChatSession, Model, FileMetadata, etc.)
    ├── store/              # Zustand stores
    │   ├── chatStore.ts    # Messages, sessions, current session, streaming state
    │   ├── configStore.ts  # Server URL, API key, connection status (persisted)
    │   └── modelStore.ts   # Available models, selected model
    ├── utils/
    │   └── apiClient.ts    # Axios-based client for Ollama (streaming, retries, testConnection)
    ├── services/
    │   ├── chatStorageService.ts  # listChats, loadChat, saveChat, deleteChat, renameChat (via /chats-api)
    │   ├── ChatService.ts         # Chat-related API helpers if any
    │   └── ModelService.ts        # Fetch Ollama models (e.g. /api/tags)
    └── components/
        ├── ErrorBoundary.tsx      # Catches React errors
        ├── ErrorMessageBanner.tsx # Displays connection/API errors
        ├── Chat/
        │   ├── ChatInterface.tsx  # Layout: sidebar (sessions), message list, input, settings tabs
        │   ├── MessageList.tsx    # Renders messages (Markdown, code highlight)
        │   ├── MessageInput.tsx   # Text area, send, attach files, model selector, creativity
        │   └── TypingIndicator.tsx
        ├── Settings/
        │   ├── ServerConfig.tsx   # Server URL, API key, test connection
        │   ├── ModelSelector.tsx  # List and select Ollama model
        │   └── SearchSettings.tsx # Search-related options
        └── Files/
            └── FileUploader.tsx  # Drag-and-drop / file picker for attachments
```

**Path aliases (in Vite/TS):** `@/` → `src/`, `@components`, `@services`, `@store`, `@types`, `@utils`, `@hooks`.

---

## Functionalities

- **Chat with Ollama**  
  Sends user messages to Ollama `POST /api/chat` with the selected model. Supports **streaming**: responses appear token-by-token. Conversation history is sent with each request.

- **Multiple chat sessions**  
  Create new chats, switch between them, and (when the Chats API is running) list/load/save sessions. Sessions are stored as JSON files in `chats/` via the optional Chats API server.

- **Session management**  
  - **New chat** — Start a new session (current one is saved if it has messages).  
  - **Sidebar** — List of sessions; click to load.  
  - **Rename** — Edit session title inline.  
  - **Delete** — Remove a session (and its file on the Chats API).  
  Sessions are auto-saved (debounced) when the Chats API is available.

- **Model selection**  
  Fetches models from Ollama (`/api/tags`) and lets you choose the model in the input bar or in **Settings → Model**. You must select a model before sending messages.

- **Server configuration**  
  In **Settings → Server Configuration** you can set:  
  - **Server URL** — Ollama base URL (default `http://localhost:11434`). In dev, you can use the app URL so the Vite proxy is used.  
  - **API Key** — Optional.  
  Connection test and status (e.g. response time) are shown.

- **File attachments**  
  Attach files (e.g. text) to a message. File content is included in the user message sent to Ollama (e.g. `[File: name]\ncontent`). Supports drag-and-drop and file picker.

- **Message display**  
  Assistant messages are rendered as **Markdown** with **syntax highlighting** for code blocks. Token usage and duration are shown when the stream completes.

- **Creativity / temperature**  
  The input area can expose a creativity (temperature) control for requests (if wired in the UI).

- **Error handling**  
  Connection and API errors are shown in a banner. React errors are caught by the Error Boundary.

- **Persistence**  
  Server URL and connection-related settings are persisted (e.g. in `localStorage` via Zustand persist). Chat content is persisted only when the Chats API server is running and the app is configured to use it (e.g. via the `/chats-api` proxy in dev).

---

## Environment / Configuration

- **Ollama** — Default base URL: `http://localhost:11434`. Override in the app via Settings.
- **Chats API** — Default: `http://localhost:3080`. In dev, the app calls `/chats-api`, which Vite proxies to `http://localhost:3080`.
  - Server env: `CHATS_DIR` (default: `./chats`), `CHATS_PORT` (default: `3080`).

---

## License

Private project. Use and modify as needed.
