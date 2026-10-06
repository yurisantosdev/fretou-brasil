"use client";

import { UserFormProps } from "./types";
import { useUserForm } from "./services";
import { DriverVehicles } from "./_components/driverVehicles";
import { formatCpf } from "@fretou/components";

export function UserForm({
  user,
  onCancel,
  onSubmit,
  defaultDriver = false
}: UserFormProps) {
  const data = useUserForm({
    user,
    onCancel,
    onSubmit,
    defaultDriver
  });
  if (!data) return null;
  const {
    saveUser,
    inputClass,
    name,
    setName,
    cpf,
    setCpf,
    password,
    setPassword,
    driver,
    setDriver,
    thirdParty,
    setThirdParty,
    vehicles,
    setVehicles,
    keyPix,
    setKeyPix,
    active,
    setActive,
    erro,
    nameId,
    cpfId,
    passwordId,
    pixId,
    driverId,
    thirdPartyId,
    activeId,
  } = data;

  return (
    <form className="flex flex-col gap-6 px-5 py-5 sm:px-6" onSubmit={saveUser} noValidate>
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Identificação</h3>
          <p className="mt-1 text-sm text-muted">Dados usados para reconhecer e autenticar o usuário.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor={nameId} className="flex flex-col gap-2 text-sm font-semibold text-navy sm:col-span-2">
            Nome
            <input
              id={nameId}
              className={inputClass}
              value={name}
              autoComplete="name"
              placeholder="Nome completo"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label htmlFor={cpfId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
            CPF
            <input
              id={cpfId}
              className={inputClass}
              inputMode="numeric"
              autoComplete="off"
              value={cpf}
              placeholder="000.000.000-00"
              onChange={(event) => setCpf(formatCpf(event.target.value))}
            />
          </label>

          <label htmlFor={passwordId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Senha
            <input
              id={passwordId}
              className={inputClass}
              type="password"
              autoComplete="new-password"
              value={password}
              placeholder={user ? "Nova senha" : "Digite a senha"}
              onChange={(event) => setPassword(event.target.value)}
            />
            {user ? (
              <span className="text-xs font-normal text-muted">Deixe em branco para manter a senha atual.</span>
            ) : null}
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h3 className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Pagamento</h3>
          <p className="mt-1 text-sm text-muted">Chave usada quando houver repasse por Pix.</p>
        </div>

        <label htmlFor={pixId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
          <span className="flex items-baseline gap-2">
            Chave Pix
            <span className="text-xs font-normal text-muted">Opcional</span>
          </span>
          <input
            id={pixId}
            className={inputClass}
            value={keyPix}
            autoComplete="off"
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            onChange={(event) => setKeyPix(event.target.value)}
          />
        </label>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-canvas/70 p-4">
        <label htmlFor={driverId} className="flex cursor-pointer items-start gap-3">
          <input
            id={driverId}
            type="checkbox"
            className="mt-0.5 size-4 accent-brand"
            checked={driver}
            onChange={(event) => {
              setDriver(event.target.checked);
              if (!event.target.checked) {
                setThirdParty(false);
                setVehicles([]);
              }
            }}
          />
          <span>
            <span className="block text-sm font-semibold text-navy">Motorista</span>
            <span className="mt-1 block text-sm font-normal text-muted">
              Permite vincular este usuário às viagens.
            </span>
          </span>
        </label>

        {driver ? (
          <label htmlFor={thirdPartyId} className="flex cursor-pointer items-start gap-3 sm:max-w-md">
            <input
              id={thirdPartyId}
              type="checkbox"
              className="mt-0.5 size-4 accent-brand"
              checked={thirdParty}
              onChange={(event) => {
                setThirdParty(event.target.checked);
                if (!event.target.checked) setVehicles([]);
              }}
            />
            <span>
              <span className="block text-sm font-semibold text-navy">Motorista terceiro</span>
              <span className="mt-1 block text-sm font-normal text-muted">
                Usa veículo próprio. Cadastre um ou mais veículos abaixo.
              </span>
            </span>
          </label>
        ) : null}

        {driver && thirdParty ? (
          <DriverVehicles vehicles={vehicles} onChange={setVehicles} inputClass={inputClass} />
        ) : null}
      </section>

      <section
        className={`flex flex-col gap-1 rounded-2xl border p-4 ${active ? "border-line bg-white" : "border-amber-200 bg-amber-50"
          }`}
      >
        <label htmlFor={activeId} className="flex cursor-pointer items-start gap-3">
          <input
            id={activeId}
            type="checkbox"
            className="mt-0.5 size-4 accent-brand"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-navy">
              {active ? "Usuário ativo" : "Usuário desativado"}
            </span>
            <span className="mt-1 block text-sm font-normal text-muted">
              {active
                ? "O acesso ao sistema está liberado."
                : "Sem acesso. O login fica bloqueado até reativar."}
            </span>
          </span>
        </label>
      </section>

      {erro ? (
        <p className="text-sm font-semibold text-brand" role="alert">
          {erro}
        </p>
      ) : null}

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
          Salvar
        </button>
      </div>
    </form>
  );
}
