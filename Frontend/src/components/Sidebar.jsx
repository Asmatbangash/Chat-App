import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

function Sidebar({ selectedUser, setSelectedUser, isOpen, onClose }) {
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();
  const { logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchSidebarUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data } = await api.get("/messages/users");
        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (error) {
        console.error("Failed to load users:", error?.response?.data || error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchSidebarUsers();
  }, []);

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
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-background border-r shadow-md
          z-50 transform transition-transform flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold hidden md:block">Chats</h2>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="p-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 px-2 min-h-0">
          {loadingUsers && (
            <p className="px-3 text-sm text-muted-foreground">Loading users...</p>
          )}

          {!loadingUsers && filteredUsers.length === 0 && (
            <p className="px-3 text-sm text-muted-foreground">No users found.</p>
          )}

          {filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(String(user._id));
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={user._id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                  isSelected ? "bg-muted" : "hover:bg-muted"
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  onClose?.();
                }}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={user.profilePic || ""} />
                    <AvatarFallback>
                      {(user.FullName || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate">{user.FullName}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>
    </>
  );
}

export default Sidebar;
