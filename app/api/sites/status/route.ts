import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { sites } from "@/lib/config";

export async function GET() {
  try {
    await requireSession();
    const results = await Promise.all(sites().map(async (site) => {
      const started = Date.now();
      try {
        const response = await fetch(site.url, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(10_000) });
        return { ...site, ok: response.ok, status: response.status, ms: Date.now() - started };
      } catch (error) {
        return { ...site, ok: false, status: 0, ms: Date.now() - started, error: error instanceof Error ? error.message : "Failed" };
      }
    }));
    return NextResponse.json({ sites: results, checkedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
