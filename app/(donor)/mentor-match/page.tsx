import { Users, MessageCircle, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mentor Match" };

export default function MentorMatchPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mentor Match</h1>
        <p className="mt-1 text-gray-600">
          Connect with a real person who has donated a kidney and understands exactly what you're going through.
        </p>
      </div>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="rounded-xl bg-purple-50 p-6">
        <h2 id="how-heading" className="text-lg font-semibold text-purple-900 mb-4">How Mentor Match works</h2>
        <ol className="space-y-3" role="list">
          {[
            "Complete your anonymous preference profile (language, concerns, donation type)",
            "Our AI matches you with a verified living donor with similar experiences",
            "Connect through secure, private messaging  on your schedule",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-purple-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold" aria-hidden="true">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Find a mentor CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 p-6">
          <Users className="h-8 w-8 text-purple-600 mb-3" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Find a mentor</h2>
          <p className="mt-1 text-sm text-gray-600 mb-4">
            Browse verified living donors in our network and request a match.
          </p>
          <Link
            href="/mentor-match/find"
            className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Find my mentor <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <MessageCircle className="h-8 w-8 text-purple-600 mb-3" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">My conversations</h2>
          <p className="mt-1 text-sm text-gray-600 mb-4">
            Continue your existing mentor conversations.
          </p>
          <Link
            href="/mentor-match/find"
            className="inline-flex items-center gap-2 rounded-md border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            Browse mentors <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Become a mentor */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 flex items-start gap-4">
        <Star className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-gray-900">Already donated? Become a mentor.</h2>
          <p className="text-sm text-gray-600 mt-1">
            Your experience is invaluable. Verified living donors can apply to become a mentor and help others on the same journey.
          </p>
          <Link href="/mentor-match/become-mentor" className="mt-3 inline-block text-sm font-medium text-hope-600 hover:underline">
            Apply to be a mentor →
          </Link>
        </div>
      </div>
    </div>
  );
}
