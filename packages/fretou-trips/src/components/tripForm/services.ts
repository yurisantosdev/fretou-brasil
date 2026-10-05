"use client";

import { FormEvent, useState } from "react";
import { AlertError, AlertSuccess, formatMoneyInput, parseMoney } from "@fretou/components";
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
  onDriverCreated
}: TripFormProps) {
  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";

  const [divideShipping, setDivideShipping] = useState<DivideShipping>("50%");
  const [clientId, setClientId] = useState("");
  const [clientModal, setClientModal] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [driverModal, setDriverModal] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [product, setProduct] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [loadingDate, setLoadingDate] = useState("");
  const [freightReceivable, setFreightReceivable] = useState("");
  const [freightPayable, setFreightPayable] = useState("");
  const [clientTermDays, setClientTermDays] = useState("30");
  const [driverTermDays, setDriverTermDays] = useState("0");

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
    if (!Number.isInteger(clientTerm) || clientTerm < 0 || !Number.isInteger(driverTerm) || driverTerm < 0) {
      AlertError("Os prazos precisam ser dias inteiros, a partir de zero.");
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

      AlertSuccess("Viagem cadastrada com sucesso.");
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
    setDivideShipping
  };
}
