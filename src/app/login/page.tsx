"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) setError(authError.message);
    else setSent(true);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at top, #efe9dc 0%, #f8f7f4 60%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-8"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          boxShadow:
            "0 20px 40px -12px rgba(15, 15, 15, 0.12), 0 8px 16px -4px rgba(15, 15, 15, 0.06)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ background: "var(--accent)" }}
          >
            R
          </div>
          <div>
            <h1
              className="text-lg font-bold tracking-wide"
              style={{ color: "var(--text-primary)" }}
            >
              RAPPORT TRADING
            </h1>
            <p className="text-xs" style={{ color: "var(--accent-gold)" }}>
              V0.1 · L. TRADING DESK
            </p>
          </div>
        </div>

        {!sent ? (
          <>
            <h2
              className="text-2xl mb-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              Connexion
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Un lien magique sera envoyé à ton email pour te connecter.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-[11px] font-bold tracking-wider uppercase mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="luca@exemple.com"
                    required
                    autoFocus
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div
                  className="text-xs p-3 rounded-md"
                  style={{
                    background: "var(--bear-bg)",
                    color: "var(--bear)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
                style={{ background: "var(--text-primary)" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    Recevoir le lien magique <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
              style={{ background: "var(--bull-bg)" }}
            >
              <CheckCircle2 size={28} style={{ color: "var(--bull)" }} />
            </div>
            <h2
              className="text-xl mb-3"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              Lien envoyé
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Vérifie ta boîte mail <strong>{email}</strong> et clique sur le
              lien pour te connecter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Utiliser un autre email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
