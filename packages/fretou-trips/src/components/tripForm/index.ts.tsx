"use client";

import { ClientForm } from "@fretou/clients";
import { UserForm } from "@fretou/users";
import { PlusIcon } from "@phosphor-icons/react";
import { DatePicker, Tooltip, Modal, formatCnpj, formatMoney } from "@fretou/components";
import { TripFormProps } from "./types";
import { useTripForm } from "./services";

export function TripForm({
  clients,
  clientsError,
  drivers,
  driversError,
  onCancel,
  onSubmit,
  onClientCreated,
  onDriverCreated
}: TripFormProps) {
  const data = useTripForm({
    clients,
    clientsError,
    drivers,
    driversError,
    onCancel,
    onSubmit,
    onClientCreated,
    onDriverCreated
  });
  if (!data) return null;
  const {
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
    setFreightReceivable,
    setFreightPayable,
    setClientTermDays,
    setDriverTermDays,
    margin,
    error,
    salvar,
    salvarCliente,
    salvarMotorista,
    freightReceivable,
    freightPayable,
    driverTermDays,
    clientTermDays
  } = data;

  return (
    <>
      <form className="flex flex-col gap-5 px-5 py-5 sm:px-6" onSubmit={salvar} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 text-sm font-semibold text-navy">
            <span>Cliente</span>
            <div className="flex items-center gap-2">
              <select
                className={`${inputClass} min-w-0 flex-1`}
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                <option value="">Selecione o cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.corporateName}
                    {client.cnpj ? ` · ${formatCnpj(client.cnpj)}` : ""}
                  </option>
                ))}
              </select>

              <Tooltip label="Cadastrar cliente">
                <button
                  type="button"
                  aria-label="Cadastrar cliente"
                  className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand text-white transition hover:bg-brand-dark"
                  onClick={() => setClientModal(true)}
                >
                  <PlusIcon size={18} />
                </button>
              </Tooltip>
            </div>
            {clientsError ? (
              <span className="text-xs font-normal text-muted">{clientsError}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 text-sm font-semibold text-navy">
            <span>Motorista</span>
            <div className="flex items-center gap-2">
              <select
                className={`${inputClass} min-w-0 flex-1`}
                value={driverId}
                onChange={(event) => setDriverId(event.target.value)}
              >
                <option value="">Selecione o motorista</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                    {driver.plateVehicle ? ` · ${driver.plateVehicle}` : ""}
                  </option>
                ))}
              </select>

              <Tooltip label="Cadastrar motorista">
                <button
                  type="button"
                  aria-label="Cadastrar motorista"
                  className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand text-white transition hover:bg-brand-dark"
                  onClick={() => setDriverModal(true)}
                >
                  <PlusIcon size={18} />
                </button>
              </Tooltip>
            </div>
            {driversError ? (
              <span className="text-xs font-normal text-muted">{driversError}</span>
            ) : null}
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Origem
            <input
              className={inputClass}
              value={origin}
              placeholder="Cidade/UF"
              onChange={(event) => setOrigin(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Destino
            <input
              className={inputClass}
              value={destination}
              placeholder="Cidade/UF"
              onChange={(event) => setDestination(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Produto
            <input
              className={inputClass}
              value={product}
              placeholder="O que o caminhão carrega"
              onChange={(event) => setProduct(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Peso (kg)
            <input
              className={inputClass}
              inputMode="decimal"
              value={weightKg}
              placeholder="32000"
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Data de carregamento
            <DatePicker value={loadingDate} placeholder="Selecione a data" onChange={setLoadingDate} />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Frete a receber do cliente
            <input
              className={inputClass}
              inputMode="decimal"
              value={freightReceivable}
              placeholder="0,00"
              onChange={(event) => setFreightReceivable(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Frete a pagar ao motorista
            <input
              className={inputClass}
              inputMode="decimal"
              value={freightPayable}
              placeholder="0,00"
              onChange={(event) => setFreightPayable(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Prazo do cliente (dias após o CT-e)
            <input
              className={inputClass}
              inputMode="numeric"
              value={clientTermDays}
              onChange={(event) => setClientTermDays(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Prazo do motorista (dias após a foto)
            <input
              className={inputClass}
              inputMode="numeric"
              value={driverTermDays}
              onChange={(event) => setDriverTermDays(event.target.value)}
            />
            <span className="text-xs font-normal text-muted">Zero significa à vista na data da foto.</span>
          </label>
        </div>

        <p className="text-sm font-semibold text-navy">
          Margem prevista: {margin === null ? "—" : formatMoney(margin)}
        </p>

        {error ? <p className="text-sm font-semibold text-brand">{error}</p> : null}

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
            Salvar viagem
          </button>
        </div>
      </form>

      <Modal
        open={clientModal}
        elevated
        size="lg"
        eyebrow="Cadastro"
        title="Novo cliente"
        onClose={() => setClientModal(false)}
      >
        {clientModal ? (
          <ClientForm
            client={null}
            onCancel={() => setClientModal(false)}
            onSubmit={salvarCliente}
          />
        ) : null}
      </Modal>

      <Modal
        open={driverModal}
        elevated
        size="lg"
        eyebrow="Cadastro"
        title="Novo usuário"
        onClose={() => setDriverModal(false)}
      >
        {driverModal ? (
          <UserForm
            user={null}
            defaultDriver
            onCancel={() => setDriverModal(false)}
            onSubmit={salvarMotorista}
          />
        ) : null}
      </Modal>
    </>
  );
}
