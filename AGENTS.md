# AGENTS.md — Clipboard Manager

## Project Overview

A **Tauri v2 desktop clipboard manager** that silently monitors the OS clipboard and presents a searchable history popup triggered by `Win+V`. Built with a Rust backend and React 19 frontend.

## Architecture

- **Backend (Rust):** `src-tauri/src/` — Clipboard listener via `clipboard-master`, global shortcut registration, Tauri commands and event emission.
- **Frontend (React + TypeScript):** `src/` — UI built with React 19, Tailwind CSS v4, and shadcn/ui (New York style). State managed via React Context (`HistoryContext`).
- **Config:** `src-tauri/tauri.conf.json` (Tauri window/app config), `vite.config.ts` (Vite + Tailwind), `components.json` (shadcn/ui).

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Tauri v2 |
| Backend | Rust (2021 edition) |
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS v4, shadcn/ui, tw-animate-css |
| UI Primitives | Radix UI |
| Toasts | Sonner |
| Smooth Scroll | Lenis |
| Package Manager | Bun |

## Conventions

### Rust (Backend)

- Use Tauri v2 APIs — `tauri::command`, `Emitter`, `Manager` traits.
- Communicate with the frontend via **Tauri events** (`app_handle.emit()`), not polling.
- Register Tauri plugins in the `run()` function in `lib.rs`.
- Desktop-only features (autostart, global shortcuts) are gated behind `#[cfg(desktop)]`.
- Keep clipboard reading through `tauri-plugin-clipboard-manager`, not raw OS APIs.

### TypeScript / React (Frontend)

- **Functional components only** — no class components.
- State management via **React Context** (`HistoryContext` pattern). No Redux/Zustand.
- Use `@tauri-apps/api` and `@tauri-apps/plugin-*` packages for all Tauri interop (events, clipboard, autostart).
- Import paths use the `@/` alias (mapped to `src/`).
- UI components go in `src/components/ui/` (shadcn/ui primitives) — do not modify these directly.
- Custom components go in `src/components/` organized by feature (e.g., `history/`, `toggles/`).
- Hooks go in `src/hooks/`.
- Use `lucide-react` for icons.
- Toast notifications via `sonner` (`toast.success()`, `toast.error()`).

### Styling

- Tailwind CSS v4 with CSS variables for theming (light/dark defined in `App.css`).
- Use `cn()` utility from `@/lib/utils` for conditional class merging.
- Color tokens use **oklch** color space.
- Respect the existing shadcn/ui design system — don't introduce arbitrary colors or spacing.

### Window Behavior

- The app window is **borderless, transparent, and hidden by default**.
- It **auto-hides on blur** (losing focus) and on `Escape` key press.
- It **skips the taskbar** — it's a utility popup, not a primary window.
- Toggle visibility via `Win+V` global shortcut (handled in Rust).

## File Structure

```
clipboard-manager/
├── src/                          # React frontend
│   ├── App.tsx                   # Root component (theme, sidebar, content)
│   ├── App.css                   # Tailwind config + theme variables
│   ├── main.tsx                  # React entry point
│   ├── components/
│   │   ├── app-sidebar.tsx       # Collapsible sidebar
│   │   ├── theme-provider.tsx    # Dark/light/system theme context
│   │   ├── history/              # Core clipboard history feature
│   │   │   ├── index.tsx         # Composition root
│   │   │   ├── context-provider.tsx  # State + actions
│   │   │   ├── header.tsx        # Search bar + reset
│   │   │   ├── scroll-area.tsx   # History list + event listener
│   │   │   └── active-clipboard-item.tsx
│   │   ├── toggles/              # Settings toggles
│   │   │   ├── mode-toggle.tsx    # Theme switcher
│   │   │   └── autostart-toggle.tsx
│   │   └── ui/                   # shadcn/ui primitives (do not edit)
│   ├── hooks/
│   └── lib/
│       └── utils.ts              # cn() utility
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   └── lib.rs                # App setup, clipboard listener, commands
│   ├── tauri.conf.json           # Window + app configuration
│   ├── Cargo.toml                # Rust dependencies
│   └── capabilities/             # Tauri permission manifests
├── package.json
├── vite.config.ts
└── components.json               # shadcn/ui config
```

## Development

- **Dev server:** `bun tauri dev` (starts both Vite frontend on `:1420` and Rust backend)
- **Build:** `bun tauri build`
- **Add shadcn/ui components:** `bunx shadcn@latest add <component>`

## Key Patterns

1. **Clipboard events flow:** OS clipboard change → Rust `Handler::on_clipboard_change` → SHA-256 hash content → skip if duplicate → `app_handle.emit("clipboard-new", ClipboardEntry)` → React `listen("clipboard-new")` in `HistoryScrollArea` → O(1) Set dedup → prepend to `history` state.
2. **Copy back to clipboard:** Click history item → text: `writeText()` via plugin, images: `invoke('copy_image_to_clipboard')` via Rust command → toast notification.
3. **Responsive layout:** `ResizeObserver` tracks header and active-item heights to dynamically calculate the scroll area's `maxHeight`.

---

## Memory Bank

All agents working on this project have their memory reset between sessions. The **Memory Bank** (`memory-bank/` directory) is the shared knowledge base that ALL agents MUST use to understand the project and continue work effectively.

### Mandatory Rules

1. **Read ALL memory bank files at the start of EVERY task** — this is not optional.
2. After every memory reset, the Memory Bank is the ONLY link to previous work.
3. Maintain with precision — effectiveness depends entirely on its accuracy.

### Core Files (Required)

| File | Purpose |
|---|---|
| `projectbrief.md` | Foundation — core requirements, goals, scope |
| `productContext.md` | Why this exists, problems solved, UX goals |
| `activeContext.md` | Current focus, recent changes, next steps, active decisions |
| `systemPatterns.md` | Architecture, technical decisions, component relationships |
| `techContext.md` | Technologies, dev setup, constraints, dependencies |
| `progress.md` | What works, what's left, known issues, decision evolution |

### When to Update

- After implementing significant changes
- When discovering new project patterns or gotchas
- When user requests with **"update memory bank"**
- When context needs clarification

### Additional Context

Create additional files/folders within `memory-bank/` when they help organize complex features, integration specs, API docs, or testing strategies.

---

## Git Commit Conventions

All commits MUST follow the **Conventional Commits** format:

```
<type>(optional scope): <description>
```

### Types

| Type | When to Use | Example |
|---|---|---|
| `feat` | New capability for the user | `feat(clipboard): add image support` |
| `fix` | Bug fix | `fix(active-item): update preview on image copy` |
| `docs` | Documentation only | `docs: update README with architecture` |
| `style` | Formatting, whitespace, imports | `style(auth): fix indentation` |
| `refactor` | Code restructure, no behavior change | `refactor(utils): split date parsing helpers` |
| `perf` | Performance improvement | `perf(db): add index to speed up search` |
| `test` | Adding or fixing tests | `test(auth): add login validation tests` |
| `build` | Dependencies or build system | `build(deps): add image crate for PNG encoding` |
| `ci` | CI configuration changes | `ci: add github action for unit tests` |
| `chore` | Miscellaneous (gitignore, file moves) | `chore: add .env to .gitignore` |
| `revert` | Reverting a previous commit | `revert: feat(header): add sticky navigation` |

### Key Question to Ask

| Type | Ask Yourself |
|---|---|
| `feat` | Did I add a new capability? |
| `fix` | Did I fix something broken? |
| `docs` | Did I only change documentation? |
| `style` | Did I only format code? |
| `refactor` | Did I change structure without changing behavior? |
| `perf` | Did I make the code faster? |
| `test` | Did I add or fix tests? |
| `build` | Did I change dependencies or build scripts? |
| `ci` | Did I change CI pipeline config? |
| `chore` | Is it a miscellaneous task? |

