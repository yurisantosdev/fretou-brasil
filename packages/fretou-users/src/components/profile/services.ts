"use client";

import { AlertSuccess } from "@fretou/components";
import { ProfileAccount, ProfileProps } from "./types";
import { updateUsers } from "../../services/database.users.services";
import { User } from "../../types/users";
import { FormEvent, useId, useState } from "react";

export function useProfile({
  account,
  onLogout,
  onUpdated,
}: ProfileProps) {
  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";

  const nameId = useId();
  const passwordId = useId();
  const pixId = useId();
  const plateId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [plateVehicle, setPlateVehicle] = useState(account.plateVehicle ?? "");
  const [keyPix, setKeyPix] = useState(account.keyPix ?? "");
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);

  function openProfile() {
    setName(account.name);
    setPassword("");
    setShowPassword(false);
    setPlateVehicle(account.plateVehicle ?? "");
    setKeyPix(account.keyPix ?? "");
    setErro("");
    setOpen(true);
  }

  async function saveUserProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErro("Informe o nome.");
      return;
    }

    if (account.thirdParty && !plateVehicle.trim()) {
      setErro("Informe a placa do veículo.");
      return;
    }

    const senhaNova = password.trim();
    const placa = account.thirdParty ? plateVehicle.trim().toUpperCase() : "";
    const pix = keyPix.trim();
    const user: User = {
      _id: account.id,
      name: name.trim(),
      cpf: account.cpf,
      driver: account.driver,
      thirdParty: account.driver && account.thirdParty === true,
      plateVehicle: placa,
      ...(account.driver ? { keyPix: pix } : {}),
      ...(senhaNova ? { password: senhaNova } : {}),
      active: account.active !== false,
    };

    setErro("");
    setSaving(true);
    const controller = new AbortController();
    let desconectar = false;

    try {
      await updateUsers(account.id, controller.signal, user);
      const atualizado: ProfileAccount = {
        ...account,
        name: user.name,
        plateVehicle: placa,
        keyPix: account.driver ? pix : account.keyPix,
      };
      onUpdated?.(atualizado);
      setOpen(false);

      if (senhaNova) {
        desconectar = true;
        AlertSuccess("Senha atualizada. Você sairá do sistema.");
        window.setTimeout(onLogout, 1600);
        return;
      }

      AlertSuccess("Perfil atualizado.");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível atualizar o perfil.");
    } finally {
      if (!desconectar) setSaving(false);
    }
  }

  return {
    inputClass,
    openProfile,
    name,
    setName,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    plateVehicle,
    setPlateVehicle,
    keyPix,
    setKeyPix,
    erro,
    saving,
    open,
    setOpen,
    nameId,
    passwordId,
    pixId,
    plateId,
    saveUserProfile,
  };
}
