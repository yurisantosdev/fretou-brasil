"use client";

import { useEffect, useMemo, useState } from "react";
import { codigoExibido, summarize, todayISO } from "../lib/tripRules";
import { PapelTitulo, StatusTrip, TripClient, TripDetail, TripDraft, TripDriver, TripListItem } from "../types/trips";
import {
  attachPhoto,
  createTrip as createTripRequest,
  getTrip,
  issueCte as issueCteRequest,
  listClients,
  listDrivers,
  listTrips,
  registerDocuments,
  cancelTrip as cancelTripRequest,
  registerAdvance as registerAdvanceRequest,
  registerUnload,
  scheduleBalance,
  settleTitle,
  updateTrip as updateTripRequest,
  type TripQuery,
} from "./database.trips.services";

export function useTrips() {
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [drivers, setDrivers] = useState<Awaited<ReturnType<typeof listDrivers>>>([]);
  const [driversError, setDriversError] = useState("");
  const [clients, setClients] = useState<Awaited<ReturnType<typeof listClients>>>([]);
  const [clientsError, setClientsError] = useState("");
  const [tripOpen, setTripOpen] = useState<TripDetail | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusTrip | "todas">("todas");
  const [clientFilter, setClientFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = todayISO();
  const openModal = createModal || tripOpen !== null;
  const codigoConsulta = /^V-\d{4}-\d{6}$/i.test(search.trim()) ? search.trim().toUpperCase() : undefined;
  const filtros: TripQuery = {
    status: statusFilter,
    clienteId: clientFilter || undefined,
    motoristaId: driverFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    codigo: codigoConsulta,
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const [list, motoristas, tomadores] = await Promise.all([
          listTrips(filtros, controller.signal),
          listDrivers(controller.signal),
          listClients(controller.signal),
        ]);
        if (!active) return;
        setTrips(list);
        setDrivers(motoristas);
        setClients(tomadores);
        setDriversError(motoristas.length === 0 ? "Nenhum motorista terceiro cadastrado." : "");
        setClientsError(tomadores.length === 0 ? "Nenhum cliente cadastrado." : "");
        setError("");
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar as viagens");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [statusFilter, clientFilter, driverFilter, dateFrom, dateTo, codigoConsulta]);

  const summary = useMemo(() => summarize(trips, today), [trips, today]);

  function draftTrip(trip: TripDetail): TripDraft {
    return {
      clientId: trip.clienteId,
      driverId: trip.motoristaId,
      vehicleId: trip.vehicleId ?? "",
      origin: trip.origin,
      destination: trip.destination,
      product: trip.product,
      weightKg: trip.load,
      loadingDate: trip.dateLoad,
      freightReceivable: trip.margem.freteCliente,
      freightPayable: trip.margem.freteMotorista,
      clientTermDays: trip.acordoFrete.prazoClienteDias,
      driverTermDays: trip.acordoFrete.prazoMotoristaDias,
      divideShipping: trip.divideShipping,
    };
  }

  function closeModal() {
    setCreateModal(false);
    setEditModal(false);
    setTripOpen(null);
  }

  function registerClient(client: TripClient) {
    setClients((current) => {
      if (current.some((item) => item.id === client.id)) return current;
      return [client, ...current];
    });
    setClientsError("");
  }

  function registerDriver(driver: TripDriver) {
    setDrivers((current) => {
      if (current.some((item) => item.id === driver.id)) return current;
      return [driver, ...current];
    });
    setDriversError("");
  }

  function visivel(trip: TripListItem): boolean {
    if (statusFilter !== "todas" && trip.status !== statusFilter) return false;
    if (clientFilter && trip.clienteId !== clientFilter) return false;
    if (driverFilter && trip.motoristaId !== driverFilter) return false;
    if (dateFrom && trip.dateLoad < dateFrom) return false;
    if (dateTo && trip.dateLoad > dateTo) return false;
    return true;
  }

  function guardar(detalhe: TripDetail) {
    const resposta: TripListItem = {
      _id: detalhe.id,
      clienteId: detalhe.clienteId,
      motoristaId: detalhe.motoristaId,
      origin: detalhe.origin,
      destination: detalhe.destination,
      product: detalhe.product,
      load: detalhe.load,
      dateLoad: detalhe.dateLoad,
      dateDischarge: detalhe.dateDischarge,
      status: detalhe.status,
      acordoFreteId: detalhe.acordoFreteId,
      cteId: detalhe.cteId,
      shipping: detalhe.shipping,
      divideShipping: detalhe.divideShipping,
      codigo: detalhe.codigo,
      advancePaidAt: detalhe.advancePaidAt,
      margem: detalhe.margem,
      titles: detalhe.titles,
    };
    setTrips((current) => {
      const existe = current.some((trip) => String(trip._id) === detalhe.id);
      const proximos = existe
        ? current.map((trip) => (String(trip._id) === detalhe.id ? resposta : trip))
        : [resposta, ...current];
      return proximos.filter(visivel);
    });
    setTripOpen(detalhe);
  }

  async function openTrip(id: string) {
    setCreateModal(false);
    try {
      const detalhe = await getTrip(id);
      guardar(detalhe);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível abrir a viagem");
    }
  }

  async function editTrip(id: string, draft: TripDraft) {
    guardar(await updateTripRequest(id, draft));
    setEditModal(false);
  }

  async function createTrip(draft: TripDraft) {
    await createTripRequest(draft);
    setTrips(await listTrips(filtros));
    closeModal();
  }

  async function issueCte(id: string, numero: string, emitidoEm: string) {
    guardar(await issueCteRequest(id, numero, emitidoEm));
  }

  async function sendPhoto(id: string, nome: string, enviadaEm: string, conteudo: string) {
    guardar(await attachPhoto(id, nome, enviadaEm, conteudo));
  }

  async function unload(id: string, dataHora: string) {
    guardar(await registerUnload(id, dataHora));
  }

  async function documents(id: string, dataHora: string) {
    guardar(await registerDocuments(id, dataHora));
  }

  async function settle(id: string, papel: PapelTitulo, occurredAt: string) {
    guardar(await settleTitle(id, papel, occurredAt));
  }

  async function schedule(id: string, scheduledAt: string) {
    guardar(await scheduleBalance(id, scheduledAt));
  }

  async function registerAdvance(id: string, occurredAt: string) {
    guardar(await registerAdvanceRequest(id, occurredAt));
  }

  async function cancel(id: string) {
    guardar(await cancelTripRequest(id));
  }

  const termo = search.trim().toLocaleLowerCase("pt-BR");
  const visible = termo
    ? trips.filter((trip) => {
      const viagem = codigoExibido(trip).toLocaleLowerCase("pt-BR");
      const produto = (trip.product ?? "").toLocaleLowerCase("pt-BR");
      const rota = `${trip.origin} ${trip.destination}`.toLocaleLowerCase("pt-BR");
      return viagem.includes(termo) || produto.includes(termo) || rota.includes(termo);
    })
    : trips;

  return {
    drivers,
    driversError,
    registerDriver,
    clients,
    clientsError,
    registerClient,
    summary,
    today,
    tripOpen,
    createModal,
    setCreateModal,
    editModal,
    setEditModal,
    editTrip,
    openModal,
    closeModal,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    driverFilter,
    setDriverFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    loading,
    error,
    openTrip,
    createTrip,
    issueCte,
    sendPhoto,
    unload,
    documents,
    settle,
    schedule,
    registerAdvance,
    cancel,
    search,
    setSearch,
    visible,
    draftTrip
  };
}
