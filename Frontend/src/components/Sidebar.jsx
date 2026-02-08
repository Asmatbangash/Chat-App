import React from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

const chats = [
  { id: 1, name: "Ali Khan", lastMessage: "Hey, how are you?", avatar: "", online: true },
  { id: 2, name: "Sara Ahmed", lastMessage: "Let’s meet tomorrow", avatar: "", online: false },
  { id: 3, name: "Usman", lastMessage: "Okay 👍", avatar: "", online: true },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-background border-r shadow-md
          z-50 transform transition-transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold hidden md:block">Chats</h2>
        </div>

        {/* Search */}
        <div className="p-4">
          <Input placeholder="Search users..." />
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2 min-h-0">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition"
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>

                {chat.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{chat.name}</p>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </>
  )
}

export default Sidebar
