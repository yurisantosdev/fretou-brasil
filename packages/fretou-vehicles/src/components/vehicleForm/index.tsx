"use client";

import { VehicleFormProps } from "./types";
import { useVehicleForm } from "./services";
import { VEHICLE_TYPES } from "../../constants/vehicleTypes";

export function VehicleForm({
  vehicle,
  onCancel,
  onSubmit
}: VehicleFormProps) {
  const data = useVehicleForm({
    vehicle,
    onCancel,
    onSubmit
  });
  if (!data) return null;
  const {
    saveVehicle,
    inputClass,
    plate,
    setPlate,
    model,
    setModel,
    year,
    setYear,
    totalLoad,
    setTotalLoad,
    active,
    setActive,
    erro,
    plateId,
    modelId,
    yearId,
    loadId,
    activeId,
    anoMaximo,
  } = data;

  return (
    <form className="flex flex-col gap-6 px-5 py-5 sm:px-6" onSubmit={saveVehicle} noValidate>
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Identificação</h3>
          <p className="mt-1 text-sm text-muted">Placa, tipo e ano usados para reconhecer o veículo na operação.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor={plateId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Placa
            <input
              id={plateId}
              className={inputClass}
              value={plate}
              autoComplete="off"
              placeholder="Placa do veículo"
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
            />
          </label>

          <label htmlFor={modelId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Tipo
            <select
              id={modelId}
              className={inputClass}
              value={model}
              onChange={(event) => setModel(event.target.value)}
            >
              <option value="">Selecione o tipo</option>
              {VEHICLE_TYPES.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor={yearId} className="flex flex-col gap-2 text-sm font-semibold text-navy sm:max-w-xs">
            Ano
            <input
              id={yearId}
              className={inputClass}
              inputMode="numeric"
              value={year}
              maxLength={4}
              placeholder={String(anoMaximo)}
              onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h3 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Capacidade</h3>
          <p className="mt-1 text-sm text-muted">Peso máximo que o veículo pode transportar.</p>
        </div>

        <label htmlFor={loadId} className="flex flex-col gap-2 text-sm font-semibold text-navy sm:max-w-xs">
          Carga total (kg)
          <input
            id={loadId}
            className={inputClass}
            inputMode="decimal"
            value={totalLoad}
            placeholder="Ex.: 14000"
            onChange={(event) => setTotalLoad(event.target.value.replace(/[^\d,.]/g, ""))}
          />
          <span className="text-xs font-normal text-muted">Informe o valor em quilogramas.</span>
        </label>
      </section>

      <section
        className={`flex flex-col gap-1 rounded-2xl border p-4 ${active ? "border-line bg-white" : "border-amber-200 bg-amber-50"
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
              {active ? "Veículo ativo" : "Veículo desativado"}
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
