"use client";

import { FormEvent, useId, useState } from "react";
import { VehicleFormProps } from "./types";
import { isVehicleType } from "../../constants/vehicleTypes";

export function useVehicleForm({ vehicle, onSubmit }: VehicleFormProps) {
  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";


  const [plate, setPlate] = useState(vehicle?.plate ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : "");
  const [totalLoad, setTotalLoad] = useState(vehicle?.totalLoad ? String(vehicle.totalLoad) : "");
  const [active, setActive] = useState(vehicle?.active !== false);
  const [erro, setErro] = useState("");
  const plateId = useId();
  const modelId = useId();
  const yearId = useId();
  const loadId = useId();
  const activeId = useId();
  const anoMaximo = new Date().getFullYear() + 1;
  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const plateValue = plate.trim();
    if (!plateValue) {
      setErro("Informe a placa.");
      return;
    }

    if (!isVehicleType(model)) {
      setErro("Selecione o tipo do veículo.");
      return;
    }

    const yearValue = Number(year);
    const anoMaximo = new Date().getFullYear() + 1;
    if (!Number.isInteger(yearValue) || yearValue < 1970 || yearValue > anoMaximo) {
      setErro(`Informe um ano entre 1970 e ${anoMaximo}.`);
      return;
    }

    const loadValue = Number(totalLoad.replace(",", "."));
    if (!Number.isFinite(loadValue) || loadValue <= 0) {
      setErro("Informe a carga total em kg.");
      return;
    }

    setErro("");
    try {
      await onSubmit({
        plate: plateValue,
        model,
        year: yearValue,
        totalLoad: loadValue,
        active,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar o veículo.");
    }
  }

  return {
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
  };
}
