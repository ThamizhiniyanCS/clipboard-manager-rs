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

export default function HistoryScrollArea() {
  const {
    visibleHistory,
    setHistory,
    headerHeight,
    activeClipboardItemHeight,
    filterQuery,
    updateActiveClipboardItem,
    copyItemToClipboard,
    deleteClipboardItem
  } = useHistoryContext()

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


  return (
    <ScrollArea className="w-full" style={{
      maxHeight: `calc(100vh - ${headerHeight + activeClipboardItemHeight + 70}px)`
    }}>
      <div className="flex flex-col gap-2">
        {
          visibleHistory.length > 0 ? visibleHistory.map((each, index) => (
            <Card key={index} className="w-full py-0 gap-0">
              <CardContent className="flex gap-2 px-0 pr-4 py-2">
                <Tooltip>
                  <TooltipTrigger className="w-full cursor-pointer py-2 pl-4" onClick={() => copyItemToClipboard(each)}>
                    <p className="line-clamp-3 text-left">{each}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" className="cursor-pointer my-auto" variant="outline" onClick={() => deleteClipboardItem(each)}>
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

