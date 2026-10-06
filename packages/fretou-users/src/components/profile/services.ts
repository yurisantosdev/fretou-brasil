"use client";

import { AlertSuccess } from "@fretou/components";
import { Vehicle } from "@fretou/vehicles";
import { ProfileAccount, ProfileProps } from "./types";
import { updateUsers } from "../../services/database.users.services";
import { User } from "../../types/users";
import { FormEvent, useId, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function listarVeiculos(driverId: string, signal: AbortSignal): Promise<Vehicle[]> {
  const token = sessionStorage.getItem("fretou_token");
  const response = await fetch(`${API_URL}/api/vehicles?driver=${driverId}`, {
    signal,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os veículos.");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de veículos.");
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const vehicle = item as Partial<Vehicle>;
    if (typeof vehicle._id !== "string" || typeof vehicle.plate !== "string") return [];
    return [
      {
        _id: vehicle._id,
        plate: vehicle.plate,
        model: typeof vehicle.model === "string" ? vehicle.model : "",
        year: Number(vehicle.year),
        totalLoad: Number(vehicle.totalLoad),
        active: vehicle.active !== false,
      },
    ];
  });
}

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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [keyPix, setKeyPix] = useState(account.keyPix ?? "");
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);
  const veiculosRequest = useRef<AbortController | null>(null);

  function openProfile() {
    veiculosRequest.current?.abort();
    setName(account.name);
    setPassword("");
    setShowPassword(false);
    setVehicles([]);
    setKeyPix(account.keyPix ?? "");
    setErro("");
    setOpen(true);

    if (!account.thirdParty) {
      setLoadingVehicles(false);
      return;
    }

    const controller = new AbortController();
    veiculosRequest.current = controller;
    setLoadingVehicles(true);
    void listarVeiculos(account.id, controller.signal)
      .then((lista) => {
        setVehicles(lista);
        setErro("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setErro(err instanceof Error ? err.message : "Não foi possível carregar os veículos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingVehicles(false);
      });
  }

  async function saveUserProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErro("Informe o nome.");
      return;
    }

    if (account.thirdParty && loadingVehicles) {
      setErro("Aguarde o carregamento dos veículos.");
      return;
    }

    if (account.thirdParty && vehicles.length === 0) {
      setErro("Informe pelo menos um veículo.");
      return;
    }

    const senhaNova = password.trim();
    const pix = keyPix.trim();
    const terceiro = account.driver && account.thirdParty === true;
    const user: User = {
      _id: account.id,
      name: name.trim(),
      cpf: account.cpf,
      driver: account.driver,
      thirdParty: terceiro,
      vehicles: terceiro ? vehicles : [],
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
    vehicles,
    setVehicles,
    loadingVehicles,
    keyPix,
    setKeyPix,
    erro,
    saving,
    open,
    setOpen,
    nameId,
    passwordId,
    pixId,
    saveUserProfile,
  };
}
