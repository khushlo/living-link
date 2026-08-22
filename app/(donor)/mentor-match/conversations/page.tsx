import { BackToModule } from "@/components/shared/back-to-module";
import { MentorConversations } from "@/components/shared/mentor-conversations";

export const metadata = { title: "My Mentor Conversations" };

export default function ConversationsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <BackToModule href="/mentor-match" label="Back to Mentor Match" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My conversations</h1>
        <p className="mt-1 text-gray-600">Continue your conversations with your mentor matches.</p>
      </div>
      <MentorConversations />
    </div>
  );
}
