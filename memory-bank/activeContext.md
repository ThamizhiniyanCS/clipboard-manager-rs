# Active Context

## Current Work Focus

Optimization and feature completion after initial architecture improvements.

## Recent Changes

- **Image clipboard support** — backend detects images, encodes as base64 PNG, frontend renders 16:9 cards with copy-back via Rust command
- **Active item fix** — `setActiveClipboardItem` moved before dedup guard so it always reflects latest clipboard content
- **Sidebar UI fix** — autostart toggle adapts to collapsed/expanded sidebar, page overflow locked
- **Autostart on first launch** — uses flag file in app data dir to enable once, respects user toggle
- **README.md rewrite** — replaced template text with full project documentation

## Next Steps

- [ ] Implement pin functionality (pinned items stay at top, survive resets)
- [ ] Add keyboard navigation (↑/↓ arrows + Enter to copy)
- [ ] Add history size cap (configurable max limit)
- [ ] Add search input debounce (~200ms)
- [ ] Add list virtualization for large histories
- [ ] Tray icon integration
- [ ] React error boundaries

## Active Decisions

- **No persistence** — user explicitly opted out of database/file storage
- **Backend-first dedup** — SHA-256 hashing happens in Rust, frontend has secondary O(1) Set guard
- **Base64 data URIs for images** — simpler than temp file management for sessiononly data
- **Rust command for image copy-back** — bypasses JS `writeImage` type mismatch between `@tauri-apps/api` versions

## Important Patterns

- Always update active clipboard item BEFORE dedup guard (otherwise duplicates don't update the preview)
- Image copy uses `invoke('copy_image_to_clipboard')` not the JS clipboard plugin
- ClipboardEntry has `contentType: "text" | "image"` — always check this when rendering
