"use client";

import { EyeIcon, EyeSlashIcon, UserIcon } from "@phosphor-icons/react";
import { Modal } from "@fretou/components";
import { ProfileProps } from "./types";
import { useProfile } from "./services";

export function Profile({
  account,
  onLogout,
  onUpdated,
}: ProfileProps) {
  const data = useProfile({
    account,
    onLogout,
    onUpdated,
  });
  if (!data) return null;
  const {
    inputClass,
    openProfile,
    name,
    setName,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    plateVehicle,
    setPlateVehicle,
    keyPix,
    setKeyPix,
    erro,
    saving,
    open,
    setOpen,
    nameId,
    passwordId,
    pixId,
    plateId,
    saveUserProfile,
  } = data;

  return (
    <>
      <button
        type="button"
        aria-label="Meu perfil"
        className="grid size-10 cursor-pointer place-items-center rounded-xl border border-line bg-white text-navy transition hover:bg-canvas"
        onClick={openProfile}
      >
        <UserIcon size={20} />
      </button>

      <Modal
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        eyebrow="Conta"
        title="Meu perfil"
        description={
          account.thirdParty
            ? "Atualize seus dados de acesso e a placa do veículo."
            : "Atualize seus dados de acesso."
        }
      >
        <form className="flex flex-col gap-6 px-5 py-5 sm:px-6" onSubmit={saveUserProfile} noValidate>
          <label htmlFor={nameId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
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

          <label htmlFor={passwordId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
            Senha
            <div className="relative">
              <input
                id={passwordId}
                className={`${inputClass} pr-11`}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                placeholder="Nova senha"
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 cursor-pointer place-items-center text-muted transition hover:text-navy"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            <span className="text-xs font-normal text-muted">
              Deixe em branco para manter a senha atual. Ao salvar uma nova senha, você sai do sistema.
            </span>
          </label>

          {account.thirdParty ? (
            <label htmlFor={plateId} className="flex flex-col gap-2 text-sm font-semibold text-navy">
              Placa do veículo
              <input
                id={plateId}
                className={inputClass}
                value={plateVehicle}
                autoComplete="off"
                placeholder="ABC1D23"
                onChange={(event) => setPlateVehicle(event.target.value.toUpperCase())}
              />
            </label>
          ) : null}

          {account.driver ? (
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
          ) : null}

          {erro ? (
            <p className="text-sm font-semibold text-brand" role="alert">
              {erro}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              className="h-10 cursor-pointer rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy transition hover:bg-canvas"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70"
              disabled={saving}
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
