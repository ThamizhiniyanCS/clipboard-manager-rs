# Clipboard Manager

A lightweight desktop clipboard manager built with **Tauri v2**, **Rust**, and **React 19**. Silently monitors the OS clipboard and presents a searchable history popup triggered by `Win+V`.

## Features

- 📋 **Clipboard History** — Automatically captures text and image clipboard entries with SHA-256 deduplication
- 🔍 **Instant Search** — Filter history entries by content in real time
- 🖼️ **Image Support** — Captures screenshots and copied images, displayed as 16:9 cards with click-to-copy
- 📌 **Active Item Preview** — Shows the current clipboard content (text or image) at the top
- 🚀 **Autostart** — Launches on system boot by default (toggleable in sidebar)
- 🎨 **Theme Support** — Light, dark, and system theme modes
- ⌨️ **Global Shortcut** — `Win+V` toggles the popup window from anywhere
- 🪟 **Utility Window** — Borderless, transparent, taskbar-skipping popup that auto-hides on blur or `Escape`

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Tauri v2 |
| Backend | Rust (2021 edition) |
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS v4, shadcn/ui (New York), Radix UI |
| Toasts | Sonner |
| Smooth Scroll | Lenis |
| Package Manager | Bun |

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Bun](https://bun.sh/) (or Node.js 18+)
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

### Development

```bash
# Install dependencies
bun install

# Start dev server (Vite frontend + Rust backend)
bun tauri dev
```

### Build

```bash
# Build production installer
bun tauri build
```

## Architecture

```
clipboard-manager/
├── src/                          # React frontend
│   ├── App.tsx                   # Root component
│   ├── components/
│   │   ├── history/              # Core clipboard history feature
│   │   │   ├── context-provider  # State + clipboard actions
│   │   │   ├── scroll-area       # History list with event listener
│   │   │   ├── active-clipboard-item  # Current clipboard preview
│   │   │   └── header            # Search bar + reset
│   │   ├── toggles/              # Settings (theme, autostart)
│   │   └── ui/                   # shadcn/ui primitives
│   └── lib/utils.ts              # cn() utility
├── src-tauri/                    # Rust backend
│   ├── src/lib.rs                # Clipboard listener, commands, setup
│   └── capabilities/             # Tauri permission manifests
└── task.md                       # Optimization tracker
```

### Event Flow

1. **OS clipboard change** → Rust `clipboard-master` handler fires
2. **Content hashing** → SHA-256 hash computed, duplicate check against `last_hash`
3. **Structured event** → `ClipboardEntry` (id, content, contentType, timestamp) emitted via Tauri event
4. **Frontend capture** → React listener receives entry, O(1) Set dedup, prepends to history
5. **Copy back** → Click entry → text via `writeText()`, images via Rust `copy_image_to_clipboard` command

## License

MIT
