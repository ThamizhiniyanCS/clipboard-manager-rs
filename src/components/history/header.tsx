import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { ListRestartIcon, SearchIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Input
} from "@/components/ui/input"
import { useHistoryContext } from "./context-provider";
import { useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function Header() {
  const {
    filterQuery,
    setFilterQuery,
    headerRef: ref,
    setHeaderHeight,
    resetClipboardHistory
  } = useHistoryContext()

  useEffect(() => {
    if (!ref.current) return

    const headerResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.contentRect.height)
      }
    })

    headerResizeObserver.observe(ref.current)

    return () => {
      headerResizeObserver.disconnect()
    }
  }, [])


  return (
    <div className="flex gap-2 items-center" ref={ref}>
      <SidebarTrigger />

      <Card className="w-full py-0 rounded-md">
        <CardContent className="pr-0 px-0 flex">
          <Button
            tabIndex={-1} // prevent the button from being selected via the Tab key
            size="icon"
            className="pointer-events-none"
            variant="ghost"
          >
            <SearchIcon />
          </Button>

          <Input className={cn(
            "dark:bg-transparent border-none px-0",
            "focus-visible:border-none focus-visible:ring-0",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          )}
            placeholder="Enter some string to search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" className="cursor-pointer" variant="outline" onClick={() => resetClipboardHistory()}>
            <ListRestartIcon />
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          Click to Reset the History
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

