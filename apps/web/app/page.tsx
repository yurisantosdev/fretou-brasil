"use client";

import { useLogin } from "./services/login.services";

export default function LoginPage() {
  const data = useLogin();
  if (!data) return null;
  const {
    login,
    inputClass,
    cpf,
    setCpf,
    formatCpfInput,
    showPassword,
    password,
    setPassword,
    setShowPassword,
    erro,
    sending
  } = data;

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
      <section className="relative flex flex-col bg-canvas bg-[linear-gradient(rgba(13,32,86,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(13,32,86,0.045)_1px,transparent_1px)] bg-size-[56px_56px] bg-fixed px-6 pt-6 pb-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-44 after:bg-linear-to-b after:from-transparent after:to-canvas after:content-[''] lg:px-14 lg:pt-8 lg:pb-16">
        <img
          className="h-auto w-52"
          src="/logo-fretou.svg"
          alt="Fretou Brasil"
          width={208}
          height={60}
        />
        <div className="relative z-10 my-7 flex max-w-xl flex-col gap-3.5 lg:my-auto lg:gap-5">
          <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">Boas-vindas a Fretou!</p>
          <h1 className="text-[clamp(2.125rem,4vw,3.5rem)] leading-[1.08] font-bold tracking-[-0.03em]">
            Acesse sua operação com <span className="text-brand">agilidade</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-ink lg:text-lg">
            Conte com a expertise da Fretou Brasil para acompanhar cargas, rotas
            e parceiros em todo o território nacional.
          </p>
          <div className="mt-1 flex w-fit items-center gap-3.5 rounded-2xl bg-white px-4.5 py-3.5 shadow-[0_16px_40px_rgba(13,32,86,0.1)] lg:mt-3">
            <svg className="size-7 shrink-0" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M6 26L14 6h5L11 26H6Z" fill="#1C44F2" />
              <path d="M15 26L23 6h5L20 26h-5Z" fill="#1C44F2" />
            </svg>
            <strong className="text-[13px] leading-tight tracking-wide">
              PRECISOU?
              <br />
              FRETOU!
            </strong>
          </div>
        </div>
      </section>

      <aside className="flex items-center justify-center px-5 pt-2 pb-8 lg:bg-linear-to-b lg:from-brand lg:to-brand-dark lg:px-8 lg:py-10">
        <div className="w-full max-w-[420px] rounded-[20px] bg-white px-8 pt-9 pb-7 shadow-[0_16px_40px_rgba(13,32,86,0.1)] lg:shadow-[0_24px_60px_rgba(8,18,56,0.22)]">
          <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">Área restrita</p>
          <h2 className="mt-2 text-[28px] leading-tight font-bold tracking-tight">
            Entrar no sistema
          </h2>
          <p className="mt-2.5 mb-7 text-[15px] leading-normal text-muted">
            Use o CPF e a senha cadastrados para continuar.
          </p>
          <form className="flex flex-col gap-4" onSubmit={login} noValidate>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              <span>CPF</span>
              <input
                className={inputClass}
                name="cpf"
                inputMode="numeric"
                autoComplete="username"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(event) => setCpf(formatCpfInput(event.target.value))}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              <span>Senha</span>
              <div className="relative">
                <input
                  className={`${inputClass} pr-13`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted hover:bg-canvas hover:text-navy"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.8 4.2 10 7-.4.9-1 1.8-1.8 2.6M6.1 6.7C4.2 8 2.9 9.8 2 12c1.2 2.8 4.8 7 10 7 1.5 0 2.9-.3 4.1-.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
            {erro ? (
              <p className="rounded-xl bg-red-50 px-3.5 py-3 text-sm leading-snug text-red-800">
                {erro}
              </p>
            ) : null}
            <button
              className="mt-1 h-13 cursor-pointer rounded-xl bg-brand text-base font-bold text-white transition hover:bg-brand-dark disabled:cursor-progress disabled:opacity-70"
              type="submit"
              disabled={sending}
            >
              {sending ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="mt-4.5 text-center text-[13px] text-faint">
            Suas informações estão seguras
          </p>
        </div>
      </aside>
    </div>
  );
}
