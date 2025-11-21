import "./App.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ReactLenis } from 'lenis/react'
import { Toaster } from "@/components/ui/sonner"
import History from "@/components/history"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useEffect } from "react";
import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        await getCurrentWindow().hide();
      }
    };

    const handleBlur = async () => {
      await getCurrentWindow().hide();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <ThemeProvider storageKey="clipboard-manager-ui-theme">
      <ReactLenis root options={{
        allowNestedScroll: true
      }} />
      <Toaster />
      <SidebarProvider style={{
        "--sidebar-width-icon": "2rem"
      } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset className="p-4 overflow-y-hidden">
          <History />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider >
  );
}

export default App;
