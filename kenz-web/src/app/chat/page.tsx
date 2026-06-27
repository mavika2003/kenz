import { redirect } from "next/navigation";

// Chat is now embedded in the planner workspace.
export default function ChatPage() {
  redirect("/planner");
}
