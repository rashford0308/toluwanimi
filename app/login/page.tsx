"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const r = useRouter();
  const go = async () => {
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password: pw });
    if (error) setErr(error.message); else { r.push("/dashboard"); r.refresh(); }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="card w-full max-w-sm space-y-3">
        <h1 className="font-serif text-3xl text-burgundy">Studio sign in</h1>
        <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
        <button className="btn-primary w-full" onClick={go}>Sign in</button>
        {err && <p className="text-sm text-burgundy">{err}</p>}
      </div>
    </main>
  );
}
