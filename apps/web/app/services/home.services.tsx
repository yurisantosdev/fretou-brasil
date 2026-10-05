"use client";

import { useEffect, useState } from "react";
import { Profile, clearSession, fetchProfile, readToken } from "../lib/api";
import { useRouter } from "next/navigation";
import { CardModuleType } from "../types/cardModule";
import { UsersIcon } from "@phosphor-icons/react";

export function useHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const modules: CardModuleType[] = [
    {
      title: "Usuários",
      description: "Gerencie os usuários do sistema",
      icon: (
        <UsersIcon size={25} />
      ),
      color: "bg-brand",
      href: "/modules/users"
    }
  ]

  useEffect(() => {
    let ativo = true;

    async function validarSessao() {
      const token = readToken();
      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const data = await fetchProfile(token);
        if (!ativo) return;
        if (!data) {
          clearSession();
          router.replace("/");
          return;
        }
        setProfile(data);
      } catch {
        if (!ativo) return;
        clearSession();
        router.replace("/");
      }
    }

    void validarSessao();
    return () => {
      ativo = false;
    };
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/");
  }

  return {
    profile,
    logout,
    modules
  };
}
