import "./App.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ReactLenis } from 'lenis/react'
import { Toaster } from "@/components/ui/sonner"
import History from "@/components/history"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

function App() {
  return (
    <ThemeProvider storageKey="clipboard-manager-ui-theme">
      <ReactLenis root options={{
        allowNestedScroll: true
      }} />
      <Toaster />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="p-4 overflow-y-hidden">
          <History />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider >
  );
}

export default App;
