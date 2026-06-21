"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  loginPageUrl,
  loginWithEmail,
  registerWithEmail,
  type AuthMode,
} from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, user } = useAuth();

  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  const next = searchParams.get("next") || "/chat";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = () => {
    window.location.href = next.startsWith("/") ? next : "/chat";
  };

  if (user) {
    finish();
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const authed =
        mode === "signup"
          ? await registerWithEmail({
              email,
              username,
              password,
              name: username,
            })
          : await loginWithEmail({
              email_or_username: email || username,
              password,
            });

      setUser(authed);
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    router.replace(loginPageUrl(nextMode, next));
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-[0_24px_64px_rgba(20,18,16,0.08)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-orange">
        {mode === "signup" ? "Create account" : "Welcome back"}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-anton)] text-2xl uppercase leading-tight text-black">
        {mode === "signup" ? "Join KenZ" : "Log in to KenZ"}
      </h1>
      <p className="mt-2 text-sm text-black/65">
        {mode === "signup"
          ? "Sign up to chat with a Kenzr and save your trip tips."
          : "Pick up where you left off with your Dubai local."}
      </p>

      <div className="mt-6 flex rounded-full border border-black/10 bg-surface p-1">
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            mode === "signup" ? "bg-black text-white" : "text-black/70"
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            mode === "login" ? "bg-black text-white" : "text-black/70"
          }`}
        >
          Login
        </button>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
        {mode === "signup" ? (
          <>
            <Field
              label="Email"
              type="email"
              value={email}
              onValueChange={setEmail}
              placeholder="you@email.com"
              required
            />
            <Field
              label="Username"
              type="text"
              value={username}
              onValueChange={setUsername}
              placeholder="dubai_explorer"
              required
              minLength={3}
              pattern="^[a-zA-Z0-9_]+$"
            />
          </>
        ) : (
          <Field
            label="Email or username"
            type="text"
            value={email || username}
            onValueChange={(value) => {
              setEmail(value);
              setUsername(value);
            }}
            placeholder="you@email.com or username"
            required
          />
        )}

        <Field
          label="Password"
          type="password"
          value={password}
          onValueChange={setPassword}
          placeholder="At least 8 characters"
          required
          minLength={8}
        />

        {error ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border-2 border-black bg-black px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_#ff6a00] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-orange-deep hover:shadow-[6px_6px_0_#ff6a00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onValueChange,
  ...props
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-sm font-bold text-black">{label}</span>
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="w-full rounded-lg border-2 border-black px-3 py-3 text-sm outline-none focus:outline focus:outline-[3px] focus:outline-orange-soft"
        {...props}
      />
    </label>
  );
}
