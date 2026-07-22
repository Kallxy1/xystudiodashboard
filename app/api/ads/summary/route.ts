import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession();
    const manual = process.env.ADMIN_ADS_MANUAL_JSON;
    if (manual) {
      try {
        return NextResponse.json({ provider: "manual", ...JSON.parse(manual) });
      } catch {}
    }
    return NextResponse.json({
      provider: "not_configured",
      note: "Monitoring pendapatan iklan membutuhkan integrasi AdSense Management API/OAuth atau input manual ADMIN_ADS_MANUAL_JSON.",
      today: null,
      month: null,
      currency: "IDR"
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
