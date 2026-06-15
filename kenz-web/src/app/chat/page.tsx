import ChatApp from "@/components/ChatApp";
import ChatNav from "@/components/ChatNav";
import RequireAuth from "@/components/RequireAuth";

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatNav />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-orange px-6 py-10">
        <ChatApp />
      </main>
    </RequireAuth>
  );
}
