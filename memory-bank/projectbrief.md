# Project Brief — Clipboard Manager

## Core Purpose

A desktop clipboard manager that monitors the OS clipboard in the background and provides a quick-access popup (triggered by `Win+V`) to browse, search, and re-copy clipboard history.

## Core Requirements

- Silently monitor OS clipboard for text and image content
- Store clipboard history in-memory (no persistence required)
- Provide a searchable, scrollable history UI
- Allow one-click copying of any history entry back to clipboard
- Run as a borderless, transparent utility popup
- Auto-hide on blur/Escape, toggle via `Win+V`
- Autostart on system boot by default

## Target Platform

- Windows desktop (primary)
- macOS support via Tauri cross-platform (secondary)

## Non-Goals

- No persistent storage / database
- No cloud sync
- No history export/import
