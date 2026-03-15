import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { ImageIcon, PinIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useHistoryContext } from "./context-provider";
import { useEffect } from "react";

export default function ActiveClipboardItem() {
  const {
    activeClipboardItemRef: ref,
    activeClipboardItem,
    setActiveClipboardItemHeight,
    updateActiveClipboardItem
  } = useHistoryContext()

  useEffect(() => {
    updateActiveClipboardItem()

    if (!ref.current) return

    const activeClipboardItemResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setActiveClipboardItemHeight(entry.contentRect.height)
      }
    })

    activeClipboardItemResizeObserver.observe(ref.current)

    return () => {
      activeClipboardItemResizeObserver.disconnect()
    }
  }, [])

  return (
    <Card className="w-full gap-0 py-0" ref={ref}>
      <CardContent className="flex gap-2 pl-0 pr-4 py-2">
        <Tooltip>
          <TooltipTrigger className="w-full py-2 pl-4">
            {activeClipboardItem ? (
              activeClipboardItem.contentType === "image" ? (
                <div className="flex items-center gap-2">
                  <img
                    src={activeClipboardItem.content}
                    alt="Active clipboard image"
                    className="max-h-20 max-w-full object-contain rounded"
                  />
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ) : (
                <p className="w-full line-clamp-3 text-left break-all whitespace-normal">{activeClipboardItem.content}</p>
              )
            ) : (
              <p className="w-full line-clamp-3 text-left break-all whitespace-normal text-muted-foreground">Clipboard is Empty</p>
            )}
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
  )
}
