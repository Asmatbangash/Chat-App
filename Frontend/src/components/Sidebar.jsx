import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
// Hook import moved out of provider file for fast-refresh compatibility.
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

function Sidebar({ selectedUser, setSelectedUser, isOpen, onClose }) {
  const navigate = useNavigate();
  const { onlineUsers, socket } = useSocket();
  const { user: currentUser, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [unSeenMessages, setUnSeenMessages] = useState({});
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchSidebarUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data } = await api.get("/messages/users");
        setUsers(Array.isArray(data?.users) ? data.users : []);
        // Backend returns unread counts keyed by sender userId.
        setUnSeenMessages(data?.unSeenMessages || {});
      } catch (error) {
        console.error("Failed to load users:", error?.response?.data || error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchSidebarUsers();
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleIncomingMessage = (incomingMessage) => {
      const senderId = String(incomingMessage?.senderId);

      // If that chat is already open, don't increment unread counter.
      if (String(selectedUser?._id) === senderId) {
        return;
      }

      setUnSeenMessages((prev) => ({
        ...prev,
        // Increment only for chats that are not currently active.
        [senderId]: (prev[senderId] || 0) + 1,
      }));
    };

    socket.on("newMessage", handleIncomingMessage);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
    };
  }, [socket, selectedUser?._id]);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) {
      return users;
    }

    return users.filter((user) =>
      user?.FullName?.toLowerCase().includes(query),
    );
  }, [users, search]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-card border-r border-border shadow-xl
          z-50 transform transition-transform flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-80
        `}
      >
        <div className="px-4 py-5 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex items-center justify-between">
          <h2 className="text-xl font-bold hidden md:block">Messages</h2>
          <h2 className="text-lg font-bold md:hidden">Chats</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>

        <div className="p-4 bg-muted/30">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10 h-10 bg-background"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2 min-h-0">
          {loadingUsers && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}

          {!loadingUsers && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground font-medium">No users found</p>
            </div>
          )}

          <div className="space-y-1 py-2">
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers.includes(String(user._id));
              const isSelected = selectedUser?._id === user._id;
              const unreadCount = unSeenMessages[user._id] || 0;

              return (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-primary/10 border border-primary/20 shadow-sm" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setSelectedUser(user);
                    setUnSeenMessages((prev) => ({
                      ...prev,
                      [user._id]: 0,
                    }));
                    onClose?.();
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="ring-2 ring-background">
                      <AvatarImage src={user.profilePic || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(user.FullName || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card shadow-sm" />
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate text-sm">{user.FullName}</p>
                    <p className={`text-xs truncate ${isOnline ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}`}>
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t p-3 mt-auto bg-muted/30">
          <div 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/70 cursor-pointer transition-all group"
            onClick={() => {
              navigate("/profile");
              onClose?.();
            }}
          >
            <Avatar className="h-11 w-11 ring-2 ring-background">
              <AvatarImage src={currentUser?.profilePic || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {(currentUser?.FullName || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm truncate">
                {currentUser?.FullName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                View Profile
              </p>
            </div>

            <svg className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
