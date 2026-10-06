"use client";

import { useId } from "react";
import { ClientFormProps } from "./types";
import { useClientForm } from "./services";
import { formatCnpjInput } from "@fretou/components";

export function ClientForm({
  client,
  onCancel,
  onSubmit
}: ClientFormProps) {
  const data = useClientForm({
    client,
    onCancel,
    onSubmit
  });
  const nameId = useId();
  const cnpjId = useId();
  const periodId = useId();
  const activeId = useId();

  if (!data) return null;
  const {
    saveClient,
    inputClass,
    corporateName,
    setCorporateName,
    cnpj,
    setCnpj,
    timePeriod,
    setTimePeriod,
    active,
    setActive,
    erro
  } = data;

  return (
    <form className="flex flex-col gap-6 px-5 py-5 sm:px-6" onSubmit={saveClient} noValidate>
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Identificação</h3>
          <p className="mt-1 text-sm text-muted">Dados usados para reconhecer o cliente na operação.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor={nameId} className="flex flex-col gap-2 text-sm font-semibold text-navy sm:col-span-2">
            Razão social
            <input
              id={nameId}
              className={inputClass}
              value={corporateName}
              autoComplete="organization"
              placeholder="Nome da empresa"
              onChange={(event) => setCorporateName(event.target.value)}
            />
          </label>

          <label htmlFor={cnpjId} className="flex flex-col gap-2 text-sm font-semibold text-navy sm:col-span-2 sm:max-w-sm">
            CNPJ
            <input
              id={cnpjId}
              className={inputClass}
              inputMode="numeric"
              autoComplete="off"
              value={cnpj}
              maxLength={18}
              placeholder="00.000.000/0000-00"
              onChange={(event) => setCnpj(formatCnpjInput(event.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h3 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Prazo</h3>
          <p className="mt-1 text-sm text-muted">Prazo de pagamento sugerido ao abrir uma viagem deste cliente.</p>
        </div>

        <label htmlFor={periodId} className="flex flex-col gap-2 text-sm font-semibold text-navy sm:max-w-xs">
          Período
          <input
            id={periodId}
            className={inputClass}
            value={timePeriod}
            autoComplete="off"
            placeholder="Ex.: 30 dias"
            onChange={(event) => setTimePeriod(event.target.value)}
          />
          <span className="text-xs font-normal text-muted">Informe em dias. Exemplo: 30 dias.</span>
        </label>
      </section>

      <section
        className={`flex flex-col gap-1 rounded-2xl border p-4 ${
          active ? "border-line bg-white" : "border-amber-200 bg-amber-50"
        }`}
      >
        <label htmlFor={activeId} className="flex cursor-pointer items-start gap-3">
          <input
            id={activeId}
            type="checkbox"
            className="mt-0.5 size-4 accent-brand"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-navy">
              {active ? "Cliente ativo" : "Cliente desativado"}
            </span>
            <span className="mt-1 block text-sm font-normal text-muted">
              {active
                ? "Disponível para novas viagens."
                : "Fora da operação. Não aparece na lista de novas viagens."}
            </span>
          </span>
        </label>
      </section>

      {erro ? (
        <p className="text-sm font-semibold text-brand" role="alert">
          {erro}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 border-t border-line pt-4">
        <button
          type="button"
          className="h-10 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy transition hover:bg-canvas"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
