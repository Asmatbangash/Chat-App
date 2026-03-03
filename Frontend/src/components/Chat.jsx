import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { assets } from "@/assets/assets";

const appendUniqueMessage = (currentMessages, incomingMessage) => {
  // Prevent duplicate entries when the same message arrives via REST/socket.
  const exists = currentMessages.some((msg) => msg._id === incomingMessage._id);
  return exists ? currentMessages : [...currentMessages, incomingMessage];
};

function Chat({ selectedUser }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const isSelectedUserOnline = useMemo(
    () => onlineUsers.includes(String(selectedUser?._id)),
    [onlineUsers, selectedUser?._id],
  );

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/messages/${selectedUser._id}`);
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
      } catch (error) {
        console.error("Failed to fetch messages:", error?.response?.data || error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!socket || !selectedUser?._id || !user?._id) {
      return;
    }

    const handleIncomingMessage = async (incomingMessage) => {
      const fromSelectedUser =
        String(incomingMessage?.senderId) === String(selectedUser._id);
      const toCurrentUser = String(incomingMessage?.receiverId) === String(user._id);

      if (!fromSelectedUser || !toCurrentUser) {
        return;
      }

      setMessages((prev) => appendUniqueMessage(prev, incomingMessage));

      // Mark as seen immediately when user is already in this chat.
      try {
        await api.patch(`/messages/mark/${incomingMessage._id}`);
      } catch (error) {
        console.error("Failed to mark incoming message as seen:", error);
      }
    };

    const handleMessagesSeen = ({ messageIds = [] }) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return;
      }

      const seenSet = new Set(messageIds.map((id) => String(id)));

      // Apply read-receipt updates only to matching message ids.
      setMessages((prev) =>
        prev.map((message) =>
          seenSet.has(String(message._id))
            ? { ...message, seen: true }
            : message,
        ),
      );
    };

    socket.on("newMessage", handleIncomingMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, selectedUser?._id, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || !selectedUser?._id || !user?._id || sending) {
      return;
    }

    setSending(true);
    try {
      // Persist first; backend will emit `newMessage` to receiver on success.
      const { data } = await api.post(`/messages/send-message/${selectedUser._id}`, {
        text: trimmedMessage,
      });

      if (data?.message) {
        setMessages((prev) => appendUniqueMessage(prev, data.message));
      }

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error?.response?.data || error);
    } finally {
      setSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <img
          className="w-25 h-25 max-sm:w-15 max-sm:h-15"
          src={assets.logo}
          alt="logo"
        />
        <p className="font-bold text-2xl max-sm:text-sm">Chat anytime, anywhere!</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <Avatar>
          <AvatarImage src={selectedUser.profilePic || ""} />
          <AvatarFallback>
            {(selectedUser.FullName || "U")
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold text-sm sm:text-base">{selectedUser.FullName}</p>
          {isSelectedUserOnline ? (
            <p className="text-xs sm:text-sm text-green-500">online</p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500">offline</p>
          )}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="flex flex-col gap-2">
          {loadingMessages && (
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          )}

          {!loadingMessages && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          )}

          {messages.map((msg) => {
            const isMe = String(msg.senderId) === String(user?._id);
            return (
              <div
                key={msg._id || `${msg.senderId}-${msg.createdAt}`}
                className={`flex px-3 py-2 rounded-lg text-sm break-words ${
                  isMe
                    ? "self-end bg-primary text-primary-foreground max-w-[80%] sm:max-w-[60%]"
                    : "self-start bg-muted max-w-[80%] sm:max-w-[60%]"
                }`}
              >
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="message"
                    className="max-h-52 w-auto rounded-md mb-2"
                  />
                ) : null}
                {msg.text}

                {isMe && (
                  <span className="mt-1 flex justify-end">
                    {/* Gray single tick: sent/unseen, blue double tick: seen */}
                    {msg.seen ? (
                      <CheckCheck className="h-4 w-4 text-sky-500" />
                    ) : (
                      <Check className="h-4 w-4 text-gray-400" />
                    )}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSendMessage}
        className="shrink-0 border-t bg-background p-4 flex items-center gap-2"
      >
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
        />
        <Button size="icon" type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default Chat;
