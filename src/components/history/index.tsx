import { HistoryContextProvider } from "./context-provider"
import Header from "./header"
import ActiveClipboardItem from "./active-clipboard-item"
import HistoryScrollArea from "./scroll-area"


export default function History() {

  return (
    <HistoryContextProvider>
      <div className="w-full flex flex-col gap-4">
        <Header />
        <ActiveClipboardItem />
        <HistoryScrollArea />
      </div>
    </HistoryContextProvider>
  )
}
