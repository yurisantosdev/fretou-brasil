"use client";

import Link from "next/link";
import { CaretLeftIcon, EyeIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Modal, Table, DatePicker, formatMoney, formatWeight, formatDate, Main, Tooltip } from "@fretou/components";
import { TripDetail } from "./components/tripDetail";
import { TripForm } from "./components/tripForm/index.ts";
import {
  codigoExibido,
} from "./lib/tripRules";
import { useTrips } from "./services/trips.services";
import { StatusTrip } from "./types/trips";
import { MoneyCard } from "./components/moneyCard";
import { StatusBadge } from "./components/statusBadge";

export function TripsPage() {
  const data = useTrips();
  if (!data) return null;
  const {
    clients,
    clientsError,
    registerClient,
    drivers,
    driversError,
    registerDriver,
    summary,
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
  } = data;

  return (
    <Main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 bg-white">
        <section>
          <Link href="/home" className="group flex w-fit items-center gap-1 text-sm font-bold tracking-[0.14em] text-brand">
            <CaretLeftIcon size={20} />
            <span className="uppercase group-hover:underline">
              Retornar
            </span>
          </Link>

          <div className="flex items-center justify-between w-full">
            <p className="mt-5 text-sm font-bold tracking-[0.14em] text-brand uppercase">
              Módulo - Viagens
            </p>

            <button
              type="button"
              className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
              onClick={() => {
                closeModal();
                setCreateModal(true);
              }}
            >
              Nova viagem
            </button>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-muted">
            Os títulos saem quando o CT-e e a foto do caminhão carregado existem. O saldo só pode ser programado depois da descarga e dos comprovantes. A viagem finaliza quando adiantamento e saldo são baixados.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MoneyCard
            label="A pagar hoje"
            value={formatMoney(summary.payToday)}
            hint={`Em aberto no total: ${formatMoney(summary.payOpen)}. Inclui vencidos.`}
          />
          <MoneyCard
            label="A receber"
            value={formatMoney(summary.receiveOpen)}
            hint={`Vence hoje ou está vencido: ${formatMoney(summary.receiveToday)}.`}
          />
          <MoneyCard
            label="Saldos travados"
            value={formatMoney(summary.lockedTotal)}
            hint={
              summary.locked.length === 1
                ? "1 lançamento com motivo na lista abaixo."
                : `${summary.locked.length} lançamentos com motivo na lista abaixo.`
            }
          />
          <MoneyCard
            label="Margem"
            value={formatMoney(summary.margin)}
            hint="Soma do frete do cliente menos o frete do motorista, vinda do acordo de cada viagem."
          />
        </section>

        <section className="flex flex-col gap-4">
          <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">Saldos travados</p>
          <Table
            rows={summary.locked}
            getRowId={(item) => item.id}
            columns={[
              { header: "Viagem", cell: (item) => item.label },
              { header: "Lado", cell: (item) => item.leg },
              { header: "Valor", cell: (item) => formatMoney(item.amount) },
              { header: "Por quê", cell: (item) => item.reason },
            ]}
          />
        </section>

        <Modal
          open={openModal}
          size="xl"
          onClose={closeModal}
          eyebrow={createModal ? "Operação" : tripOpen ? codigoExibido({ _id: tripOpen.id, codigo: tripOpen.codigo }) : undefined}
          title={createModal ? "Nova viagem" : tripOpen?.clienteNome ?? "Viagem"}
          description={
            createModal
              ? "Caminhão de terceiro, produto, origem, destino e os dois fretes."
              : tripOpen
                ? `${tripOpen.origin} → ${tripOpen.destination}`
                : undefined
          }
          headerAction={
            tripOpen && !createModal && tripOpen.status !== "FINALIZADA" && tripOpen.status !== "CANCELADA" ? (
              <Tooltip
                label="Editar viagem"
                side="bottom"
              >
                <button
                  type="button"
                  aria-label="Editar viagem"
                  className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-navy transition hover:bg-canvas"
                  onClick={() => setEditModal(true)}
                >
                  <PencilSimpleIcon size={18} />
                </button>
              </Tooltip>
            ) : undefined
          }
        >
          {createModal ? (
            <TripForm
              clients={clients}
              clientsError={clientsError}
              drivers={drivers}
              driversError={driversError}
              onCancel={closeModal}
              onSubmit={createTrip}
              onClientCreated={registerClient}
              onDriverCreated={registerDriver}
            />
          ) : null}
          {tripOpen ? (
            <TripDetail
              key={tripOpen.updatedAt}
              trip={tripOpen}
              onIssueCte={(numero, emitidoEm) => issueCte(tripOpen.id, numero, emitidoEm)}
              onAttachPhoto={(nome, enviadaEm, conteudo) => sendPhoto(tripOpen.id, nome, enviadaEm, conteudo)}
              onRegisterUnload={(dataHora) => unload(tripOpen.id, dataHora)}
              onRegisterOriginalDocuments={(dataHora) => documents(tripOpen.id, dataHora)}
              onSettle={(papel, dataHora) => settle(tripOpen.id, papel, dataHora)}
              onRegisterAdvance={(dataHora) => registerAdvance(tripOpen.id, dataHora)}
              onScheduleBalance={(dataHora) => schedule(tripOpen.id, dataHora)}
              onCancelTrip={() => cancel(tripOpen.id)}
            />
          ) : null}
        </Modal>

        {tripOpen ? (
          <Modal
            open={editModal}
            elevated
            size="xl"
            eyebrow={codigoExibido({ _id: tripOpen.id, codigo: tripOpen.codigo })}
            title="Editar viagem"
            description={`${tripOpen.origin} → ${tripOpen.destination}`}
            onClose={() => setEditModal(false)}
          >
            {editModal ? (
              <TripForm
                key={`${tripOpen.id}-${tripOpen.updatedAt}`}
                clients={clients}
                clientsError={clientsError}
                drivers={drivers}
                driversError={driversError}
                initial={draftTrip(tripOpen)}
                submitLabel="Salvar alterações"
                successMessage="Viagem atualizada."
                onCancel={() => setEditModal(false)}
                onSubmit={(draft) => editTrip(tripOpen.id, draft)}
                onClientCreated={registerClient}
                onDriverCreated={registerDriver}
              />
            ) : null}
          </Modal>
        ) : null}

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">Viagens</p>
            <label className="flex flex-col gap-2 text-sm text-navy">
              Busca
              <input
                type="text"
                value={search}
                placeholder="Viagem, produto ou rota"
                className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy outline-none transition placeholder:font-normal placeholder:text-placeholder focus:border-brand"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <label className="flex flex-col gap-2 text-sm text-navy">
                Estado
                <select
                  value={statusFilter}
                  className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy"
                  onChange={(event) => setStatusFilter(event.target.value as StatusTrip | "todas")}
                >
                  <option value="todas">Todas</option>
                  <option value="AGUARDANDO_CTE">Aguardando CT-e</option>
                  <option value="AGUARDANDO_FOTO">Aguardando foto</option>
                  <option value="CARREGADA">Carregada</option>
                  <option value="EM_TRANSITO">Em trânsito</option>
                  <option value="AGUARDANDO_COMPROVANTE">Aguardando comprovante</option>
                  <option value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-navy">
                Cliente
                <select
                  value={clientFilter}
                  className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy"
                  onChange={(event) => setClientFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.corporateName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-navy">
                Motorista
                <select
                  value={driverFilter}
                  className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy"
                  onChange={(event) => setDriverFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                      {driver.thirdParty ? " · Terceiro" : ""}
                      {driver.plateVehicle ? ` · ${driver.plateVehicle}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-navy">
                De
                <DatePicker size="sm" value={dateFrom} placeholder="Data inicial" onChange={setDateFrom} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-navy">
                Até
                <DatePicker size="sm" value={dateTo} placeholder="Data final" onChange={setDateTo} />
              </label>
            </div>
          </div>

          {loading ? <p className="text-sm text-muted">Carregando viagens...</p> : null}
          {error ? <p className="text-sm font-semibold text-brand">{error}</p> : null}
          <Table
            rows={visible}
            getRowId={(trip) => String(trip._id)}
            columns={[
              { header: "Viagem", cell: (trip) => codigoExibido(trip) },
              {
                header: "Rota",
                cell: (trip) => `${trip.origin} → ${trip.destination}`,
              },
              { header: "Produto", cell: (trip) => trip.product || "—" },
              { header: "Carga", cell: (trip) => formatWeight(trip.load) },
              { header: "Carregamento", cell: (trip) => formatDate(trip.dateLoad) },
              {
                header: "Estado",
                cell: (trip) => (
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge trip={trip} />
                    {trip.margem.negativa ? (
                      <span className="inline-flex rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                        Margem negativa · {formatMoney(trip.margem.margemReais)}
                      </span>
                    ) : null}
                  </span>
                ),
              },
              {
                header: "A receber",
                cell: (trip) => {
                  const receber = trip.titles.find((item) => item.nature === "receber");
                  return receber ? formatMoney(receber.value) : "—";
                },
              },
              {
                header: "Ação",
                cell: (trip) => (
                  <button
                    type="button"
                    aria-label={`Abrir ${codigoExibido(trip)}`}
                    className="grid size-9 cursor-pointer place-items-center rounded-xl border border-line bg-white text-navy transition hover:bg-canvas"
                    onClick={() => {
                      void openTrip(String(trip._id));
                    }}
                  >
                    <EyeIcon size={20} />
                  </button>
                ),
              },
            ]}
          />
        </section>
      </div>
    </Main>
  );
}
