import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { SignedIn } from "@/lib/auth/gates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

/**
 * Email/password sign-in for self-hosted deployments that don't have the
 * Grok auth broker's OAuth secrets (GROK_AUTH_*) injected. Enabled via the
 * `emailAndPasswordEnabled` flag in `src/lib/auth/email-password.ts`.
 * The first account whose email matches OWNER_EMAIL becomes the admin owner
 * automatically on its first visit to /admin — see guard.server.ts.
 */
function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } =
        mode === "in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
      if (error) throw new Error(error.message ?? "Authentication failed");
      toast.success(mode === "in" ? "Signed in" : "Account created");
      void navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6">
      <SignedIn>
        <p className="text-center text-sm text-muted">You're already signed in.</p>
      </SignedIn>
      <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <h1 className="text-lg font-medium">{mode === "in" ? "Sign in" : "Create an account"}</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === "up" && (
            <div>
              <Label>Name</Label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              className="mt-1"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-center text-xs text-muted underline-offset-4 hover:underline"
          onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
        >
          {mode === "in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
