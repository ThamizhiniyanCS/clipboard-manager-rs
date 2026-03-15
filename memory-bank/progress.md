# Progress

## What Works

- ✅ Clipboard text monitoring with SHA-256 dedup (backend + frontend)
- ✅ Clipboard image monitoring with PNG encoding and base64 data URIs
- ✅ Searchable history list with instant filtering
- ✅ Copy text back to clipboard via `writeText()`
- ✅ Copy images back to clipboard via Rust `copy_image_to_clipboard` command
- ✅ Active clipboard item preview (text + images)
- ✅ Dark/light/system theme toggle
- ✅ Autostart toggle with first-launch default enable
- ✅ Global `Win+V` shortcut to toggle popup
- ✅ Auto-hide on blur and Escape key
- ✅ 16:9 aspect-ratio image cards in history
- ✅ Sidebar adapts toggles for collapsed/expanded modes
- ✅ Page overflow locked to viewport

## What's Left to Build

- Pin functionality (pinned items at top, survive resets)
- Keyboard navigation (↑/↓ + Enter)
- History size cap (configurable max limit)
- Search input debounce (~200ms)
- List virtualization for large histories
- Tray icon integration
- React error boundaries

## Known Issues

- `@tauri-apps/api` version mismatch between direct install and plugin-bundled version (workaround: use Rust commands for image ops)
- IDE shows CSS lint warnings for Tailwind v4 directives (`@theme`, `@apply`, `@custom-variant`) — these are false positives
- IDE shows "Cannot find module" errors when `node_modules` is not indexed — resolve with `bun install`

## Evolution of Decisions

1. **String → ClipboardEntry** — started with `string[]` history, refactored to structured `ClipboardEntry` with id, content, contentType, timestamp, pinned
2. **Frontend-only dedup → Backend+Frontend** — moved primary dedup to Rust (SHA-256 hash comparison), kept frontend Set as secondary guard
3. **JS writeImage → Rust command** — JS plugin `writeImage()` broke due to type conflicts, replaced with custom Rust `copy_image_to_clipboard` command
4. **Tooltip preview → HoverCard → Inline 16:9** — iterated through image preview approaches, settled on inline 16:9 cards
5. **Always-enable autostart → First-launch flag** — changed from re-enabling on every launch to respecting user's toggle via flag file
