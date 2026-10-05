import Link from "next/link";
import { CaretLeftIcon, EyeIcon } from "@phosphor-icons/react";
import { Main, Modal, Table, formatCnpj } from "@fretou/components";
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
              Módulo - Clientes
            </p>

            <button
              type="button"
              className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
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
          {loading ? <p className="text-sm text-muted">Carregando clientes...</p> : null}
          {error ? <p className="text-sm font-semibold text-brand">{error}</p> : null}
          <Table
            rows={clients}
            getRowId={(client) => client._id}
            columns={[
              { header: "Razão social", cell: (client) => client.corporateName },
              { header: "CNPJ", cell: (client) => formatCnpj(client.cnpj) },
              { header: "Período", cell: (client) => client.timePeriod ?? "—" },
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
    </Main>
  );
}
