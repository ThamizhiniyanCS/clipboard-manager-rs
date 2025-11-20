import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { PinIcon } from "lucide-react";
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
            <p className="w-full line-clamp-3 text-left">{activeClipboardItem || "Clipboard is Empty"}</p>
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

