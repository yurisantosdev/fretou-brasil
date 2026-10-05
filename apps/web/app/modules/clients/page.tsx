"use client";

import { AppShell } from "../../components/appShell";
import { useHome } from "../../services/home.services";
import { ClientsPage } from "@fretou/clients"

export default function Clients() {
  const { profile, logout } = useHome();

  return (
    <AppShell profile={profile} onLogout={logout}>
      <ClientsPage />
    </AppShell>
  );
}
