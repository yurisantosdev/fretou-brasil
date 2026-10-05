"use client";

import { AppShell } from "../components/appShell";
import { useHome } from "../services/home.services";
import { CardModule } from "./_components/cardModule";

export default function Home() {
  const { profile, logout, modules } = useHome();

  return (
    <AppShell profile={profile} onLogout={logout}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10">
        <section className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">
            Boas-vindas
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">
            Olá, {profile?.name}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink">
            Escolha um módulo para continuar a operação.
          </p>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">
                Módulos
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-navy">
                Sua operação
              </h2>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <CardModule
                key={module.href}
                title={module.title}
                description={module.description}
                icon={module.icon}
                color={module.color}
                href={module.href}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
