import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event"
import "./App.css";
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2Icon, ListRestartIcon, PinIcon, SearchIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Input
} from "@/components/ui/input"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactLenis } from 'lenis/react'
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

function App() {
  const [activeClipboardItem, setActiveClipboardItem] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])
  const headerRef = useRef<HTMLDivElement | null>(null)
  const activeClipboardItemRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const [activeClipboardItemHeight, setActiveClipboardItemHeight] = useState<number>(0)

  async function updateActiveClipboardItem() {
    setActiveClipboardItem(await readText())
  }

  useEffect(() => {
    if (!headerRef.current) return

    const headerResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.contentRect.height)
      }
    })

    headerResizeObserver.observe(headerRef.current)

    return () => {
      headerResizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!activeClipboardItemRef.current) return

    const activeClipboardItemResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setActiveClipboardItemHeight(entry.contentRect.height)
      }
    })

    activeClipboardItemResizeObserver.observe(activeClipboardItemRef.current)

    return () => {
      activeClipboardItemResizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    updateActiveClipboardItem()

    const unlistenPromise = listen<string>('clipboard-new', (event) => {
      setHistory((prevState) => {
        if (prevState.includes(event.payload)) return prevState

        return [event.payload, ...prevState]
      })

      updateActiveClipboardItem()
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [])

  const resetHistory = () => {
    setHistory([])
    toast.success("Reseted History Successfully")
  }

  async function copyToClipboard(text: string) {
    await writeText(text)
      .then(() => toast.success("Copied Successfully"))
      .catch(() => toast.error("Failed to copy"))
  }

  function handleDeleteClipboardItem(text: string) {
    setHistory((prevState) => prevState.filter(t => t !== text))
    toast.success("Deleted Successfully")
  }

  return (
    <ThemeProvider storageKey="clipboard-manager-ui-theme">
      <ReactLenis root options={{
        allowNestedScroll: true
      }} />
      <main className="w-full h-screen p-4 flex flex-col gap-6 overflow-y-hidden">
        <Toaster />
        <div className="flex gap-2 items-center" ref={headerRef}>
          <Card className="w-full py-2">
            <CardContent className="px-2 flex">
              <Button size="icon" className="" variant="ghost" >
                <SearchIcon />
              </Button>

              <Input className="focus-visible:ring-0 border-none" placeholder="Enter some string to search" />
            </CardContent>
          </Card>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="size-13 cursor-pointer" variant="outline" onClick={resetHistory}>
                <ListRestartIcon />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              Click to Reset the History
            </TooltipContent>
          </Tooltip>
        </div>

        <Card className="w-full gap-0 py-0" ref={activeClipboardItemRef}>
          <CardContent className="flex gap-2 pl-0 pr-4 py-2">
            <Tooltip>
              <TooltipTrigger className="w-full py-2 pl-4">
                <p className="w-full line-clamp-3 text-left">{activeClipboardItem ? activeClipboardItem : "Clipboard is Emtpy"}</p>
              </TooltipTrigger>

              <TooltipContent>
                Active Item in Clipboard
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="cursor-pointer my-auto" variant="ghost">
                  <PinIcon />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Pinned on top by default</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <ScrollArea className="w-full" style={{
          maxHeight: `calc(100vh - ${headerHeight + activeClipboardItemHeight + 80}px)`
        }}>
          <div className="flex flex-col gap-2">
            {
              history.length > 0 ? history.map((each, index) => (
                <Card key={index} className="w-full py-0 gap-0">
                  <CardContent className="flex gap-2 px-0 pr-4 py-2">
                    <Tooltip>
                      <TooltipTrigger className="w-full cursor-pointer py-2 pl-4" onClick={() => copyToClipboard(each)}>
                        <p className="line-clamp-3 text-left">{each}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" className="cursor-pointer my-auto" variant="outline" onClick={() => handleDeleteClipboardItem(each)}>
                          <Trash2Icon />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>Click to delete this entry from the clipboard history</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              )) : (
                <Card className="">
                  <CardContent className="flex flex-col items-center gap-5">

                    <h2 className="text-xl font-bold">No Clipboard History Available</h2>
                    <p>Copy some content to generate history...</p>
                  </CardContent>
                </Card>
              )
            }
          </div>
        </ScrollArea>


      </main>
    </ThemeProvider>
  );
}

export default App;
