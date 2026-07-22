"use client";

import { useState } from "react";
import { Copy, KeyRound, Ticket } from "lucide-react";

export function KeyIssuer() {
  const [plan, setPlan] = useState("1day");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("Ready to issue voucher claim link.");
  const [busy, setBusy] = useState(false);

  async function issue() {
    setBusy(true);
    setMessage("Creating one-time voucher link...");
    setUrl("");
    try {
      const response = await fetch("/api/buildbox/issue-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");
      setUrl(data.url);
      setMessage(`Voucher created. Expires in ${data.expiresInMinutes || 30} minutes.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to issue voucher");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard?.writeText(url);
    setMessage("Voucher URL copied.");
  }

  return <section className="card" style={{ padding: 20, marginTop: 16 }}>
    <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}><Ticket size={20} /> Access Key Voucher</h2>
    <p className="muted">Generate link voucher sekali buka dari dashboard. User buka link, copy access key, lalu link otomatis used.</p>
    <div className="grid grid-2">
      <label><span className="muted" style={{ display: "block", marginBottom: 8, fontWeight: 800 }}>Plan</span><select className="field" value={plan} onChange={(event) => setPlan(event.target.value)}><option value="1day">1 day · 2 builds</option><option value="3days">3 days · 5 builds</option><option value="7days">7 days · 10 builds</option></select></label>
      <div style={{ display: "flex", alignItems: "end" }}><button className="btn" onClick={issue} disabled={busy} style={{ width: "100%" }}><KeyRound size={16} />{busy ? "Generating..." : "Generate Voucher"}</button></div>
    </div>
    {url && <div className="card" style={{ padding: 14, marginTop: 14, boxShadow: "none" }}><div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Voucher URL</div><div style={{ wordBreak: "break-all", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 13 }}>{url}</div><button className="btn secondary" onClick={copy} style={{ marginTop: 12 }}><Copy size={16} />Copy voucher URL</button></div>}
    <p className="muted" style={{ fontSize: 13 }}>{message}</p>
  </section>;
}
