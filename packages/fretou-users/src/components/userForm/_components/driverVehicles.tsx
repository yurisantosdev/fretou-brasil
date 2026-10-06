"use client";

import { useId, useState } from "react";
import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { formatLoad } from "@fretou/components";
import { VEHICLE_TYPES, isVehicleType, type Vehicle } from "@fretou/vehicles";

type DriverVehiclesProps = {
  vehicles: Vehicle[];
  onChange: (vehicles: Vehicle[]) => void;
  inputClass: string;
};

const vazio = {
  plate: "",
  model: "",
  year: "",
  totalLoad: "",
  active: true,
};

export function DriverVehicles({ vehicles, onChange, inputClass }: DriverVehiclesProps) {
  const plateId = useId();
  const modelId = useId();
  const yearId = useId();
  const loadId = useId();
  const activeId = useId();
  const anoMaximo = new Date().getFullYear() + 1;

  const [aberto, setAberto] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [totalLoad, setTotalLoad] = useState("");
  const [active, setActive] = useState(true);
  const [erro, setErro] = useState("");

  function limpar() {
    setAberto(false);
    setEditingId(null);
    setPlate(vazio.plate);
    setModel(vazio.model);
    setYear(vazio.year);
    setTotalLoad(vazio.totalLoad);
    setActive(vazio.active);
    setErro("");
  }

  function abrirNovo() {
    limpar();
    setAberto(true);
  }

  function abrirEdicao(vehicle: Vehicle) {
    setEditingId(vehicle._id);
    setPlate(vehicle.plate);
    setModel(vehicle.model);
    setYear(String(vehicle.year));
    setTotalLoad(String(vehicle.totalLoad));
    setActive(vehicle.active !== false);
    setErro("");
    setAberto(true);
  }

  function incluir() {
    const plateValue = plate.trim().toUpperCase();
    if (!plateValue) {
      setErro("Informe a placa.");
      return;
    }

    if (!isVehicleType(model)) {
      setErro("Selecione o tipo do veículo.");
      return;
    }

    const yearValue = Number(year);
    if (!Number.isInteger(yearValue) || yearValue < 1970 || yearValue > anoMaximo) {
      setErro(`Informe um ano entre 1970 e ${anoMaximo}.`);
      return;
    }

    const loadValue = Number(totalLoad.replace(",", "."));
    if (!Number.isFinite(loadValue) || loadValue <= 0) {
      setErro("Informe a carga total em kg.");
      return;
    }

    const repetida = vehicles.some(
      (vehicle) => vehicle._id !== editingId && vehicle.plate.toUpperCase() === plateValue
    );
    if (repetida) {
      setErro("Esta placa já está na lista.");
      return;
    }

    const item: Vehicle = {
      _id: editingId ?? crypto.randomUUID(),
      plate: plateValue,
      model,
      year: yearValue,
      totalLoad: loadValue,
      active,
    };

    onChange(
      editingId
        ? vehicles.map((vehicle) => (vehicle._id === editingId ? item : vehicle))
        : [...vehicles, item]
    );
    limpar();
  }

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Veículos</h3>
          <p className="mt-1 text-sm text-muted">Cadastre um ou mais veículos deste motorista.</p>
        </div>
        {aberto ? null : (
          <button
            type="button"
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            onClick={abrirNovo}
          >
            <PlusIcon size={16} />
            Adicionar
          </button>
        )}
      </div>

      {vehicles.length === 0 && !aberto ? (
        <p className="rounded-xl border border-dashed border-line bg-white px-4 py-5 text-sm text-muted">
          Nenhum veículo ainda. Adicione a placa, o tipo, o ano e a carga.
        </p>
      ) : null}

      {vehicles.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {vehicles.map((vehicle) => {
            const editando = vehicle._id === editingId;
            return (
              <li
                key={vehicle._id}
                className={`flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-3 ${
                  editando ? "border-brand" : "border-line"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">{vehicle.plate}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {vehicle.model} · {vehicle.year} · {formatLoad(vehicle.totalLoad)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      vehicle.active !== false ? "bg-emerald-100 text-emerald-800" : "bg-canvas text-muted"
                    }`}
                  >
                    {vehicle.active !== false ? "Ativo" : "Desativado"}
                  </span>
                  <button
                    type="button"
                    aria-label={`Editar ${vehicle.plate}`}
                    className="grid size-9 cursor-pointer place-items-center rounded-xl border border-line text-navy transition hover:bg-canvas"
                    onClick={() => abrirEdicao(vehicle)}
                  >
                    <PencilSimpleIcon size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${vehicle.plate}`}
                    className="grid size-9 cursor-pointer place-items-center rounded-xl border border-line text-navy transition hover:bg-canvas"
                    onClick={() => {
                      onChange(vehicles.filter((item) => item._id !== vehicle._id));
                      if (vehicle._id === editingId) limpar();
                    }}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {aberto ? (
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4">
          <p className="text-sm font-semibold text-navy">
            {editingId ? "Editar veículo" : "Novo veículo"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor={plateId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
              Placa
              <input
                id={plateId}
                className={inputClass}
                value={plate}
                autoComplete="off"
                placeholder="ABC1D23"
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

            <label htmlFor={yearId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
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

            <label htmlFor={loadId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
              Carga total (kg)
              <input
                id={loadId}
                className={inputClass}
                inputMode="decimal"
                value={totalLoad}
                placeholder="14000"
                onChange={(event) => setTotalLoad(event.target.value.replace(/[^\d,.]/g, ""))}
              />
            </label>
          </div>

          <label htmlFor={activeId} className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-navy">
            <input
              id={activeId}
              type="checkbox"
              className="size-4 accent-brand"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            Veículo ativo
          </label>

          {erro ? (
            <p className="text-sm font-semibold text-brand" role="alert">
              {erro}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="h-10 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy transition hover:bg-canvas"
              onClick={limpar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="h-10 cursor-pointer rounded-xl bg-navy px-4 text-sm font-semibold text-white transition hover:bg-navy/90"
              onClick={incluir}
            >
              {editingId ? "Salvar veículo" : "Incluir veículo"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
