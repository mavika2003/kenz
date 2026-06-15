import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import Nav from "@/components/Nav";

function LoginFallback() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-8 text-center shadow-[8px_8px_0_#141210]">
      Loading…
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main className="min-h-[calc(100vh-4rem)] bg-orange px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/"
            className="mb-8 inline-flex font-[family-name:var(--font-caveat)] text-lg text-black/70 hover:text-black"
          >
            ← Back to KenZ
          </Link>

          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </>
  );
}
