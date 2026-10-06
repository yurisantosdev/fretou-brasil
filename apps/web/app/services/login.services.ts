"use client";

import { useRouter } from "next/navigation";
import { API_URL, clearSession, fetchProfile, readToken, saveToken } from "../lib/api";
import { FormEvent, useEffect, useState } from "react";

export function useLogin() {
  const inputClass =
    "h-13 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";

  function formatCpfInput(valor: string): string {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function mensagemErro(payload: unknown, status: number): string {
    if (
      payload &&
      typeof payload === "object" &&
      "erro" in payload &&
      typeof payload.erro === "string"
    ) {
      return payload.erro;
    }
    if (status === 401) return "CPF ou senha inválidos.";
    if (status === 503) return "Serviço indisponível no momento. Tente novamente.";
    return "Não foi possível entrar. Tente novamente.";
  }

  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = readToken();
    if (!token) return;

    let active = true;
    void fetchProfile(token).then((profile) => {
      if (!active) return;
      if (profile) {
        router.replace("/home");
        return;
      }
      clearSession();
    });

    return () => {
      active = false;
    };
  }, [router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const cpfDigitos = cpf.replace(/\D/g, "");
    if (cpfDigitos.length !== 11) {
      setErro("Informe um CPF com 11 dígitos.");
      return;
    }
    if (!password) {
      setErro("Informe a senha.");
      return;
    }

    setSending(true);
    try {
      const resposta = await fetch(`${API_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfDigitos, password: password }),
      });
      const payload: unknown = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        setErro(mensagemErro(payload, resposta.status));
        return;
      }

      const token =
        payload &&
          typeof payload === "object" &&
          "token" in payload &&
          typeof payload.token === "string"
          ? payload.token
          : "";

      if (!token) {
        setErro("Resposta de autenticação incompleta.");
        return;
      }

      saveToken(token);
      router.replace("/home");
    } catch {
      setErro("Sem conexão, verifique sua conexão com a internet.");
    } finally {
      setSending(false);
    }
  }

  return {
    login,
    inputClass,
    cpf,
    setCpf,
    formatCpfInput,
    showPassword,
    password,
    setPassword,
    setShowPassword,
    erro,
    sending
  };
}
