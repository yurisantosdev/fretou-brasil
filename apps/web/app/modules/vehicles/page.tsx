"use client";

import { AccessDenied } from "../../components/AccessDenied";
import { AppShell } from "../../components/appShell";
import { useHome } from "../../services/home.services";
import { VehiclesPage } from "@fretou/vehicles"

export default function Vehicles() {
  const { profile, logout, updateProfile } = useHome();

  if (profile?.driver && !profile?.thirdParty) {
    return (
      <AppShell profile={profile} onLogout={logout} onProfileUpdated={updateProfile}>
        <AccessDenied />
      </AppShell>
    );
  }

  return (
    <AppShell profile={profile} onLogout={logout} onProfileUpdated={updateProfile}>
      <VehiclesPage driverId={profile?.driver && profile.thirdParty ? profile.id : undefined} />
    </AppShell>
  );
}
