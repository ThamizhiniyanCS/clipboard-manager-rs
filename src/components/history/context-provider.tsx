import { createContext, useState, useRef, useContext, useMemo } from "react";
import type { Dispatch, SetStateAction, RefObject, ReactNode } from "react"
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { invoke } from '@tauri-apps/api/core';
import { toast } from "sonner";

export interface ClipboardEntry {
  id: string
  content: string
  contentType: "text" | "image"
  timestamp: number
  pinned: boolean
}

interface HistoryContextType {
  // Memos
  visibleHistory: ClipboardEntry[]

  // States
  history: ClipboardEntry[]
  setHistory: Dispatch<SetStateAction<ClipboardEntry[]>>
  activeClipboardItem: ClipboardEntry | undefined
  setActiveClipboardItem: Dispatch<SetStateAction<ClipboardEntry | undefined>>
  headerHeight: number
  setHeaderHeight: Dispatch<SetStateAction<number>>
  activeClipboardItemHeight: number
  setActiveClipboardItemHeight: Dispatch<SetStateAction<number>>
  filterQuery: string,
  setFilterQuery: Dispatch<SetStateAction<string>>

  // Refs
  headerRef: RefObject<HTMLDivElement | null>
  activeClipboardItemRef: RefObject<HTMLDivElement | null>

  // functions
  addClipboardEntry: (entry: ClipboardEntry) => void
  copyItemToClipboard: (entry: ClipboardEntry) => Promise<void>
  updateActiveClipboardItem: () => Promise<void>
  resetClipboardHistory: () => void
  deleteClipboardItem: (id: string) => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export const HistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<ClipboardEntry[]>([])
  const [activeClipboardItem, setActiveClipboardItem] = useState<ClipboardEntry | undefined>(undefined)
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const [activeClipboardItemHeight, setActiveClipboardItemHeight] = useState<number>(0)
  const [filterQuery, setFilterQuery] = useState<string>('')

  const headerRef = useRef<HTMLDivElement | null>(null)
  const activeClipboardItemRef = useRef<HTMLDivElement | null>(null)
  const historyIdsRef = useRef<Set<string>>(new Set())

  function addClipboardEntry(entry: ClipboardEntry): void {
    setActiveClipboardItem(entry)

    if (historyIdsRef.current.has(entry.id)) return

    historyIdsRef.current.add(entry.id)
    setHistory((prevState) => [entry, ...prevState])
  }

  async function copyItemToClipboard(entry: ClipboardEntry): Promise<void> {
    try {
      if (entry.contentType === "image") {
        const base64Png = entry.content.split(',')[1]
        await invoke('copy_image_to_clipboard', { base64Png })
      } else {
        await writeText(entry.content)
      }
      toast.success("Copied Successfully")
    } catch {
      toast.error("Failed to copy")
    }
  }

  async function updateActiveClipboardItem(): Promise<void> {
    try {
      const text = await readText()
      if (text) {
        setActiveClipboardItem({
          id: '',
          content: text,
          contentType: 'text',
          timestamp: Date.now(),
          pinned: false,
        })
        return
      }
    } catch {
      // not text, might be image — keep current active item
    }
  }

  function resetClipboardHistory(): void {
    historyIdsRef.current.clear()
    setHistory([])
    toast.success("Reset History Successfully")
  }

  function deleteClipboardItem(id: string): void {
    historyIdsRef.current.delete(id)
    setHistory((prevState) => prevState.filter(e => e.id !== id))
    toast.success("Deleted Successfully")
  }

  const visibleHistory = useMemo(() => {
    if (!filterQuery.trim()) return history

    const query = filterQuery.toLowerCase()
    return history.filter(each => {
      if (each.contentType === "image") return "image".includes(query)
      return each.content.toLowerCase().includes(query)
    })
  }, [history, filterQuery])

  return (
    <HistoryContext.Provider value={{
      // Memos
      visibleHistory,

      // States
      history,
      setHistory,
      activeClipboardItem,
      setActiveClipboardItem,
      headerHeight,
      setHeaderHeight,
      activeClipboardItemHeight,
      setActiveClipboardItemHeight,
      filterQuery,
      setFilterQuery,

      // Refs
      headerRef,
      activeClipboardItemRef,

      // functions
      addClipboardEntry,
      copyItemToClipboard,
      updateActiveClipboardItem,
      resetClipboardHistory,
      deleteClipboardItem
    }}>
      {children}
    </HistoryContext.Provider>
  )
}

export const useHistoryContext = (): HistoryContextType => {
  const context = useContext(HistoryContext)

  if (context === undefined) {
    throw new Error('useHistoryContext must be used with HistoryContextProvider')
  }

  return context
}
