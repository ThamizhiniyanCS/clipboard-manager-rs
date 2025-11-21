import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar"
import { ClipboardIcon } from "lucide-react"
import { ModeToggle } from "./mode-toogle"

export function AppSidebar() {

  const { open } = useSidebar()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-0 py-4">
        <div className="flex gap-2 mx-auto">
          <ClipboardIcon />
          {open && <p className="italic">Clipboard Manager</p>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="px-0 py-4">
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
