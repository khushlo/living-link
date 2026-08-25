import { NextRequest, NextResponse } from "next/server";

export type Story = {
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

// Temporary demonstration records only. Replace with consented, reviewed content
// before any pilot or public release.
const PUBLISHED_STORIES: Story[] = [
  {
    id: "test-1",
    name: "Test1",
    age: 35,
    donationYear: 2024,
    donationType: "directed",
    occupation: "Demo participant",
    state: "NA",
    body: "This is a demonstration story for testing the LivingLink stories page. It is not a real donor account or lived-experience statement.",
    tags: ["test", "demo"],
    helpful: 0,
    featured: true,
  },
  {
    id: "test-2",
    name: "Test2",
    age: 42,
    donationYear: 2023,
    donationType: "non-directed",
    occupation: "Demo participant",
    state: "NA",
    body: "This is a second demonstration story for testing filtering, cards, and responsive layout. It is not a real donor account or lived-experience statement.",
    tags: ["test", "demo"],
    helpful: 0,
    featured: false,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag")?.toLowerCase();
  const donationType = searchParams.get("type");
  const featured = searchParams.get("featured");

  let stories = [...PUBLISHED_STORIES];
  if (featured === "true") stories = stories.filter((story) => story.featured);
  if (donationType && donationType !== "all") stories = stories.filter((story) => story.donationType === donationType);
  if (tag) stories = stories.filter((story) => story.tags.some((value) => value.toLowerCase().includes(tag)));
  stories.sort((a, b) => b.helpful - a.helpful);

  return NextResponse.json({ stories, total: stories.length });
}
