# Product Context

## Why This Project Exists

The built-in Windows clipboard only stores the last copied item. Power users frequently need to access previously copied content — text snippets, code blocks, screenshots — without manually saving them. This app fills that gap with a lightweight, always-available clipboard history.

## Problems It Solves

- **Lost clipboard content** — copying something new overwrites the previous item
- **Repetitive copy-paste workflows** — switching between documents to re-copy the same text
- **No image clipboard history** — Windows clipboard history has limited image support
- **Context switching overhead** — needing to find and re-copy content from source

## How It Should Work

1. App runs silently in the background after system boot
2. Every text/image clipboard change is captured and deduplicated via SHA-256 hashing
3. User presses `Win+V` → popup appears with searchable history
4. User clicks an entry → content is copied back to clipboard, popup auto-hides
5. User presses `Escape` or clicks away → popup hides

## User Experience Goals

- **Instant** — popup appears and vanishes without delay
- **Non-intrusive** — no taskbar icon, no tray clutter, just `Win+V`
- **Clean UI** — dark/light themes, minimal design, no unnecessary chrome
- **Reliable** — never lose clipboard content, never crash on edge cases
