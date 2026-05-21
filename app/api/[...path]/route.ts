import { NextResponse } from "next/server";

// All API routes are now native Next.js handlers.
// This catch-all returns 404 for any unmatched /api/* paths.
export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function PATCH() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

