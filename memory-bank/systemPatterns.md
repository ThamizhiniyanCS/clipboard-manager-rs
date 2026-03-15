# System Patterns

## Architecture

```
┌─────────────────┐     Tauri Event      ┌──────────────────────┐
│   Rust Backend   │ ──────────────────► │   React Frontend      │
│                  │  "clipboard-new"     │                      │
│  clipboard-master│  ClipboardEntry      │  HistoryContext       │
│  SHA-256 dedup   │                      │  O(1) Set dedup       │
│  PNG encoding    │ ◄────────────────── │  UI rendering         │
│                  │  invoke() commands   │                      │
└─────────────────┘                      └──────────────────────┘
```

## Key Technical Decisions

1. **Backend-side deduplication** — Rust compares SHA-256 hash against `last_hash` before emitting, reducing IPC overhead
2. **Content hashing as identity** — SHA-256 hash is the entry ID, used for React keys and dedup
3. **Base64 PNG for images** — clipboard images encoded as data URIs, stored in-memory only
4. **Separate Rust command for image copy** — `copy_image_to_clipboard` avoids JS plugin type mismatches
5. **First-launch autostart** — flag file (`.autostart-initialized`) in app data dir ensures one-time enable

## Component Relationships

- `lib.rs` → `Handler::on_clipboard_change` → tries text, falls back to image → emits `ClipboardEntry`
- `HistoryContextProvider` → owns all state: history array, active item, search filter, refs
- `HistoryScrollArea` → listens for `clipboard-new` events, calls `addClipboardEntry`
- `ActiveClipboardItem` → reads `activeClipboardItem` from context, renders text/image
- `AppSidebar` → contains `AutostartToggle` and `ModeToggle` in footer

## Critical Implementation Paths

### Clipboard Entry Lifecycle
1. OS clipboard changes → `clipboard-master` fires `on_clipboard_change`
2. Try `get_clipboard_text()` → if non-empty, hash content, check dedup, emit
3. Else try `get_clipboard_image()` → encode RGBA→PNG→base64, hash, check dedup, emit
4. Frontend `listen("clipboard-new")` → `addClipboardEntry()` → set active item → dedup check → prepend to history

### Image Copy-Back
1. User clicks image entry → `copyItemToClipboard(entry)`
2. Extract base64 from data URI → `invoke('copy_image_to_clipboard', { base64Png })`
3. Rust: decode base64 → `image::load_from_memory` → `to_rgba8()` → `clipboard().write_image()`
