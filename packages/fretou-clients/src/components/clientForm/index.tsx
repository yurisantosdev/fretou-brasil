"use client";

import { ClientFormProps } from "./types";
import { useClientForm } from "./services";
import { formatCnpjInput } from "@fretou/components";

export function ClientForm({
  client,
  onCancel,
  onSubmit
}: ClientFormProps) {
  const data = useClientForm(
    {
      client,
      onCancel,
      onSubmit
    }
  );
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
    erro
  } = data;

  return (
    <form className="flex flex-col gap-5 px-5 py-5 sm:px-6" onSubmit={saveClient} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-navy sm:col-span-2">
          Razão social
          <input
            className={inputClass}
            value={corporateName}
            placeholder="Razão social"
            onChange={(event) => setCorporateName(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          CNPJ
          <input
            className={inputClass}
            inputMode="numeric"
            value={cnpj}
            maxLength={18}
            placeholder="00.000.000/0000-00"
            onChange={(event) => setCnpj(formatCnpjInput(event.target.value))}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          Período
          <input
            className={inputClass}
            value={timePeriod}
            placeholder="Ex.: 30 dias"
            onChange={(event) => setTimePeriod(event.target.value)}
          />
        </label>
      </div>

      {erro ? <p className="text-sm font-semibold text-brand">{erro}</p> : null}

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
