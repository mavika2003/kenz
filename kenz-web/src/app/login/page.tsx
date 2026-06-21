import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import Nav from "@/components/Nav";

function LoginFallback() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-[0_24px_64px_rgba(20,18,16,0.08)]">
      Loading…
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main className="min-h-[calc(100dvh-4rem)] bg-surface px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/"
            className="mb-8 inline-flex text-sm font-medium text-black/60 transition-colors hover:text-black"
          >
            Back to KenZ
          </Link>

          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </>
  );
}
