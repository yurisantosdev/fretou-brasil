"use client";

import { useEffect, useMemo, useState } from "react";
import { createUsers, listUsers, updateUsers } from "./database.users.services";
import { User, UserFormData, UserStatusFilter } from "../types/users";
import { AlertError, AlertSuccess } from "@fretou/components";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [userOpen, setUserOpen] = useState<User | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [onlyDrivers, setOnlyDrivers] = useState(false);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("todos");
  const openModal = createModal || userOpen !== null;

  function normalize(user: User): User {
    const { password: _password, ...rest } = user;
    return {
      ...rest,
      _id: String(user._id),
    };
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const list = await listUsers(controller.signal);
        if (!active) return;
        setUsers(list.map(normalize));
        setError("");
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os usuários");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  function buildUser(data: UserFormData, current?: User): User {
    const cpf = data.cpf.replace(/\D/g, "");
    const plate = data.driver ? data.plateVehicle.trim().toUpperCase() : undefined;

    return {
      _id: current?._id ?? "",
      name: data.name.trim(),
      cpf,
      password: data.password || undefined,
      driver: data.driver,
      plateVehicle: plate || "",
      keyPix: data.keyPix.trim(),
      active: data.active,
    };
  }

  const filteredUsers = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase("pt-BR");
    const digits = termo.replace(/\D/g, "");

    return users.filter((user) => {
      if (onlyDrivers && !user.driver) return false;
      if (statusFilter === "ativos" && user.active === false) return false;
      if (statusFilter === "inativos" && user.active !== false) return false;
      if (!termo) return true;

      const name = user.name.toLocaleLowerCase("pt-BR");
      const cpf = (user.cpf ?? "").replace(/\D/g, "");
      const plate = (user.plateVehicle ?? "").toLocaleLowerCase("pt-BR");
      const matchCpf = digits.length > 0 && cpf.includes(digits);

      return name.includes(termo) || plate.includes(termo) || matchCpf;
    });
  }, [users, search, onlyDrivers, statusFilter]);

  function formatCpf(cpf?: string) {
    if (!cpf) return "—";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  function closeModal() {
    setCreateModal(false);
    setUserOpen(null);
  }

  async function saveUser(form: UserFormData) {
    const editing = userOpen !== null;
    const controller = new AbortController();

    try {
      if (userOpen) {
        const updated = await updateUsers(
          userOpen._id,
          controller.signal,
          buildUser(form, userOpen)
        );
        setUsers((current) =>
          current.map((user) => (user._id === userOpen._id ? normalize(updated) : user))
        );
      } else {
        const created = await createUsers(controller.signal, buildUser(form));
        setUsers((current) => [normalize(created), ...current]);
      }

      closeModal();
      AlertSuccess(editing ? "Usuário atualizado com sucesso." : "Usuário criado com sucesso.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível salvar o usuário.");
    }
  }

  return {
    users: filteredUsers,
    search,
    setSearch,
    onlyDrivers,
    setOnlyDrivers,
    statusFilter,
    setStatusFilter,
    setUserOpen,
    setCreateModal,
    openModal,
    closeModal,
    createModal,
    userOpen,
    saveUser,
    formatCpf,
    loading,
    error,
  };
}
