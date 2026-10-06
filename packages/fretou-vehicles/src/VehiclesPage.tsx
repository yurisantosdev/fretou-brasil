"use client";

import Link from "next/link";
import { CaretLeftIcon, EyeIcon } from "@phosphor-icons/react";
import { Main, Modal, Table, formatLoad } from "@fretou/components";
import { VehicleForm } from "./components/vehicleForm";
import { useVehicles } from "./services/vehicles.services";

export function VehiclesPage() {
  const data = useVehicles();
  if (!data) return null;
  const {
    vehicles,
    setVehicleOpen,
    setCreateModal,
    openModal,
    closeModal,
    createModal,
    vehicleOpen,
    saveVehicle,
    toggleActive,
    togglingId,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
  } = data;

  return (
    <Main>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 bg-white px-6 py-10">
        <section>
          <Link href="/home" className="group flex w-fit items-center gap-1 text-sm font-bold tracking-[0.14em] text-brand">
            <CaretLeftIcon size={20} />
            <span className="uppercase group-hover:underline">Retornar</span>
          </Link>

          <div className="mt-5 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">Módulo - Veículos</p>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Cadastre os veículos da empresa, com placa, tipo, ano e carga em kg, e desative quando não forem mais usados nas viagens.
              </p>
            </div>

            <button
              type="button"
              className="h-10 shrink-0 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
              onClick={() => {
                setVehicleOpen(null);
                setCreateModal(true);
              }}
            >
              Novo veículo
            </button>
          </div>
        </section>

        <Modal
          open={openModal}
          size="lg"
          onClose={closeModal}
          eyebrow={createModal ? "Cadastro" : "Edição"}
          title={createModal ? "Novo veículo" : vehicleOpen?.plate ?? ""}
        >
          {openModal ? (
            <VehicleForm
              key={vehicleOpen?._id ?? "novo"}
              vehicle={vehicleOpen}
              onCancel={closeModal}
              onSubmit={saveVehicle}
            />
          ) : null}
        </Modal>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-navy">
              Busca
              <input
                type="text"
                value={search}
                placeholder="Placa, tipo, ano ou carga"
                className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy outline-none transition placeholder:font-normal placeholder:text-placeholder focus:border-brand"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <fieldset className="flex flex-col gap-2 rounded-xl border border-line bg-canvas/60 px-4 py-3 sm:max-w-md">
              <legend className="px-1 text-sm text-navy">Status</legend>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {(
                  [
                    ["todos", "Todos"],
                    ["ativos", "Ativos"],
                    ["inativos", "Desativados"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <input
                      type="radio"
                      name="status-veiculo"
                      className="size-4 accent-brand"
                      checked={statusFilter === value}
                      onChange={() => setStatusFilter(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {loading ? <p className="text-sm text-muted">Carregando veículos...</p> : null}
          {error ? <p className="text-sm font-semibold text-brand">{error}</p> : null}
          <Table
            rows={vehicles}
            getRowId={(vehicle) => vehicle._id}
            columns={[
              { header: "Placa", cell: (vehicle) => vehicle.plate },
              { header: "Tipo", cell: (vehicle) => vehicle.model },
              { header: "Ano", cell: (vehicle) => vehicle.year || "—" },
              { header: "Carga total", cell: (vehicle) => formatLoad(vehicle.totalLoad) },
              {
                header: "Status",
                cell: (vehicle) => {
                  const ativo = vehicle.active !== false;
                  return (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${ativo ? "bg-emerald-100 text-emerald-800" : "bg-canvas text-muted"
                        }`}
                    >
                      {ativo ? "Ativo" : "Desativado"}
                    </span>
                  );
                },
              },
              {
                header: "Ação",
                cell: (vehicle) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Editar ${vehicle.plate}`}
                      className="grid size-9 cursor-pointer place-items-center rounded-xl border border-line bg-white text-navy transition hover:bg-canvas"
                      onClick={() => {
                        setCreateModal(false);
                        setVehicleOpen(vehicle);
                      }}
                    >
                      <EyeIcon size={20} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Main>
  );
}
