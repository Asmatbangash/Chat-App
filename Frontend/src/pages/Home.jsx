import { useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RightSiderbar, Sidebar, Chat } from "@/components";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>

        <h1 className="font-bold text-lg">Chat App</h1>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsRightOpen((prev) => !prev)}
        >
          {isRightOpen ? <X /> : <UserRound />}
        </Button>
      </div>

      <div className="relative flex h-full min-h-0 flex-1">
        <Sidebar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="min-h-0 h-full flex-1 overflow-hidden">
          <Chat selectedUser={selectedUser} />
        </div>

        <RightSiderbar
          isOpen={isRightOpen}
          onClose={() => setIsRightOpen(false)}
          selectedUser={selectedUser}
        />
      </div>
    </div>
  );
}

export default Home;
