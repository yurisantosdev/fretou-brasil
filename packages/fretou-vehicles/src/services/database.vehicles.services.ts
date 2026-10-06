import { Vehicle, VehicleFormData } from "../types/vehicles";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const VEHICLES_URL = `${API_URL}/api/vehicles`;

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("fretou_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function messageError(response: Response, fallback: string): Promise<string> {
  if (response.status === 409) return "Já existe um veículo com esta placa.";
  try {
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "erro" in data &&
      typeof (data as { erro?: unknown }).erro === "string"
    ) {
      return (data as { erro: string }).erro;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export async function listVehicles(signal: AbortSignal, driverId?: string): Promise<Vehicle[]> {
  const url = driverId ? `${VEHICLES_URL}?driver=${encodeURIComponent(driverId)}` : VEHICLES_URL;
  const response = await fetch(url, {
    signal,
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await messageError(response, "Não foi possível carregar os veículos"));
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de veículos");
  }

  return data as Vehicle[];
}

export async function createVehicle(
  signal: AbortSignal,
  vehicle: VehicleFormData
): Promise<Vehicle> {
  const response = await fetch(VEHICLES_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error(await messageError(response, "Não foi possível salvar o veículo"));
  }

  return (await response.json()) as Vehicle;
}

export async function updateVehicle(
  id: string,
  signal: AbortSignal,
  vehicle: VehicleFormData
): Promise<Vehicle> {
  const response = await fetch(`${VEHICLES_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error(await messageError(response, "Não foi possível atualizar o veículo"));
  }

  return (await response.json()) as Vehicle;
}
