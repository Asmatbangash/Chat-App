import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assets } from "../assets/assets";

const messages = [
  { id: 1, text: "Hello! 👋", sender: "other" },
  { id: 2, text: "Hi, how are you?", sender: "me" },
  { id: 3, text: "I’m good! Working on the chat app 😄", sender: "other" },
];

function ChattContainer({selectedUser, setSelectedUser}) {
  console.log(selectedUser)
  const bottomRef = useRef(null);

  // Auto-scroll to last message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return selectedUser ? (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <Avatar>
          <AvatarImage src="" />
          <AvatarFallback>
            {selectedUser.name
              .split(" ")
              .map(word => word[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold text-sm sm:text-base">{selectedUser.name}</p>
          {selectedUser.online === true ?<p className="text-xs sm:text-sm text-green-500">online</p> : <p className="text-xs sm:text-sm text-gray-500">offline</p>}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`px-3 py-2 rounded-lg text-sm wrap-break-words
                ${
                  msg.sender === "me"
                    ? "self-end bg-primary text-primary-foreground max-w-[80%] sm:max-w-[60%]"
                    : "self-start bg-muted max-w-[80%] sm:max-w-[60%]"
                }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 bg-background p-4 border-t flex items-center gap-2">
        <Input placeholder="Type a message..." />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ) :(
    <div className="flex justify-center items-center h-screen">
      <img className="w-15 h-15 max-sm:w-10 max-sm:h-10" src={assets.logo} alt="logo"  />
      <p className="font-bold text-2xl max-sm:text-sm">Chat anytime, anywhare!</p>
    </div>
  )
}

export default ChattContainer;
