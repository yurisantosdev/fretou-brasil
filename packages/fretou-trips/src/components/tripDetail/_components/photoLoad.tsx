"use client";

import { AlertError } from "@fretou/components";
import {
  CameraIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ImageIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { PhotoLoadProps } from "../types";

function tamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoLoad({ photo, anexadaEm, onEnviar }: PhotoLoadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const anexada = Boolean(photo?.content);

  useEffect(() => {
    if (!arquivo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(arquivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  function limpar() {
    setArquivo(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function escolher(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      AlertError("Envie uma imagem do caminhão carregado.");
      return;
    }
    setArquivo(file);
  }

  async function enviar() {
    if (!arquivo || enviando) return;
    setEnviando(true);
    try {
      await onEnviar(arquivo);
      limpar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-brand">
            <CameraIcon size={18} weight="duotone" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy">Foto do caminhão carregado</p>
            <p className="text-xs text-muted">Comprovante visual do carregamento</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${anexada ? "bg-emerald-50 text-emerald-700" : "bg-canvas text-muted"
            }`}
        >
          {anexada ? "Anexada" : "Pendente"}
        </span>
      </div>

      {anexada && photo?.content ? (
        <figure className="overflow-hidden rounded-xl border border-line bg-canvas">
          <img src={photo.content} alt="Caminhão carregado" className="h-52 w-full object-cover" />
          <figcaption className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-muted">
            <CheckCircleIcon size={16} weight="fill" className="shrink-0 text-emerald-600" />
            Anexada em {anexadaEm(photo.received)}
          </figcaption>
        </figure>
      ) : (
        <>
          {photo ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              {photo.name || "Arquivo"} foi registrado em {anexadaEm(photo.received)} sem a imagem. Envie de novo para exibir.
            </p>
          ) : null}

          <input
            ref={inputRef}
            id={inputId}
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => escolher(event.target.files?.[0])}
          />

          {preview && arquivo ? (
            <div className="overflow-hidden rounded-xl border border-line bg-canvas">
              <img src={preview} alt="Pré-visualização da foto selecionada" className="h-44 w-full object-cover" />
              <div className="flex items-center gap-3 bg-white px-3 py-2.5">
                <ImageIcon className="shrink-0 text-brand" size={18} weight="duotone" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{arquivo.name}</p>
                  <p className="text-xs text-muted">{tamanho(arquivo.size)} · pronta para enviar</p>
                </div>
                <button
                  type="button"
                  onClick={limpar}
                  disabled={enviando}
                  aria-label="Remover foto selecionada"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition hover:bg-canvas hover:text-navy disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor={inputId}
              onDragEnter={(event) => {
                event.preventDefault();
                setArrastando(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setArrastando(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setArrastando(false);
                escolher(event.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition ${arrastando
                ? "border-brand bg-brand/5"
                : "border-line bg-canvas hover:border-brand/40 hover:bg-white"
                }`}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-[0_1px_2px_rgba(13,32,86,0.08)] ring-1 ring-line">
                <CloudArrowUpIcon size={22} weight="duotone" />
              </span>
              <span className="text-sm font-semibold text-navy">Arraste a foto ou clique para escolher</span>
              <span className="max-w-[16rem] text-xs leading-relaxed text-muted">
                JPEG ou PNG. A imagem é ajustada automaticamente antes do envio.
              </span>
            </label>
          )}

          <button
            type="button"
            disabled={!arquivo || enviando}
            onClick={() => void enviar()}
            className="h-10 cursor-pointer rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            {enviando ? "Enviando foto…" : "Anexar foto"}
          </button>
        </>
      )}
    </div>
  );
}
