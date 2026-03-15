import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2Icon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card"

import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"
import { useHistoryContext } from "./context-provider"
import type { ClipboardEntry } from "./context-provider"

export default function HistoryScrollArea() {
  const {
    visibleHistory,
    headerHeight,
    activeClipboardItemHeight,
    filterQuery,
    addClipboardEntry,
    updateActiveClipboardItem,
    copyItemToClipboard,
    deleteClipboardItem
  } = useHistoryContext()

  useEffect(() => {
    updateActiveClipboardItem()

    const unlistenPromise = listen<ClipboardEntry>('clipboard-new', (event) => {
      addClipboardEntry(event.payload)
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [])


  return (
    <ScrollArea className="w-full" style={{
      maxHeight: `calc(100vh - ${headerHeight + activeClipboardItemHeight + 70}px)`
    }}>
      <div className="w-full flex flex-col gap-2">
        {
          visibleHistory.length > 0 ? visibleHistory.map((entry) => (
            <Card key={entry.id} className="w-full py-0 gap-0">
              <CardContent className="flex gap-2 px-0 pr-4 py-2">
                {entry.contentType === "image" ? (
                  <Tooltip>
                    <TooltipTrigger className="w-full cursor-pointer py-2 pl-4" onClick={() => copyItemToClipboard(entry)}>
                      <div className="aspect-video w-full overflow-hidden rounded">
                        <img
                          src={entry.content}
                          alt="Clipboard image"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger className="w-full cursor-pointer py-2 pl-4" onClick={() => copyItemToClipboard(entry)}>
                      <p className="line-clamp-3 text-left break-all whitespace-normal">{entry.content}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" className="cursor-pointer my-auto" variant="outline" onClick={() => deleteClipboardItem(entry.id)}>
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
                <h2 className="text-xl font-bold">{filterQuery ? "No matches found" : "No Clipboard History Available"}</h2>
                <p>{filterQuery ? "Search something relevant" : "Copy some content to generate history..."}</p>
              </CardContent>
            </Card>
          )
        }
      </div>
    </ScrollArea>

  )
}
