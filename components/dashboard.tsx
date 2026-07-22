"use client";

import { useEffect, useState } from "react";
import { Activity, DollarSign, ExternalLink, Globe2, LogOut, RefreshCw, Server, ShieldCheck, Workflow } from "lucide-react";
import { KeyIssuer } from "@/components/key-issuer";

type Site = { name: string; url: string; ok: boolean; status: number; ms: number; error?: string };
type RepoRuns = { label: string; owner: string; repo: string; ok: boolean; error?: string; runs: { id: number; name: string; status: string; conclusion: string | null; url: string; createdAt: string }[] };

type Brand = { title: string; subtitle: string; logoUrl: string; accent: string };
type Props = { email: string; brand: Brand };

export function Dashboard({ email, brand }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [repos, setRepos] = useState<RepoRuns[]>([]);
  const [ads, setAds] = useState<{ provider: string; today?: number | null; month?: number | null; currency?: string; note?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [siteRes, runRes, adsRes] = await Promise.all([fetch("/api/sites/status", { cache: "no-store" }), fetch("/api/github/runs", { cache: "no-store" }), fetch("/api/ads/summary", { cache: "no-store" })]);
      if (siteRes.ok) setSites((await siteRes.json()).sites || []);
      if (runRes.ok) setRepos((await runRes.json()).repos || []);
      if (adsRes.ok) setAds(await adsRes.json());
      setUpdated(new Date().toLocaleTimeString("id-ID"));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  useEffect(() => { load(); const timer = window.setInterval(load, 30_000); return () => window.clearInterval(timer); }, []);

  const upSites = sites.filter((site) => site.ok).length;
  const latestRuns = repos.flatMap((repo) => repo.runs.map((run) => ({ ...run, repo: repo.label }))).slice(0, 8);

  return <main className="container" style={{ padding: "28px 0 48px" }}>
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div>
        <div className="badge"><ShieldCheck size={14} /> Admin authenticated</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          {brand.logoUrl && <img src={brand.logoUrl} alt={brand.title} style={{ width: 52, height: 52, borderRadius: 16, objectFit: "cover", border: `1px solid ${brand.accent}55` }} />}
          <div><h1 style={{ fontSize: 42, lineHeight: 1, letterSpacing: "-.05em", margin: "0 0 8px", fontWeight: 950 }}>{brand.title}</h1><p className="muted" style={{ margin: 0 }}>Logged in as {email}. {brand.subtitle}</p></div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn secondary" onClick={load} disabled={loading}><RefreshCw size={16} />{loading ? "Refreshing" : "Refresh"}</button>
        <button className="btn secondary" onClick={logout}><LogOut size={16} />Logout</button>
      </div>
    </nav>

    <section className="grid grid-3">
      <div className="card" style={{ padding: 20 }}><div className="badge"><Globe2 size={14} /> Sites</div><div style={{ fontSize: 36, fontWeight: 950, marginTop: 12 }}>{upSites}/{sites.length || 0}</div><p className="muted">online checks</p></div>
      <div className="card" style={{ padding: 20 }}><div className="badge"><Workflow size={14} /> Actions</div><div style={{ fontSize: 36, fontWeight: 950, marginTop: 12 }}>{latestRuns.length}</div><p className="muted">recent workflow runs</p></div>
      <div className="card" style={{ padding: 20 }}><div className="badge"><DollarSign size={14} /> Ads</div><div style={{ fontSize: 30, fontWeight: 950, marginTop: 12 }}>{ads?.month == null ? "—" : `${ads.currency || "IDR"} ${ads.month}`}</div><p className="muted">monthly estimate</p></div>
    </section>

    <KeyIssuer />

    <section className="grid grid-2" style={{ marginTop: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}><Activity size={20} /> Sites Monitoring</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {sites.map((site) => <a key={site.url} href={site.url} target="_blank" className="card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "none" }}>
            <div><b>{site.name}</b><div className="muted" style={{ fontSize: 12 }}>{site.url}</div></div>
            <div style={{ textAlign: "right" }}><div className={site.ok ? "ok" : "bad"}>{site.ok ? "ONLINE" : "DOWN"}</div><div className="muted" style={{ fontSize: 12 }}>{site.status || "ERR"} · {site.ms}ms</div></div>
          </a>)}
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}><Server size={20} /> Server Actions</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {latestRuns.map((run) => <a key={`${run.repo}-${run.id}`} href={run.url} target="_blank" className="card" style={{ padding: 14, boxShadow: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b>{run.repo} · {run.name}</b><ExternalLink size={15} /></div>
            <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>#{run.id} · {run.status} {run.conclusion ? `· ${run.conclusion}` : ""}</div>
          </a>)}
          {!latestRuns.length && <p className="muted">No workflow runs loaded yet. Check GITHUB_TOKEN env.</p>}
        </div>
      </div>
    </section>

    <section className="card" style={{ padding: 20, marginTop: 16 }}>
      <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}><DollarSign size={20} /> Ads Revenue Monitoring</h2>
      <p className="muted">{ads?.note || "Set ADMIN_ADS_MANUAL_JSON for manual estimate, or later connect AdSense Management API OAuth."}</p>
      <div className="grid grid-2">
        <div className="card" style={{ padding: 16, boxShadow: "none" }}><b>Today</b><div style={{ fontSize: 26, fontWeight: 950 }}>{ads?.today == null ? "—" : `${ads.currency || "IDR"} ${ads.today}`}</div></div>
        <div className="card" style={{ padding: 16, boxShadow: "none" }}><b>This month</b><div style={{ fontSize: 26, fontWeight: 950 }}>{ads?.month == null ? "—" : `${ads.currency || "IDR"} ${ads.month}`}</div></div>
      </div>
    </section>

    <p className="muted" style={{ textAlign: "center", fontSize: 12, marginTop: 22 }}>Last update: {updated || "loading..."} · Auto refresh 30s</p>
  </main>;
}
