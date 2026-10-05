"use client";

import { FormEvent, useState } from "react";
import { User, UserFormData } from "../types/users";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";

function mascararCpf(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

type UserFormProps = {
  user: User | null;
  onCancel: () => void;
  onSubmit: (data: UserFormData) => void | Promise<void>;
};

export function UserForm({ user, onCancel, onSubmit }: UserFormProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [cpf, setCpf] = useState(mascararCpf(user?.cpf ?? ""));
  const [password, setPassword] = useState("");
  const [driver, setDriver] = useState(user?.driver ?? false);
  const [plateVehicle, setPlateVehicle] = useState(user?.plateVehicle ?? "");
  const [keyPix, setKeyPix] = useState(user?.keyPix ?? "");
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
      await onSubmit({ name, cpf, password, driver, plateVehicle, keyPix });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar o usuário.");
    }
  }

  return (
    <form className="flex flex-col gap-5 px-5 py-5 sm:px-6" onSubmit={salvar} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          Nome
          <input
            className={inputClass}
            value={name}
            placeholder="Nome completo"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          CPF
          <input
            className={inputClass}
            inputMode="numeric"
            value={cpf}
            placeholder="000.000.000-00"
            onChange={(event) => setCpf(mascararCpf(event.target.value))}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          Senha
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            placeholder={user ? "Deixe em branco para manter" : "Digite a senha"}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          Chave Pix
          <input
            className={inputClass}
            value={keyPix}
            placeholder="Opcional"
            onChange={(event) => setKeyPix(event.target.value)}
          />
        </label>

        <label className="flex h-11 items-center gap-3 self-end text-sm font-semibold text-navy">
          <input
            type="checkbox"
            className="size-4 accent-brand"
            checked={driver}
            onChange={(event) => {
              setDriver(event.target.checked);
              if (!event.target.checked) setPlateVehicle("");
            }}
          />
          Motorista
        </label>

        {driver ? (
          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Placa
            <input
              className={inputClass}
              value={plateVehicle}
              placeholder="ABC1D23"
              onChange={(event) => setPlateVehicle(event.target.value.toUpperCase())}
            />
          </label>
        ) : null}
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
