"use client";

import Link from "next/link";
import { Profile } from "../lib/api";

export function AppShell({
  profile,
  onLogout,
  children,
}: {
  profile: Profile | null;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  if (!profile) {
    return (
      <main className="grid min-h-svh place-items-center text-sm text-muted">
        Verificando sessão...
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-canvas bg-[linear-gradient(rgba(13,32,86,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(13,32,86,0.045)_1px,transparent_1px)] bg-size-[56px_56px] bg-fixed">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-white/95 px-6 py-4 backdrop-blur-sm">
        <Link href="/home">
          <img src="/logo-fretou.svg" alt="Fretou Brasil" width={146} height={42} />
        </Link>
        <button
          type="button"
          className="h-10 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy transition hover:bg-canvas"
          onClick={onLogout}
        >
          Sair
        </button>
      </header>
      {children}
    </main>
  );
}
