"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertError, AlertSuccess, formatMoney, formatMoneyInput, parseMoney } from "@fretou/components";
import { TripFormProps } from "./types";
import { DivideShipping } from "../../types/trips";
import { createClient, createUser } from "../../services/database.trips.services";

export function useTripForm({
  clients,
  clientsError,
  drivers,
  driversError,
  onCancel,
  onSubmit,
  onClientCreated,
  onDriverCreated,
  initial,
  successMessage = "Viagem cadastrada com sucesso.",
}: TripFormProps) {
  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";

  const [divideShipping, setDivideShipping] = useState<DivideShipping>(initial?.divideShipping ?? "50%");
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [clientModal, setClientModal] = useState(false);
  const [driverId, setDriverId] = useState(initial?.driverId ?? "");
  const [driverModal, setDriverModal] = useState(false);
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [product, setProduct] = useState(initial?.product ?? "");
  const [weightKg, setWeightKg] = useState(initial ? String(initial.weightKg) : "");
  const [loadingDate, setLoadingDate] = useState(initial?.loadingDate ?? "");
  const [freightReceivable, setFreightReceivable] = useState(initial ? formatMoney(initial.freightReceivable) : "");
  const [freightPayable, setFreightPayable] = useState(initial ? formatMoney(initial.freightPayable) : "");
  const [clientTermDays, setClientTermDays] = useState(initial ? String(initial.clientTermDays) : "");

  useEffect(() => {
    const cliente = clients.find((item) => item.id === clientId);
    const dias = cliente?.timePeriod?.match(/\d+/);
    setClientTermDays(dias?.[0] ?? "");
  }, [clientId, clients]);
  const [driverTermDays, setDriverTermDays] = useState(initial ? String(initial.driverTermDays) : "0");

  const receivable = parseMoney(freightReceivable);
  const payable = parseMoney(freightPayable);
  const margin =
    freightReceivable !== "" && freightPayable !== "" && Number.isFinite(receivable) && Number.isFinite(payable)
      ? receivable - payable
      : null;

  async function saveTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const weight = Number(weightKg.trim().replace(",", "."));
    const receive = parseMoney(freightReceivable);
    const pay = parseMoney(freightPayable);
    const clientTerm = Number(clientTermDays);
    const driverTerm = Number(driverTermDays);

    if (!clientId) {
      AlertError("Selecione o cliente.");
      return;
    }
    if (!driverId) {
      AlertError("Selecione o motorista.");
      return;
    }
    if (!origin.trim() || !destination.trim()) {
      AlertError("Informe a origem e o destino.");
      return;
    }
    if (!product.trim()) {
      AlertError("Informe o produto.");
      return;
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      AlertError("Informe o peso em quilos.");
      return;
    }
    if (!loadingDate) {
      AlertError("Informe a data de carregamento.");
      return;
    }
    if (freightReceivable.trim() === "" || freightPayable.trim() === "" || !Number.isFinite(receive) || receive < 0 || !Number.isFinite(pay) || pay < 0) {
      AlertError("Informe o frete a receber e o frete a pagar.");
      return;
    }
    if (!/^\d+$/.test(clientTermDays)) {
      AlertError("O cliente precisa ter um prazo em dias cadastrado. Exemplo: 30 dias.");
      return;
    }
    if (!Number.isInteger(driverTerm) || driverTerm < 0) {
      AlertError("O prazo do motorista precisa ser um número inteiro de dias, a partir de zero.");
      return;
    }

    try {
      await onSubmit({
        clientId,
        driverId,
        origin,
        destination,
        product,
        weightKg: weight,
        loadingDate,
        freightReceivable: receive,
        freightPayable: pay,
        clientTermDays: clientTerm,
        driverTermDays: driverTerm,
        divideShipping,
      });

      AlertSuccess(successMessage);
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível salvar a viagem.");
    }
  }

  async function saveClient(data: { corporateName: string; cnpj: string; timePeriod: string }) {
    const created = await createClient(data);
    onClientCreated(created);
    setClientId(created.id);
    setClientModal(false);
    AlertSuccess("Cliente cadastrado com sucesso.");
  }

  async function saveDriver(data: {
    name: string;
    cpf: string;
    password: string;
    driver: boolean;
    plateVehicle: string;
    keyPix: string;
  }) {
    const created = await createUser(data);
    if (created.driver) {
      const driver = {
        id: String(created._id),
        name: created.name,
        plateVehicle: created.plateVehicle,
      };
      onDriverCreated(driver);
      setDriverId(driver.id);
    }
    setDriverModal(false);
    AlertSuccess("Motorista cadastrado com sucesso.");
  }
  return {
    inputClass,
    clientId,
    clientModal,
    driverId,
    driverModal,
    origin,
    destination,
    product,
    weightKg,
    loadingDate,
    setClientId,
    setClientModal,
    setDriverId,
    setDriverModal,
    setOrigin,
    setDestination,
    setProduct,
    setWeightKg,
    setLoadingDate,
    setFreightReceivable: (value: string) => setFreightReceivable(formatMoneyInput(value)),
    setFreightPayable: (value: string) => setFreightPayable(formatMoneyInput(value)),
    setClientTermDays,
    setDriverTermDays,
    margin,
    saveTrip,
    saveClient,
    saveDriver,
    freightReceivable,
    freightPayable,
    driverTermDays,
    clientTermDays,
    divideShipping,
    setDivideShipping,
  };
}
