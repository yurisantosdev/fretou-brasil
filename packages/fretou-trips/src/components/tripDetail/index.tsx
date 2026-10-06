"use client";

import {
  estadoHint,
  saldoAPagar,
  saldoAReceber,
  STATUS_LABEL,
} from "../../lib/tripRules";
import { DatePicker, formatDate, formatDateTime, formatMoney, formatWeight } from "@fretou/components";
import { TripDetailProps } from "./types";
import { useTripDetail } from "./services";
import { Field } from "./_components/field";
import { PhotoLoad } from "./_components/photoLoad";

export function TripDetail({
  trip,
  onIssueCte,
  onAttachPhoto,
  onRegisterUnload,
  onRegisterOriginalDocuments,
  onSettle,
  onRegisterAdvance,
  onScheduleBalance,
  onCancelTrip,
}: TripDetailProps) {
  const data = useTripDetail({
    trip,
    onIssueCte,
    onAttachPhoto,
    onRegisterUnload,
    onRegisterOriginalDocuments,
    onSettle,
    onRegisterAdvance,
    onScheduleBalance,
    onCancelTrip,
  });
  if (!data) return null;
  const {
    descarga,
    comprovantes,
    margem,
    receber,
    adiantamento,
    saldo,
    liquidar,
    receivedAt,
    setReceivedAt,
    paidAt,
    setPaidAt,
    foto,
    enviarFoto,
    registrarDescarga,
    registrarComprovantes,
    registrarAdiantamento,
    programarSaldo,
    cancelarViagem,
    scheduleAt,
    setScheduleAt,
    advanceAt,
    setAdvanceAt,
    cteNumber,
    setCteNumber,
    cteDate,
    setCteDate,
    emitirCte,
    inputClass,
    unloadedAt,
    documentsAt,
    setUnloadedAt,
    setDocumentsAt,
    formatAnexo,
    parties,
    cancelTrip
  } = data;

  return (
    <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
      <div className="flex justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-[90%]">
          <p className="rounded-xl bg-canvas px-4 py-3 text-sm text-navy">{estadoHint(trip)}</p>
        </div>
        {cancelTrip ? (
          <button
            type="button"
            className="h-10 shrink-0 cursor-pointer rounded-xl border border-red-500 bg-red-400 px-4 text-sm font-semibold text-red-900 transition hover:bg-red-400"
            onClick={() => void cancelarViagem()}
          >
            Cancelar viagem
          </button>
        ) : null}
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Field label="Cliente" value={trip.clienteNome} />
        <Field
          label="Motorista"
          value={trip.motoristaPlaca ? `${trip.motoristaNome} · ${trip.motoristaPlaca}` : trip.motoristaNome}
        />
        <Field label="Estado" value={STATUS_LABEL[trip.status]} />
        <Field label="Origem" value={trip.origin} />
        <Field label="Destino" value={trip.destination} />
        <Field label="Produto" value={trip.product || "—"} />
        <Field label="Carga" value={formatWeight(trip.load)} />
        <Field label="Carregamento" value={formatDate(trip.dateLoad)} />
        <Field label="Descarga" value={formatDateTime(descarga?.occurredAt ?? trip.dateDischarge)} />
        <Field label="Comprovantes originais" value={formatDateTime(comprovantes?.received)} />
      </section>

      {trip.status === "CANCELADA" ? null : <><section className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-3">
        <Field label="Frete a receber" value={formatMoney(saldoAReceber(trip))} />
        <Field label="Frete a pagar" value={formatMoney(saldoAPagar(trip))} />
        <Field label="Divisão do frete ao motorista" value={trip.divideShipping || "—"} />
        <Field label="Margem da viagem" value={margem} />
        <Field
          label="Título a receber"
          value={
            receber
              ? `${formatMoney(receber.value)} · vence ${formatDate(receber.expirationDate)}`
              : "Ainda não gerado"
          }
        />
        <Field
          label="Adiantamento"
          value={
            adiantamento
              ? `${formatMoney(adiantamento.value)}${adiantamento.liqiudateDate ? " · baixado" : ""}`
              : "Ainda não gerado"
          }
        />
        <Field
          label="Saldo"
          value={
            saldo
              ? `${formatMoney(saldo.value)}${saldo.bloqueio ? " · bloqueado" : saldo.liqiudateDate ? " · baixado" : " · liberado"}`
              : "Ainda não gerado"
          }
        />
        <Field
          label="Prazos"
          value={`Cliente ${trip.acordoFrete.prazoClienteDias} dia(s) após o CT-e · Motorista ${trip.acordoFrete.prazoMotoristaDias} dia(s) após a foto`}
        />

        <div className="flex flex-col gap-4 border-t border-line pt-4 sm:col-span-3">
          <form className="flex flex-col gap-3" onSubmit={registrarAdiantamento}>
            <p className="text-sm font-bold text-navy">
              Adiantamento ao motorista · {formatMoney(parties.adiantamento)}
            </p>
            {!adiantamento && !trip.advancePaidAt ? (
              <p className="text-sm text-muted">
                O adiantamento ainda não foi gerado. Ele sai quando CT-e e foto existirem.
              </p>
            ) : trip.advancePaidAt || adiantamento?.liqiudateDate ? (
              <p className="text-sm text-muted">
                Pago em {formatDateTime(trip.advancePaidAt ?? adiantamento?.liqiudateDate)}.
              </p>
            ) : (
              <>
                <label className="flex max-w-sm flex-col gap-2 text-sm font-semibold text-navy">
                  Data e hora
                  <DatePicker showTime value={advanceAt} onChange={setAdvanceAt} />
                </label>
                <button
                  type="submit"
                  className="h-10 w-fit cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Registrar pagamento de {formatMoney(parties.adiantamento)}
                </button>
              </>
            )}
          </form>
          <form className="flex flex-col gap-3" onSubmit={programarSaldo}>
            <p className="text-sm font-bold text-navy">
              Programação do saldo · {formatMoney(saldo?.value ?? parties.restante)}
            </p>
            {!saldo ? (
              <p className="text-sm text-muted">O saldo ainda não foi gerado.</p>
            ) : saldo.bloqueio ? (
              <p className="text-sm font-semibold text-brand" role="alert">
                {saldo.bloqueio}
              </p>
            ) : saldo.scheduledAt ? (
              <p className="text-sm text-muted">Programado para {formatDateTime(saldo.scheduledAt)}.</p>
            ) : (
              <>
                <label className="flex max-w-sm flex-col gap-2 text-sm font-semibold text-navy">
                  Data e hora
                  <DatePicker showTime value={scheduleAt} onChange={setScheduleAt} />
                </label>
                <button
                  type="submit"
                  className="h-10 w-fit cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Programar saldo
                </button>
              </>
            )}
          </form>
        </div>
      </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <form
            className="flex flex-col gap-3 rounded-2xl border border-line p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void liquidar("cliente", receivedAt);
            }}
          >
            <p className="text-sm font-bold text-navy">Recebimento do cliente</p>
            {!receber ? (
              <p className="text-sm text-muted">O título a receber ainda não foi gerado.</p>
            ) : receber.liqiudateDate ? (
              <p className="text-sm text-muted">Recebido em {formatDateTime(receber.liqiudateDate)}.</p>
            ) : (
              <>
                <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                  Data e hora
                  <DatePicker showTime value={receivedAt} onChange={setReceivedAt} />
                </label>
                <button
                  type="submit"
                  className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Registrar recebimento
                </button>
              </>
            )}
          </form>

          <form
            className="flex flex-col gap-3 rounded-2xl border border-line p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void liquidar("saldo", paidAt);
            }}
          >
            <p className="text-sm font-bold text-navy">Baixa do saldo</p>
            {!saldo ? (
              <p className="text-sm text-muted">O saldo ainda não foi gerado.</p>
            ) : saldo.bloqueio ? (
              <p className="text-sm font-semibold text-brand" role="alert">
                {saldo.bloqueio}
              </p>
            ) : saldo.liqiudateDate ? (
              <p className="text-sm text-muted">Pago em {formatDateTime(saldo.liqiudateDate)}.</p>
            ) : (
              <>
                <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                  Data e hora
                  <DatePicker showTime value={paidAt} onChange={setPaidAt} />
                </label>
                <button
                  type="submit"
                  className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Baixar saldo de {formatMoney(saldo.value)}
                </button>
              </>
            )}
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <form className="flex flex-col gap-3 rounded-2xl border border-line p-4" onSubmit={emitirCte}>
            <p className="text-sm font-bold text-navy">CT-e</p>
            {trip.cte ? (
              <p className="text-sm text-muted">
                Emitido em {formatDate(trip.cte.emitted)}, número {trip.cte.number}.
              </p>
            ) : (
              <>
                <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                  Número
                  <input
                    className={inputClass}
                    value={cteNumber}
                    placeholder="123456"
                    onChange={(event) => setCteNumber(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                  Data de emissão
                  <DatePicker value={cteDate.slice(0, 10)} onChange={setCteDate} />
                </label>
                <button
                  type="submit"
                  className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Registrar CT-e
                </button>
              </>
            )}
          </form>

          <PhotoLoad photo={foto} anexadaEm={formatAnexo} onEnviar={enviarFoto} />

          <form className="flex flex-col gap-3 rounded-2xl border border-line p-4" onSubmit={registrarDescarga}>
            <p className="text-sm font-bold text-navy">Descarga</p>
            {descarga ? (
              <p className="text-sm text-muted">Registrada em {formatDateTime(descarga.occurredAt)}.</p>
            ) : (
              <>
                <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                  Data e hora
                  <DatePicker showTime min={`${trip.dateLoad}T00:00`} value={unloadedAt} onChange={setUnloadedAt} />
                </label>
                <button
                  type="submit"
                  className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Registrar descarga
                </button>
              </>
            )}
          </form>

          <form className="flex flex-col gap-3 rounded-2xl border border-line p-4" onSubmit={registrarComprovantes}>
            <p className="text-sm font-bold text-navy">Comprovantes originais</p>
            {comprovantes ? (
              <p className="text-sm text-muted">Chegaram em {formatDateTime(comprovantes.received)}.</p>
            ) : (
              <>
                <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                  Data e hora da chegada
                  <DatePicker showTime value={documentsAt} onChange={setDocumentsAt} />
                </label>
                <button
                  type="submit"
                  className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Registrar chegada
                </button>
              </>
            )}
          </form>
        </section></>}
    </div>
  );
}
