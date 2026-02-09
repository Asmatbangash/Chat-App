import React, { useState } from "react"

import { Menu, X, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RightSiderbar, ChattContainer, Sidebar } from "../components"

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState()

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
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 h-full min-h-screen overflow-hidden">
          <ChattContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
        </div>
        <RightSiderbar isOpen={isRightOpen} onClose={() => setIsRightOpen(false)} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </div>
    </div>
  )
}

export default Home
