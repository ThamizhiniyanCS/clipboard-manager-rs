# Tech Context

## Technologies

| Layer | Technology | Version |
|---|---|---|
| Runtime | Tauri | v2 |
| Backend | Rust | 2021 edition |
| Frontend | React | 19 |
| Language | TypeScript | 5.x |
| Bundler | Vite | 7 |
| Styling | Tailwind CSS | v4 |
| UI Kit | shadcn/ui (New York) | latest |
| UI Primitives | Radix UI | latest |
| Toasts | Sonner | latest |
| Smooth Scroll | Lenis | latest |
| Package Manager | Bun | latest |

## Key Rust Crates

- `clipboard-master` — OS clipboard change detection
- `tauri-plugin-clipboard-manager` — read/write clipboard through Tauri
- `tauri-plugin-autostart` — OS startup registration
- `tauri-plugin-global-shortcut` — system-wide hotkeys
- `sha2` — SHA-256 content hashing
- `image` (PNG feature only) — RGBA→PNG encoding for clipboard images
- `base64` — PNG bytes to data URI conversion

## Development Setup

```bash
bun install          # Install frontend deps
bun tauri dev        # Start dev server (Vite :1420 + Rust backend)
bun tauri build      # Build production installer
bunx shadcn@latest add <component>  # Add shadcn/ui components
```

## Technical Constraints

- **No persistence** — all data is in-memory, lost on app close
- **Windows-first** — `Win+V` shortcut, NSIS installer
- **Borderless window** — transparent, no decorations, skips taskbar
- **Image size** — large screenshots become large base64 strings in memory
- **Tauri API version mismatch** — `@tauri-apps/api` vs plugin-bundled version can cause type conflicts (solved by using Rust commands for image ops)

## Dependencies Note

- `@tauri-apps/plugin-clipboard-manager` bundles its own `@tauri-apps/api`, creating type conflicts for `Image`. Always use `invoke()` for image operations, never the JS `writeImage()` API.
