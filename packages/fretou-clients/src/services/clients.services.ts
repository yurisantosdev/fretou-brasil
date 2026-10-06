"use client";

import { useEffect, useMemo, useState } from "react";
import { createClients, listClients, updateClients } from "./database.clients.services";
import { Client, ClientFormData, ClientStatusFilter } from "../types/clients";
import { AlertError, AlertSuccess } from "@fretou/components";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientOpen, setClientOpen] = useState<Client | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>("todos");
  const openModal = createModal || clientOpen !== null;

  function normalize(client: Client): Client {
    return {
      ...client,
      _id: String(client._id),
    };
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const list = await listClients(controller.signal);
        if (!active) return;
        setClients(list.map(normalize));
        setError("");
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os clientes");
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

  function buildClient(data: ClientFormData, current?: Client): Client {
    return {
      _id: current?._id ?? "",
      corporateName: data.corporateName.trim(),
      cnpj: data.cnpj.replace(/\D/g, ""),
      timePeriod: data.timePeriod.trim(),
      active: data.active,
    };
  }

  const filteredClients = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase("pt-BR");
    const digits = termo.replace(/\D/g, "");

    return clients.filter((client) => {
      if (statusFilter === "ativos" && client.active === false) return false;
      if (statusFilter === "inativos" && client.active !== false) return false;
      if (!termo) return true;

      const name = client.corporateName.toLocaleLowerCase("pt-BR");
      const cnpj = client.cnpj.replace(/\D/g, "");
      const period = client.timePeriod.toLocaleLowerCase("pt-BR");
      const matchCnpj = digits.length > 0 && cnpj.includes(digits);

      return name.includes(termo) || period.includes(termo) || matchCnpj;
    });
  }, [clients, search, statusFilter]);

  function closeModal() {
    setCreateModal(false);
    setClientOpen(null);
  }

  async function saveClient(form: ClientFormData) {
    const editing = clientOpen !== null;
    const controller = new AbortController();

    try {
      if (clientOpen) {
        const updated = await updateClients(
          clientOpen._id,
          controller.signal,
          buildClient(form, clientOpen)
        );
        setClients((current) =>
          current.map((client) => (client._id === clientOpen._id ? normalize(updated) : client))
        );
      } else {
        const created = await createClients(controller.signal, buildClient(form));
        setClients((current) => [normalize(created), ...current]);
      }

      closeModal();
      AlertSuccess(editing ? "Cliente atualizado com sucesso." : "Cliente criado com sucesso.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível salvar o cliente.");
    }
  }

  return {
    clients: filteredClients,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setClientOpen,
    setCreateModal,
    openModal,
    closeModal,
    createModal,
    clientOpen,
    saveClient,
    loading,
    error,
  };
}
