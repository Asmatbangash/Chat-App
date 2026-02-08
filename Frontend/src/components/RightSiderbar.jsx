import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function RightSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-72 bg-background border-l shadow-md z-50
          transform transition-transform
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:static lg:translate-x-0
        `}
      >
        {/* User Profile */}
        <div className="flex flex-col items-center text-center gap-2 p-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>

          <h3 className="font-semibold text-lg">Ali Khan</h3>
          <p className="text-sm text-green-500">Online</p>
        </div>

        <Separator className="my-4" />

        {/* About */}
        <div className="p-4">
          <h4 className="text-sm font-semibold mb-2">About</h4>
          <p className="text-sm text-muted-foreground">
            Building a real-time chat app using React & Socket.io 🚀
          </p>
        </div>

        <Separator className="my-4" />

        {/* Media */}
        <div className="flex-1 p-4">
          <h4 className="text-sm font-semibold mb-2">Media</h4>

          <div className="grid grid-cols-3 gap-2">
            <div className="h-20 rounded-md bg-muted" />
            <div className="h-20 rounded-md bg-muted" />
            <div className="h-20 rounded-md bg-muted" />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 mt-4 space-y-2">
          <Button variant="outline" className="w-full">
            Mute Notifications
          </Button>
          <Button variant="destructive" className="w-full">
            Block User
          </Button>
        </div>
      </div>
    </>
  )
}

export default RightSidebar
