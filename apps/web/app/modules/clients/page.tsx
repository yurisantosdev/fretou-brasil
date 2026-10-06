"use client";

import { AccessDenied } from "../../components/AccessDenied";
import { AppShell } from "../../components/appShell";
import { useHome } from "../../services/home.services";
import { ClientsPage } from "@fretou/clients"

export default function Clients() {
  const { profile, logout, updateProfile } = useHome();

  if (profile?.driver) {
    return (
      <AppShell profile={profile} onLogout={logout} onProfileUpdated={updateProfile}>
        <AccessDenied />
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile} onLogout={logout} onProfileUpdated={updateProfile}>
      <ClientsPage />
    </AppShell>
  );
}
