import { useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RightSiderbar, Sidebar, Chat } from "@/components";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm md:hidden shadow-sm">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="shadow-sm"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="font-bold text-lg">Chat</h1>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsRightOpen((prev) => !prev)}
          className="shadow-sm"
        >
          {isRightOpen ? <X className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
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
