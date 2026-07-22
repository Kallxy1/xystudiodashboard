"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";

type Brand = { title: string; subtitle: string; logoUrl: string; accent: string };

export function LoginForm({ brand }: { brand: Brand }) {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("Checking access...");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, passcode }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return <main className="container flex min-h-screen items-center justify-center py-10">
    <section className="card w-full max-w-md p-6 sm:p-8" style={{ borderColor: `${brand.accent}44` }}>
      <div className="mb-6 flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white text-black">
        {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <LockKeyhole />}
      </div>
      <h1 className="mb-2 text-3xl font-black tracking-tight">{brand.title}</h1>
      <p className="muted mb-6 text-sm leading-6">{brand.subtitle}</p>
      <form onSubmit={submit}>
        <label className="mb-2 block text-sm font-bold text-zinc-300">Allowed email</label>
        <input className="field mb-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@xystudio.my.id" required />
        <label className="mb-2 block text-sm font-bold text-zinc-300">Admin passcode</label>
        <input className="field mb-5" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder="••••••••••••" required />
        <button className="btn w-full" disabled={busy}>{busy ? "Loading..." : "Login dashboard"}</button>
      </form>
      {message && <div className="mt-4 rounded-xl border border-zinc-700 bg-black/30 p-3 text-sm text-zinc-300">{message}</div>}
    </section>
  </main>;
}
