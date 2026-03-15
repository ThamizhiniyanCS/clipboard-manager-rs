import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "../ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useSidebar } from "@/components/ui/sidebar"

export default function AutostartToggle() {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const { open } = useSidebar()

  useEffect(() => {
    isEnabled()
      .then((res) => setIsChecked(res))
      .catch((e) => console.error(e))
  }, [])

  function handleOnCheckedChange(value: boolean) {
    if (value) {
      enable()
        .then(() => {
          isEnabled()
            .then((res) => setIsChecked(res))
            .catch((e) => console.error(e))
          toast.success("Autostart is enabled successfully")
        })
        .catch((e) => console.error(e))
    } else {
      disable()
        .then(() => {
          isEnabled()
            .then((res) => setIsChecked(res))
            .catch((e) => console.error(e))
          toast.success("Autostart is disabled successfully")
        })
        .catch((e) => console.error(e))
    }
  }

  if (!open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-center">
            <Switch id="autostart-toggle" checked={isChecked} onCheckedChange={handleOnCheckedChange} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          Autostart: {isChecked ? "Enabled" : "Disabled"}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Switch id="autostart-toggle" checked={isChecked} onCheckedChange={handleOnCheckedChange} />
      <Label htmlFor="autostart-toggle" className="text-sm">Autostart</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" className="h-6 w-6 ml-auto">
            <InfoIcon className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Start automatically when the system boots</TooltipContent>
      </Tooltip>
    </div>
  )
}
