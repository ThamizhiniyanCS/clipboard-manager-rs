import { createContext, useState, useRef, useContext, useMemo } from "react";
import type { Dispatch, SetStateAction, RefObject, ReactNode } from "react"
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { toast } from "sonner";

interface HistoryContextType {
  // Memos
  visibleHistory: string[]

  // States
  history: string[]
  setHistory: Dispatch<SetStateAction<string[]>>
  activeClipboardItem: string | undefined
  setActiveClipboardItem: Dispatch<SetStateAction<string | undefined>>
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
  copyItemToClipboard: (text: string) => Promise<void>
  updateActiveClipboardItem: () => Promise<void>
  resetClipboardHistory: () => void
  deleteClipboardItem: (text: string) => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export const HistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<string[]>([])
  const [activeClipboardItem, setActiveClipboardItem] = useState<string | undefined>(undefined)
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const [activeClipboardItemHeight, setActiveClipboardItemHeight] = useState<number>(0)
  const [filterQuery, setFilterQuery] = useState<string>('')

  const headerRef = useRef<HTMLDivElement | null>(null)
  const activeClipboardItemRef = useRef<HTMLDivElement | null>(null)

  async function copyItemToClipboard(text: string): Promise<void> {
    await writeText(text)
      .then(() => toast.success("Copied Successfully"))
      .catch(() => toast.error("Failed to copy"))
  }

  async function updateActiveClipboardItem(): Promise<void> {
    setActiveClipboardItem(await readText())
  }

  function resetClipboardHistory(): void {
    setHistory([])
    toast.success("Reseted History Successfully")
  }

  function deleteClipboardItem(text: string): void {
    setHistory((prevState) => prevState.filter(t => t !== text))
    toast.success("Deleted Successfully")
  }

  const visibleHistory = useMemo(() => {
    if (!filterQuery.trim()) return history

    return history.filter(each => each.toLowerCase().includes(filterQuery.toLowerCase()))
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


