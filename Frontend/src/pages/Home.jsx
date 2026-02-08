import React, { useState } from "react"

import { Menu, X, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RightSiderbar, ChattContainer, Sidebar } from "../components"

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between p-2 border-b md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
        <h1 className="font-bold text-lg">Chat App</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsRightOpen(!isRightOpen)}
        >
          {isRightOpen ? <X /> : <UserRound />}
        </Button>
      </div>

      <div className="flex flex-1 h-full relative">
        {/* Sidebar (Left) */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* ChatContainer (Center) */}
        <div className="flex-1 h-full min-h-0 overflow-hidden">
          <ChattContainer />
        </div>

        {/* RightSidebar (Right) */}
        <RightSiderbar isOpen={isRightOpen} onClose={() => setIsRightOpen(false)} />
      </div>
    </div>
  )
}

export default Home
