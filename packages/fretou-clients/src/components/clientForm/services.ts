"use client";

import { FormEvent, useState } from "react";
import { ClientFormProps } from "./types";
import { formatCnpj } from "@fretou/components";

export function useClientForm({
  client,
  onCancel,
  onSubmit
}: ClientFormProps) {
  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";

  const [corporateName, setCorporateName] = useState(client?.corporateName ?? "");
  const [cnpj, setCnpj] = useState(formatCnpj(client?.cnpj ?? ""));
  const [timePeriod, setTimePeriod] = useState(client?.timePeriod ?? "");
  const [erro, setErro] = useState("");

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!corporateName.trim()) {
      setErro("Informe a razão social.");
      return;
    }

    if (cnpj.replace(/\D/g, "").length !== 14) {
      setErro("Informe um CNPJ com 14 dígitos.");
      return;
    }

    if (!timePeriod.trim()) {
      setErro("Informe o período.");
      return;
    }

    setErro("");
    try {
      await onSubmit({ corporateName, cnpj, timePeriod });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar o cliente.");
    }
  }

  return {
    saveClient,
    inputClass,
    corporateName,
    setCorporateName,
    cnpj,
    setCnpj,
    timePeriod,
    setTimePeriod,
    erro
  };
}
