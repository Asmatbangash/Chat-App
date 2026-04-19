import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Check, CheckCheck, Send, Pencil, Trash2, X, Ban } from "lucide-react";
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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const bottomRef = useRef(null);
  const editInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea: grow with content, cap at ~5 lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [messageText]);

  const isSelectedUserOnline = useMemo(
    () => onlineUsers.includes(String(selectedUser?._id)),
    [onlineUsers, selectedUser?._id],
  );



  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id || !user?._id) {
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
  }, [selectedUser?._id, user?._id]);

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

    // Real-time edit reflected on receiver's screen.
    const handleMessageEdited = ({ _id, text, isEdited }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(_id) ? { ...msg, text, isEdited } : msg,
        ),
      );
    };

    // Real-time delete reflected on receiver's screen.
    const handleMessageDeleted = ({ _id }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(_id)
            ? { ...msg, text: "", image: "", isDeleted: true, isEdited: false }
            : msg
        )
      );
    };

    socket.on("newMessage", handleIncomingMessage);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, selectedUser?._id, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus the edit input whenever edit mode activates.
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

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
      // Collapse textarea back to single line after sending.
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error?.response?.data || error);
    } finally {
      setSending(false);
    }
  };

  const handleTextareaKeyDown = (e) => {
    // Enter alone = send; Shift+Enter = new line.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const startEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSaveEdit = async (msgId) => {
    const trimmed = editText.trim();
    if (!trimmed || savingEdit) return;

    setSavingEdit(true);
    try {
      const { data } = await api.put(`/messages/edit/${msgId}`, { text: trimmed });
      if (data?.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg._id) === String(msgId) ? data.message : msg,
          ),
        );
      }
      cancelEdit();
    } catch (error) {
      console.error("Failed to edit message:", error?.response?.data || error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    setDeletingId(msgId);
    try {
      await api.delete(`/messages/delete/${msgId}`);
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(msgId)
            ? { ...msg, text: "", image: "", isDeleted: true, isEdited: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to delete message:", error?.response?.data || error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/10 p-8">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center shadow-lg">
            <img
              className="w-20 h-20 object-contain"
              src={assets.logo}
              alt="logo"
            />
          </div>
          <div className="space-y-2">
            <h2 className="font-bold text-3xl max-sm:text-xl text-foreground">Welcome to Chat</h2>
            <p className="text-muted-foreground text-base max-sm:text-sm">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Chat anytime, anywhere!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-card/50 backdrop-blur-sm shrink-0 shadow-sm">
        <Avatar className="ring-2 ring-border/50">
          <AvatarImage src={selectedUser.profilePic || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {(selectedUser.FullName || "U")
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base sm:text-lg truncate">{selectedUser.FullName}</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSelectedUserOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <p className={`text-xs sm:text-sm font-medium ${isSelectedUserOnline ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {isSelectedUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="min-h-0 flex-1 px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-3">
          {loadingMessages && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm font-medium">Loading messages...</span>
              </div>
            </div>
          )}

          {!loadingMessages && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground font-medium">No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = String(msg.senderId) === String(user?._id);
            const isBeingEdited = editingMessageId === msg._id;
            const isBeingDeleted = deletingId === msg._id;

            return (
              <div
                key={msg._id || `${msg.senderId}-${msg.createdAt}`}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
              >
                {/* Action icons sit to the left of the bubble for sent msgs */}
                {isMe && !isBeingEdited && !isBeingDeleted && !msg.isDeleted && (
                  <div className="flex items-center gap-1 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-1.5 shrink-0">
                    {msg.text && (
                      <button
                        onClick={() => startEdit(msg)}
                        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        title="Edit message"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Column: constrained width, bubble fills it as a block */}
                <div
                  className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-opacity ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border text-card-foreground rounded-bl-md"
                    } ${isBeingDeleted ? "opacity-40 pointer-events-none" : ""}`}
                    style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="message"
                        className="max-h-64 w-auto rounded-lg mb-2"
                      />
                    )}

                    {isBeingEdited ? (
                      <div className="flex items-center gap-2 min-w-[160px]">
                        <input
                          ref={editInputRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(msg._id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="flex-1 bg-transparent border-b border-primary-foreground/60 outline-none text-sm py-0.5 min-w-0"
                        />
                        <button
                          onClick={() => handleSaveEdit(msg._id)}
                          disabled={savingEdit || !editText.trim()}
                          className="shrink-0 opacity-80 hover:opacity-100 disabled:opacity-40 transition-opacity"
                          title="Save (Enter)"
                        >
                          {savingEdit ? (
                            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                          title="Cancel (Esc)"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : msg.isDeleted ? (
                      <div className="flex items-center gap-1.5 opacity-70 italic">
                        <Ban className="h-3.5 w-3.5" />
                        <p className="leading-relaxed whitespace-pre-wrap text-[13px]">This message was deleted</p>
                      </div>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>

                  {/* Status row: seen receipt + (edited) label */}
                  <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {msg.isEdited && (
                      <span className="text-[10px] text-muted-foreground italic">(edited)</span>
                    )}
                    {isMe && (
                      <div className="flex items-center gap-1">
                        {msg.seen ? (
                          <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {msg.seen ? 'Seen' : 'Sent'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input bar */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 border-t bg-card/50 backdrop-blur-sm p-4 sm:p-5 flex items-end gap-3 shadow-sm"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          className="flex-1 min-h-[44px] max-h-[140px] resize-none overflow-y-auto rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-muted-foreground"
        />
        <Button
          size="icon"
          type="submit"
          disabled={sending || !messageText.trim()}
          className="h-11 w-11 shadow-sm hover:shadow-md transition-all flex-shrink-0"
        >
          {sending ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

export default Chat;
