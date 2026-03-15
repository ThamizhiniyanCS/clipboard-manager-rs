# Clipboard Manager — Optimization & Improvement Tasks

## 🐛 Bugs & Correctness — ✅ All Complete

- [x] Fix double autostart plugin initialization
- [x] Replace panicking `.unwrap()` on `emit()`
- [x] Fix array index used as React `key`
- [x] Fix typo: `mode-toogle.tsx` → `mode-toggle.tsx`
- [x] Fix typo: "Reseted" → "Reset"
- [x] Fix typo: "Autstart" → "Autostart"

## ⚡ Performance — 2/5 Complete

- [x] O(n) dedup → O(1) Set + backend hash dedup
- [ ] No history size cap
- [ ] No list virtualization
- [ ] Search input has no debounce
- [x] Redundant `updateActiveClipboardItem()` calls consolidated

## 🧹 Code Cleanup — ✅ All Complete

- [x] Remove template `greet` command
- [x] Update `index.html` title
- [x] Update `README.md`
- [x] Split `read_clipboard` dual-purpose function

## 🏗️ Architecture — ✅ All Complete

- [x] Move dedup to Rust backend (SHA-256 hash)
- [x] Use content hashing for identity
- [x] Richer data model (`ClipboardEntry` with id, content, contentType, timestamp, pinned)

## ✨ Features — 3/5 Complete

- [ ] Implement pin functionality
- [ ] Keyboard navigation
- [x] Image/rich content support (backend PNG encoding, frontend 16:9 cards, copy-back via Rust command)
- [x] Autostart enabled by default on first launch (flag file in app data dir)
- [ ] Tray icon integration

## 🔒 Robustness — 2/3 Complete

- [ ] Add error boundaries
- [x] Handle non-text clipboard gracefully
- [x] Graceful clipboard listener recovery

## 🎨 UI Fixes — ✅ All Complete

- [x] Sidebar footer collapses properly (autostart toggle adapts to collapsed/expanded)
- [x] Active clipboard item shows both text and images
- [x] Page overflow fixed (html/body/SidebarInset locked to viewport)
- [x] Active item always reflects latest clipboard content (setActiveClipboardItem before dedup guard)
