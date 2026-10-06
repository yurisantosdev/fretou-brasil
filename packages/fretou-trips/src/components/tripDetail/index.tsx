"use client";

import {
  estadoHint,
  partesDoFrete,
  saldoAPagar,
  saldoAReceber,
  STATUS_LABEL,
} from "../../lib/tripRules";
import { DatePicker, formatDate, formatDateTime, formatMoney, formatWeight } from "@fretou/components";
import { TripDetailProps } from "./types";
import { useTripDetail } from "./services";
import { Field } from "./_components/field";

function formatAnexo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDateTime(value);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(",", "");
}

export function TripDetail({
  trip,
  onIssueCte,
  onAttachPhoto,
  onRegisterUnload,
  onRegisterOriginalDocuments,
  onSettle,
  onRegisterAdvance,
}: TripDetailProps) {
  const data = useTripDetail({
    trip,
    onIssueCte,
    onAttachPhoto,
    onRegisterUnload,
    onRegisterOriginalDocuments,
    onSettle,
    onRegisterAdvance,
  });
  if (!data) return null;
  const {
    descarga,
    comprovantes,
    margem,
    receber,
    pagar,
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
    setDocumentsAt
  } = data;
  const partes = partesDoFrete(trip.margem.freteMotorista, trip.divideShipping);

  return (
    <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
      <p className="rounded-xl bg-canvas px-4 py-3 text-sm text-navy">{estadoHint(trip)}</p>

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

      <section className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-3">
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
          label="Título a pagar"
          value={
            pagar ? `${formatMoney(pagar.value)} · vence ${formatDate(pagar.expirationDate)}` : "Ainda não gerado"
          }
        />
        <Field
          label="Prazos"
          value={`Cliente ${trip.acordoFrete.prazoClienteDias} dia(s) após o CT-e · Motorista ${trip.acordoFrete.prazoMotoristaDias} dia(s) após a foto`}
        />

        <div className="flex flex-col gap-4 border-t border-line pt-4 sm:col-span-3">
          <form className="flex flex-col gap-3" onSubmit={registrarAdiantamento}>
            <p className="text-sm font-bold text-navy">
              Adiantamento ao motorista · {formatMoney(partes.adiantamento)}
            </p>
            {trip.advancePaidAt ? (
              <p className="text-sm text-muted">Pago em {formatDateTime(trip.advancePaidAt)}.</p>
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
                  Registrar pagamento de {formatMoney(partes.adiantamento)}
                </button>
              </>
            )}
          </form>
          {receber?.liqiudateDate ? (
            <div>
              <p className="text-sm font-bold text-navy">
                Recebimento do cliente · {formatMoney(trip.margem.freteCliente)}
              </p>
              <p className="text-sm text-muted">Recebido em {formatDateTime(receber.liqiudateDate)}.</p>
            </div>
          ) : null}
          {pagar?.liqiudateDate ? (
            <div>
              <p className="text-sm font-bold text-navy">
                Pagamento do motorista · {formatMoney(pagar.value)}
              </p>
              <p className="text-sm text-muted">Pago em {formatDateTime(pagar.liqiudateDate)}.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form
          className="flex flex-col gap-3 rounded-2xl border border-line p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void liquidar("receber", receivedAt);
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
            void liquidar("pagar", paidAt);
          }}
        >
          <p className="text-sm font-bold text-navy">Pagamento do motorista</p>
          {!pagar ? (
            <p className="text-sm text-muted">O título a pagar ainda não foi gerado.</p>
          ) : pagar.liqiudateDate ? (
            <p className="text-sm text-muted">Pago em {formatDateTime(pagar.liqiudateDate)}.</p>
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
                Registrar pagamento
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

        <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
          <p className="text-sm font-bold text-navy">Foto do caminhão carregado</p>
          {foto?.content ? (
            <>
              <img
                src={foto.content}
                alt="Caminhão carregado"
                className="max-h-48 w-full rounded-xl object-cover"
              />
              <p className="text-sm text-muted">Anexada em {formatAnexo(foto.received)}.</p>
            </>
          ) : (
            <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
              Arquivo da foto
              {foto ? (
                <span className="text-xs font-normal text-muted">
                  {foto.name || "Arquivo"} foi registrado em {formatAnexo(foto.received)} sem a imagem. Envie de novo para exibir.
                </span>
              ) : null}
              <input
                className={inputClass}
                type="file"
                accept="image/*"
                onChange={(event) => void enviarFoto(event.target.files?.[0])}
              />
            </label>
          )}
        </div>

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
      </section>
    </div>
  );
}
