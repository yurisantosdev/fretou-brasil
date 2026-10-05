import Link from "next/link";
import { CaretLeftIcon, EyeIcon } from "@phosphor-icons/react";
import { Modal } from "./components/modal";
import { Table } from "./components/table";
import { UserForm } from "./components/userForm";
import { useUsers } from "./services/users.services";

export function UsersPage() {
  const data = useUsers();
  if (!data) return null;
  const {
    users,
    setUserOpen,
    setCreateModal,
    openModal,
    closeModal,
    createModal,
    userOpen,
    saveUser,
    formatCpf,
    loading,
    error,
  } = data;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <section>
        <Link href="/home" className="group flex w-fit items-center gap-1 text-sm font-bold tracking-[0.14em] text-brand">
          <CaretLeftIcon size={20} />
          <span className="uppercase group-hover:underline">
            Retornar
          </span>
        </Link>

        <div className="flex items-center justify-between w-full">
          <p className="mt-5 text-sm font-bold tracking-[0.14em] text-brand uppercase">
            Módulo - Usuários
          </p>

          <button
            type="button"
            className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
            onClick={() => {
              setUserOpen(null);
              setCreateModal(true);
            }}
          >
            Novo usuário
          </button>
        </div>
      </section>

      <Modal
        open={openModal}
        size="lg"
        onClose={closeModal}
        eyebrow={createModal ? "Cadastro" : "Edição"}
        title={createModal ? "Novo usuário" : userOpen?.name ?? ""}
      >
        {openModal ? (
          <UserForm
            key={userOpen?._id ?? "novo"}
            user={userOpen}
            onCancel={closeModal}
            onSubmit={saveUser}
          />
        ) : null}
      </Modal>

      <div className="flex flex-col gap-4">
        {loading ? <p className="text-sm text-muted">Carregando usuários...</p> : null}
        {error ? <p className="text-sm font-semibold text-brand">{error}</p> : null}
        <Table
          rows={users}
          getRowId={(user) => user._id}
          columns={[
            { header: "Nome", cell: (user) => user.name },
            { header: "CPF", cell: (user) => formatCpf(user.cpf) },
            {
              header: "Motorista",
              cell: (user) => (
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${user.driver ? "bg-brand/10 text-brand" : "bg-canvas text-muted"
                    }`}
                >
                  {user.driver ? "Sim" : "Não"}
                </span>
              ),
            },
            { header: "Placa", cell: (user) => user.plateVehicle ?? "—" },
            {
              header: "Ação",
              cell: (user) => (
                <button
                  type="button"
                  aria-label={`Editar ${user.name}`}
                  className="grid size-9 cursor-pointer place-items-center rounded-xl border border-line bg-white text-navy transition hover:bg-canvas"
                  onClick={() => {
                    setCreateModal(false);
                    setUserOpen(user);
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
  );
}
