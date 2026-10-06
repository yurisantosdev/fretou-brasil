export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const TOKEN_KEY = "fretou_token";

export type Profile = {
  id: string;
  name: string;
  cpf?: string;
  driver: boolean;
  plateVehicle?: string;
  keyPix?: string;
  active: boolean;
};

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function fetchProfile(token: string): Promise<Profile | null> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;

  const data: unknown = await response.json().catch(() => null);
  if (!data || typeof data !== "object") return null;
  if (!("name" in data) || typeof data.name !== "string") return null;
  if (!("id" in data) || typeof data.id !== "string") return null;

  return {
    id: data.id,
    name: data.name,
    cpf: "cpf" in data && typeof data.cpf === "string" ? data.cpf : undefined,
    driver: "driver" in data && typeof data.driver === "boolean" ? data.driver : false,
    plateVehicle:
      "plateVehicle" in data && typeof data.plateVehicle === "string"
        ? data.plateVehicle
        : undefined,
    keyPix: "keyPix" in data && typeof data.keyPix === "string" ? data.keyPix : undefined,
    active: "active" in data && typeof data.active === "boolean" ? data.active : true,
  };
}
