"use client";

import { AppShell } from "../../components/appShell";
import { useHome } from "../../services/home.services";
import { UsersPage } from "@fretou/users"

export default function Users() {
  const { profile, logout, updateProfile } = useHome();

  return (
    <AppShell profile={profile} onLogout={logout} onProfileUpdated={updateProfile}>
      <UsersPage />
    </AppShell>
  );
}
