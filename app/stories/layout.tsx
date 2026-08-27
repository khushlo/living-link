import type { Metadata } from "next";

export const metadata: Metadata = { title: "Donor stories", description: "Read consented, anonymized living donor stories." };

export default function StoriesLayout({ children }: { children: React.ReactNode }) { return children; }
