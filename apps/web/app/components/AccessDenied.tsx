import Link from "next/link";
import { ArrowLeftIcon, LockSimpleIcon } from "@phosphor-icons/react";
import React from "react";

export function AccessDenied() {
  return (

    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-7xl items-center justify-center px-6 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-line bg-white px-8 py-10 text-center shadow-[0_10px_30px_rgba(13,32,86,0.06)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
          <LockSimpleIcon size={28} weight="duotone" />
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand">
          Acesso restrito
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Este módulo é restrito aos usuários internos da empresa.
        </p>
        <Link
          href="/home"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <ArrowLeftIcon size={16} />
          Voltar ao início
        </Link>
      </section>
    </div>
  )
}