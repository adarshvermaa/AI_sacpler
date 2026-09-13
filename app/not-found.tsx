import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center max-w-md text-center">
        <Logo size="lg" />
        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold tracking-wide uppercase">
          404 Error: Market Route Not Found
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Terminal Disconnected
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          The requested page or algorithmic module does not exist. Return to the live trading command center.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
