"use client";

import { AppShell } from "../../components/appShell";
import { useHome } from "../../services/home.services";
import { TripsPage } from "@fretou/trips"

export default function Trips() {
  const { profile, logout } = useHome();

  return (
    <AppShell profile={profile} onLogout={logout}>
      <TripsPage />
    </AppShell>
  );
}
