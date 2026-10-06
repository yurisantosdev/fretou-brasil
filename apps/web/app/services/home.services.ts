"use client";

import { createElement, useEffect, useState } from "react";
import { Profile, clearSession, fetchProfile, readToken } from "../lib/api";
import { useRouter } from "next/navigation";
import { CardModuleType } from "../types/cardModule";
import { UsersIcon, TruckIcon, UsersThreeIcon } from "@phosphor-icons/react";

export function useHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const modules: CardModuleType[] = [
    {
      title: "Clientes",
      description: "Gerencie os clientes do sistema",
      icon: createElement(UsersThreeIcon, { size: 25 }),
      color: "bg-brand",
      href: "/modules/clients"
    },
    {
      title: "Viagens",
      description: "Gerencie as viagens do sistema",
      icon: createElement(TruckIcon, { size: 25 }),
      color: "bg-brand",
      href: "/modules/trips"
    },
    {
      title: "Usuários",
      description: "Gerencie os usuários do sistema",
      icon: createElement(UsersIcon, { size: 25 }),
      color: "bg-brand",
      href: "/modules/users"
    },
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

  function updateProfile(next: Profile) {
    setProfile(next);
  }

  return {
    profile,
    logout,
    updateProfile,
    modules
  };
}
