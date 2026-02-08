import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const messages = [
  { id: 1, text: "Hello! 👋", sender: "other" },
  { id: 2, text: "Hi, how are you?", sender: "me" },
  { id: 3, text: "I’m good! Working on the chat app 😄", sender: "other" },
];

function ChattContainer() {
  const bottomRef = useRef(null);

  // Auto-scroll to last message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <Avatar>
          <AvatarImage src="" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold text-sm sm:text-base">Ali Khan</p>
          <p className="text-xs sm:text-sm text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
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
          {/* Scroll target */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input — ALWAYS AT BOTTOM */}
      <div className="fixed bottom-0 bg-background p-4 border-t flex items-center gap-2">
        <Input placeholder="Type a message..." />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default ChattContainer;
