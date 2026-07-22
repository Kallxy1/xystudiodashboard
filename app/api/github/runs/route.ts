import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { githubRepos } from "@/lib/config";
import { githubFetch } from "@/lib/github";

export async function GET() {
  try {
    await requireSession();
    const repos = await Promise.all(githubRepos().map(async (repo) => {
      try {
        const response = await githubFetch(`/repos/${repo.owner}/${repo.repo}/actions/runs?per_page=5`);
        const data = await response.json();
        return { ...repo, ok: response.ok, runs: (data.workflow_runs || []).map((run: { id: number; name: string; status: string; conclusion: string | null; html_url: string; created_at: string; updated_at: string }) => ({ id: run.id, name: run.name, status: run.status, conclusion: run.conclusion, url: run.html_url, createdAt: run.created_at, updatedAt: run.updated_at })) };
      } catch (error) {
        return { ...repo, ok: false, error: error instanceof Error ? error.message : "GitHub failed", runs: [] };
      }
    }));
    return NextResponse.json({ repos });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
