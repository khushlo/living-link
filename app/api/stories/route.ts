import { NextRequest, NextResponse } from "next/server";

// Static seed stories - real-feeling, diverse, based on co-design research themes
const SEED_STORIES = [
  {
    id: "1",
    name: "Maria",
    age: 38,
    donationYear: 2021,
    donationType: "non-directed",
    occupation: "Teacher",
    state: "TX",
    body: "I donated to a stranger at 36. My students asked me why. I told them: there are things you can do that cost you nothing permanent and mean everything to someone else. My two remaining kidneys - I mean kidney - works fine. I run half marathons now. The hardest part was the paperwork, honestly.",
    tags: ["non-directed", "recovered well", "active lifestyle"],
    helpful: 142,
    featured: true,
  },
  {
    id: "2",
    name: "James",
    age: 52,
    donationYear: 2019,
    donationType: "directed",
    occupation: "Accountant",
    state: "OH",
    body: "I gave a kidney to my wife in 2019. The transplant team was incredible. What nobody tells you is how much better *she* looks than before. I lost a kidney and gained the version of her I knew 20 years ago. My only regret is we didn't pursue it sooner. We waited 18 months out of fear.",
    tags: ["spouse", "directed", "no regrets"],
    helpful: 218,
    featured: true,
  },
  {
    id: "3",
    name: "Priya",
    age: 29,
    donationYear: 2023,
    donationType: "directed",
    occupation: "Software Engineer",
    state: "CA",
    body: "My sister had been on dialysis for 3 years. Every time I visited her, I counted the hours. I donated in 2023. The surgery was 3 hours. Recovery was 4 weeks. She's been off dialysis for 14 months. We went hiking last month. I don't know how to explain what that felt like except to say: do it.",
    tags: ["sibling", "directed", "emotional"],
    helpful: 389,
    featured: true,
  },
  {
    id: "4",
    name: "David",
    age: 44,
    donationYear: 2022,
    donationType: "paired-exchange",
    occupation: "Firefighter",
    state: "PA",
    body: "I wasn't a match for my dad, but through a paired exchange my kidney went to a stranger in Georgia and a stranger's kidney went to my dad in Pittsburgh. He called it a miracle. I call it logistics with heart. If you're not a direct match, don't give up - ask your center about the chain.",
    tags: ["paired exchange", "parent", "inspiring"],
    helpful: 276,
    featured: false,
  },
  {
    id: "5",
    name: "Carmen",
    age: 31,
    donationYear: 2024,
    donationType: "non-directed",
    occupation: "Nurse",
    state: "FL",
    body: "As a nurse I see kidney patients every day. I spent three years convincing myself I didn't qualify before I finally submitted the initial questionnaire. I was approved in 8 weeks. The evaluation process was thorough and I never felt pressured. I returned to work after 3 weeks. I'm 5'3\" and 130 lbs and I did this at 29.",
    tags: ["healthcare worker", "non-directed", "fast approval"],
    helpful: 167,
    featured: false,
  },
  {
    id: "6",
    name: "Marcus",
    age: 58,
    donationYear: 2020,
    donationType: "directed",
    occupation: "Retired",
    state: "GA",
    body: "I was 56 when I donated to my college roommate. Everyone said I was too old. My transplant team said my kidneys were in excellent shape. Age is just a number if your health is right. The surgery was laparoscopic and I was home in two days. My friend is now 3 years post-transplant and coaching his son's little league team.",
    tags: ["older donor", "friendship", "laparoscopic"],
    helpful: 201,
    featured: false,
  },
  {
    id: "7",
    name: "Aisha",
    age: 27,
    donationYear: 2023,
    donationType: "non-directed",
    occupation: "Graduate Student",
    state: "NY",
    body: "I was terrified about losing income as a PhD student. Then I found out about NLDAC - the government reimbursement program. My lost wages, travel, and lodging were all covered. Nobody told me about this during the initial evaluation. I had to find it myself. Now I tell every potential donor: look up NLDAC before you say you can't afford it.",
    tags: ["financial concerns", "NLDAC", "student"],
    helpful: 334,
    featured: true,
  },
  {
    id: "8",
    name: "Robert",
    age: 65,
    donationYear: 2018,
    donationType: "directed",
    occupation: "Pastor",
    state: "NC",
    body: "My daughter needed a kidney. There was no question in my mind. I was 62, blood pressure a little high but controlled. The doctors worked with me to optimize it before surgery. I turned 65 last year and my nephrologist says my remaining kidney function is normal. Faith brought me here and medicine kept me healthy.",
    tags: ["parent", "older donor", "managed hypertension"],
    helpful: 189,
    featured: false,
  },
];

export type Story = typeof SEED_STORIES[0];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const donationType = searchParams.get("type");
  const featured = searchParams.get("featured");

  let stories = [...SEED_STORIES];

  if (featured === "true") {
    stories = stories.filter((s) => s.featured);
  }

  if (donationType && donationType !== "all") {
    stories = stories.filter((s) => s.donationType === donationType);
  }

  if (tag) {
    stories = stories.filter((s) =>
      s.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  // Sort by helpful count
  stories.sort((a, b) => b.helpful - a.helpful);

  return NextResponse.json({ stories, total: stories.length });
}
