import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

const allowedPlans = new Set(["1day", "3days", "7days"]);

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = await request.json().catch(() => ({}));
    const plan = String(body.plan || "1day");
    if (!allowedPlans.has(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const baseUrl = process.env.BUILDBOX_BASE_URL || "https://build.xystudio.my.id";
    const secret = process.env.BUILDBOX_REWARD_CLAIM_SECRET || process.env.REWARD_CLAIM_SECRET;
    if (!secret) return NextResponse.json({ error: "BUILDBOX_REWARD_CLAIM_SECRET is not configured" }, { status: 500 });

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/access-key/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-reward-secret": secret
      },
      body: JSON.stringify({ plan }),
      cache: "no-store"
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error || "BuildBox claim failed" }, { status: response.status });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not issue key" }, { status: 500 });
  }
}
