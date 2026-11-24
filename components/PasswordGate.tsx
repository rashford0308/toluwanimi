"use client";
import { useState } from "react";
import Viewer from "./Viewer";

export default function PasswordGate({ slug }: { slug: string }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [exp, setExp] = useState<any>(null);
  if (exp) return <Viewer exp={exp} />;
  const submit = async () => {
    setErr("");
    const r = await fetch("/api/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, password: pw }) });
    if (r.ok) setExp(await r.json()); else setErr("That isn't the right word. Try again.");
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory px-6">
      <h1 className="font-script text-5xl text-burgundy">A little secret</h1>
      <input className="field max-w-xs text-center" type="password" placeholder="Enter the password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
      <button className="btn-primary" onClick={submit}>Open</button>
      {err && <p className="text-sm text-burgundy">{err}</p>}
    </main>
  );
}
