"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight, ThumbsUp, Filter, Search, MapPin, Briefcase, Calendar } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { PublicPageShell } from "@/components/shared/public-page-shell";

type Story = {
  id: string;
  name: string;
  age: number;
  donationYear: number;
  donationType: string;
  occupation: string;
  state: string;
  body: string;
  tags: string[];
  helpful: number;
  featured: boolean;
};

const DONATION_TYPE_LABELS: Record<string, string> = {
  "non-directed": "Non-directed (stranger)",
  "directed": "Directed (someone they knew)",
  "paired-exchange": "Paired exchange",
};

const DONATION_TYPE_COLORS: Record<string, string> = {
  "non-directed": "bg-purple-100 text-purple-700",
  "directed": "bg-blue-100 text-blue-700",
  "paired-exchange": "bg-green-100 text-green-700",
};

function StoryCard({ story, onHelpful }: { story: Story; onHelpful: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = story.body.length > 200;
  const displayBody = expanded || !isLong ? story.body : story.body.slice(0, 200) + "…";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{story.name}</span>
            <span className="text-sm text-gray-500">· age {story.age} at donation</span>
            {story.featured && (
              <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">
                ✦ Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DONATION_TYPE_COLORS[story.donationType] ?? "bg-gray-100 text-gray-700"}`}>
              {DONATION_TYPE_LABELS[story.donationType] ?? story.donationType}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Briefcase className="h-3 w-3" aria-hidden="true" />
              {story.occupation}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {story.state}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {story.donationYear}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <p className="text-gray-700 text-sm leading-relaxed">
        &ldquo;{displayBody}&rdquo;
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 hover:underline focus:outline-none"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5" role="list" aria-label="Story tags">
        {story.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
            role="listitem"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={() => onHelpful(story.id)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          aria-label={`Mark as helpful (${story.helpful} people found this helpful)`}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          <span>{story.helpful} found this helpful</span>
        </button>
        <Link
          href="/could-i-qualify"
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          Could I do this? →
        </Link>
      </div>
    </article>
  );
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [helpfulVoted, setHelpfulVoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stories?type=${filterType}`);
        const data = await res.json();
        setStories(data.stories ?? []);
      } catch {
        setStories([]);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    load();
  }, [filterType]);

  const filtered = stories.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.occupation.toLowerCase().includes(term) ||
      s.state.toLowerCase().includes(term) ||
      s.body.toLowerCase().includes(term) ||
      s.tags.some((t) => t.toLowerCase().includes(term))
    );
  });

  function handleHelpful(id: string) {
    if (helpfulVoted.has(id)) return;
    setHelpfulVoted((prev) => new Set(prev).add(id));
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, helpful: s.helpful + 1 } : s))
    );
  }

  const featured = filtered.filter((s) => s.featured);
  const rest = filtered.filter((s) => !s.featured);

  return (
    <PublicPageShell>
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real donors.<br />
            <span className="text-blue-600">Real stories.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These donors - teachers, engineers, nurses, retirees - were once exactly where you are.
            They had questions, fears, and doubts. Read what they want you to know.
          </p>
        </section>

        {/* Stats bar */}
        <div className="bg-gray-50 border-y border-gray-100 py-6">
          <div className="mx-auto max-w-4xl px-6">
            <dl className="flex flex-wrap justify-center gap-10">
              {[
                { value: "95%", label: "Would donate again" },
                { value: "4 weeks", label: "Average recovery time" },
                { value: "20+ years", label: "Living donor kidney lifespan" },
                { value: "$0", label: "Out-of-pocket cost for many" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <dt className="text-2xl font-bold text-blue-600">{value}</dt>
                  <dd className="text-sm text-gray-500 mt-0.5">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Filters */}
        <section className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by occupation, state, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                aria-label="Search stories"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-blue-400 focus:outline-none"
                aria-label="Filter by donation type"
              >
                <option value="all">All types</option>
                <option value="non-directed">Non-directed (stranger)</option>
                <option value="directed">Directed (someone they knew)</option>
                <option value="paired-exchange">Paired exchange</option>
              </select>
            </div>
          </div>

          {!loading && (
            <p className="mt-3 text-sm text-gray-500">
              Showing {filtered.length} stor{filtered.length !== 1 ? "ies" : "y"}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          )}
        </section>

        {/* Stories */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" aria-label="Loading stories" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No stories match your search. Try different keywords.</p>
            </div>
          )}

          {/* Featured */}
          {!loading && featured.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-4">✦ Featured stories</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {featured.map((story) => (
                  <StoryCard key={story.id} story={story} onHelpful={handleHelpful} />
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          {!loading && rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">More stories</h2>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                {rest.map((story) => (
                  <StoryCard key={story.id} story={story} onHelpful={handleHelpful} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Share your story CTA */}
        <section className="bg-blue-600 py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <Heart className="h-10 w-10 fill-white text-white mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-white mb-3">Have a story to share?</h2>
            <p className="text-blue-200 mb-8">
              Your experience could be the thing that convinces someone else to say yes.
              Create a LivingLink account to share your donation story anonymously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal">
                <button className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                  Share my story
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
              <Link
                href="/could-i-qualify"
                className="flex items-center gap-2 rounded-xl border-2 border-blue-300 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                I'm thinking about donating
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/could-i-qualify" className="hover:text-blue-600">Could I qualify?</Link>
            <Link href="/ripple" className="hover:text-blue-600">Ripple Calculator</Link>
            <Link href="/waitlist-map" className="hover:text-blue-600">Waitlist Map</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 LivingLink · Stories are anonymized and shared with consent</p>
        </div>
      </footer>
    </PublicPageShell>
  );
}
