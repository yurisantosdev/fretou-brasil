"use client";

import { AppShell } from "../../components/appShell";
import { useHome } from "../../services/home.services";
import { VehiclesPage } from "@fretou/vehicles"

export default function Vehicles() {
  const { profile, logout, updateProfile } = useHome();

  return (
    <AppShell profile={profile} onLogout={logout} onProfileUpdated={updateProfile}>
      <VehiclesPage />
    </AppShell>
  );
}
