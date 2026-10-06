"use client";

import { FormEvent, useState } from "react";
import { UserFormProps } from "./types";
import { formatCpf } from "@fretou/components";

export function useUserForm({
  user,
  onCancel,
  onSubmit,
  defaultDriver = false
}: UserFormProps) {
  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";


  const [name, setName] = useState(user?.name ?? "");
  const [cpf, setCpf] = useState(formatCpf(user?.cpf ?? ""));
  const [password, setPassword] = useState("");
  const [driver, setDriver] = useState(user?.driver ?? defaultDriver);
  const [plateVehicle, setPlateVehicle] = useState(user?.plateVehicle ?? "");
  const [keyPix, setKeyPix] = useState(user?.keyPix ?? "");
  const [active, setActive] = useState(user?.active !== false);
  const [erro, setErro] = useState("");

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErro("Informe o nome.");
      return;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      setErro("Informe um CPF com 11 dígitos.");
      return;
    }

    if (!user && !password) {
      setErro("Informe a senha.");
      return;
    }

    if (driver && !plateVehicle.trim()) {
      setErro("Informe a placa do veículo.");
      return;
    }

    setErro("");
    try {
      await onSubmit({ name, cpf, password, driver, plateVehicle, keyPix, active });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar o usuário.");
    }
  }

  return {
    salvar,
    inputClass,
    name,
    setName,
    cpf,
    setCpf,
    password,
    setPassword,
    driver,
    setDriver,
    plateVehicle,
    setPlateVehicle,
    keyPix,
    setKeyPix,
    active,
    setActive,
    erro,
  };
}
