import Link from "next/link";
import { CaretLeftIcon, EyeIcon } from "@phosphor-icons/react";
import { Modal, Table, formatCnpj } from "@fretou/components";
import { ClientForm } from "./components/clientForm";
import { useClients } from "./services/clients.services";

export function ClientsPage() {
  const data = useClients();
  if (!data) return null;
  const {
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
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
  } = data;

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 bg-white">
        <section>
          <Link href="/home" className="group flex w-fit items-center gap-1 text-sm font-bold tracking-[0.14em] text-brand">
            <CaretLeftIcon size={20} />
            <span className="uppercase group-hover:underline">
              Retornar
            </span>
          </Link>

          <div className="mt-5 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-brand uppercase">
                Módulo - Clientes
              </p>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Cadastre os clientes da operação, com CNPJ e prazo de pagamento, e desative quando não forem mais usados nas viagens.
              </p>
            </div>

            <button
              type="button"
              className="h-10 shrink-0 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
              onClick={() => {
                setClientOpen(null);
                setCreateModal(true);
              }}
            >
              Novo cliente
            </button>
          </div>
        </section>

        <Modal
          open={openModal}
          size="lg"
          onClose={closeModal}
          eyebrow={createModal ? "Cadastro" : "Edição"}
          title={createModal ? "Novo cliente" : clientOpen?.corporateName ?? ""}
        >
          {openModal ? (
            <ClientForm
              key={clientOpen?._id ?? "novo"}
              client={clientOpen}
              onCancel={closeModal}
              onSubmit={saveClient}
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
                placeholder="Razão social, CNPJ ou período"
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
                  <label key={value} className="flex items-center gap-2 text-sm font-semibold text-navy cursor-pointer">
                    <input
                      type="radio"
                      name="status-cliente"
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
          {loading ? <p className="text-sm text-muted">Carregando clientes...</p> : null}
          {error ? <p className="text-sm font-semibold text-brand">{error}</p> : null}
          <Table
            rows={clients}
            getRowId={(client) => client._id}
            columns={[
              { header: "Razão social", cell: (client) => client.corporateName },
              { header: "CNPJ", cell: (client) => formatCnpj(client.cnpj) },
              { header: "Período", cell: (client) => client.timePeriod || "—" },
              {
                header: "Status",
                cell: (client) => {
                  const ativo = client.active !== false;
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
                cell: (client) => (
                  <button
                    type="button"
                    aria-label={`Editar ${client.corporateName}`}
                    className="grid size-9 cursor-pointer place-items-center rounded-xl border border-line bg-white text-navy transition hover:bg-canvas"
                    onClick={() => {
                      setCreateModal(false);
                      setClientOpen(client);
                    }}
                  >
                    <EyeIcon size={20} />
                  </button>
                ),
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
