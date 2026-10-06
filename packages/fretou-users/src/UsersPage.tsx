import Link from "next/link";
import { CaretLeftIcon, EyeIcon } from "@phosphor-icons/react";
import { Modal, Table } from "@fretou/components";
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
    search,
    setSearch,
    kindFilter,
    setKindFilter,
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
                Módulo - Usuários
              </p>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Cadastre quem acessa o sistema, indique motoristas e terceiros, e desative o login quando o acesso não for mais necessário.
              </p>
            </div>

            <button
              type="button"
              className="h-10 shrink-0 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
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
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-navy">
              Busca
              <input
                type="text"
                value={search}
                placeholder="Nome ou CPF"
                className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy outline-none transition placeholder:font-normal placeholder:text-placeholder focus:border-brand"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset className="flex flex-col gap-2 rounded-xl border border-line bg-canvas/60 px-4 py-3">
                <legend className="px-1 text-sm text-navy">Tipo</legend>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {(
                    [
                      ["todos", "Todos"],
                      ["empresa", "Motoristas da empresa"],
                      ["terceiros", "Terceiros"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm font-semibold text-navy cursor-pointer">
                      <input
                        type="radio"
                        name="tipo-usuario"
                        className="size-4 accent-brand"
                        checked={kindFilter === value}
                        onChange={() => setKindFilter(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-2 rounded-xl border border-line bg-canvas/60 px-4 py-3">
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
                        name="status-usuario"
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
          </div>
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
              {
                header: "Terceiro",
                cell: (user) => (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${user.thirdParty ? "bg-brand/10 text-brand" : "bg-canvas text-muted"
                      }`}
                  >
                    {user.thirdParty ? "Sim" : "Não"}
                  </span>
                ),
              },
              {
                header: "Status",
                cell: (user) => {
                  const ativo = user.active !== false;
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
    </>
  );
}
