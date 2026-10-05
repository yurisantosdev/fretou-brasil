"use client";

import { useEffect, useState } from "react";
import { createClients, listClients, updateClients } from "./database.clients.services";
import { Client, ClientFormData } from "../types/clients";
import { AlertError, AlertSuccess } from "@fretou/components";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientOpen, setClientOpen] = useState<Client | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    };
  }

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
    clients,
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
