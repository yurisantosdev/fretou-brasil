import { Client } from "@fretou/clients";
import { PapelTitulo, StatusTrip, TripClient, TripDetail, TripDriver, TripDraft, TripListItem, TripsResponse, CriarViagemInput, EventoInput, FotoInput, CteInput, TituloInput, ProgramacaoInput } from "../types/trips";
import { User } from "@fretou/users";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TRIPS_URL = `${API_URL}/api/trips`;
const USERS_URL = `${API_URL}/api/users`;
const CLIENTS_URL = `${API_URL}/api/clients`;

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("fretou_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function lerErro(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "erro" in data && typeof data.erro === "string") {
      return data.erro;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export async function listDrivers(signal: AbortSignal): Promise<TripDriver[]> {
  const response = await fetch(USERS_URL, {
    signal,
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response, "Não foi possível carregar os motoristas"));
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de usuários");
  }

  return (data as User[])
    .filter((user) => user.driver && user.active !== false)
    .map((user) => ({
      id: String(user._id),
      name: user.name,
      plateVehicle: user.plateVehicle,
    }));
}

export async function createUser(input: {
  name: string;
  cpf: string;
  password: string;
  driver: boolean;
  plateVehicle: string;
  keyPix: string;
  active?: boolean;
}): Promise<User> {
  const response = await fetch(USERS_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      name: input.name.trim(),
      cpf: input.cpf.replace(/\D/g, ""),
      password: input.password,
      driver: input.driver,
      plateVehicle: input.driver ? input.plateVehicle.trim().toUpperCase() : "",
      keyPix: input.keyPix.trim(),
      active: input.active !== false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 409
        ? "Já existe um usuário com este CPF."
        : await lerErro(response, "Não foi possível salvar o usuário")
    );
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("_id" in data)) {
    throw new Error("Resposta inválida ao criar o usuário");
  }

  return data as User;
}

export async function listClients(signal: AbortSignal): Promise<TripClient[]> {
  const response = await fetch(CLIENTS_URL, {
    signal,
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response, "Não foi possível carregar os clientes"));
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de clientes");
  }

  return (data as Client[])
    .filter((client) => client.active !== false)
    .map((client) => ({
    id: String(client._id),
    corporateName: client.corporateName,
    cnpj: client.cnpj,
    timePeriod: client.timePeriod,
  }));
}

export async function createClient(input: {
  corporateName: string;
  cnpj: string;
  timePeriod: string;
  active?: boolean;
}): Promise<TripClient> {
  const response = await fetch(CLIENTS_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      corporateName: input.corporateName.trim(),
      cnpj: input.cnpj.replace(/\D/g, ""),
      timePeriod: input.timePeriod.trim(),
      active: input.active !== false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 409
        ? "Já existe um cliente com este CNPJ."
        : await lerErro(response, "Não foi possível salvar o cliente")
    );
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("_id" in data)) {
    throw new Error("Resposta inválida ao criar o cliente");
  }

  const client = data as Client;
  return {
    id: String(client._id),
    corporateName: client.corporateName,
    cnpj: client.cnpj,
    timePeriod: client.timePeriod,
  };
}

export type TripQuery = {
  status?: StatusTrip | "todas";
  clienteId?: string;
  motoristaId?: string;
  dateFrom?: string;
  dateTo?: string;
  codigo?: string;
};

export async function listTrips(filters: TripQuery = {}, signal?: AbortSignal): Promise<TripListItem[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "todas") params.set("status", filters.status);
  if (filters.clienteId) params.set("clienteId", filters.clienteId);
  if (filters.motoristaId) params.set("motoristaId", filters.motoristaId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.codigo) params.set("codigo", filters.codigo);
  const query = params.toString();
  const response = await fetch(query ? `${TRIPS_URL}?${query}` : TRIPS_URL, {
    signal,
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response, "Não foi possível carregar as viagens"));
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de viagens");
  }

  return data as TripListItem[];
}

export async function getTrip(id: string, signal?: AbortSignal): Promise<TripDetail> {
  const response = await fetch(`${TRIPS_URL}/${id}`, {
    signal,
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response, "Não foi possível abrir a viagem"));
  }

  return (await response.json()) as TripDetail;
}

export async function createTrip(draft: TripDraft, signal?: AbortSignal): Promise<TripsResponse> {
  const response = await fetch(TRIPS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      clienteId: draft.clientId,
      motoristaId: draft.driverId,
      origin: draft.origin.trim(),
      destination: draft.destination.trim(),
      product: draft.product.trim(),
      load: draft.weightKg,
      dateLoad: draft.loadingDate,
      shipping: draft.freightReceivable,
      divideShipping: draft.divideShipping,
      acordoFrete: {
        freteCliente: draft.freightReceivable,
        freteMotorista: draft.freightPayable,
        prazoClienteDias: draft.clientTermDays,
        prazoMotoristaDias: draft.driverTermDays,
      },
    } satisfies CriarViagemInput),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response, "Não foi possível salvar a viagem"));
  }

  return (await response.json()) as TripsResponse;
}

export async function updateTrip(id: string, draft: TripDraft): Promise<TripDetail> {
  const response = await fetch(`${TRIPS_URL}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      clienteId: draft.clientId,
      motoristaId: draft.driverId,
      origin: draft.origin.trim(),
      destination: draft.destination.trim(),
      product: draft.product.trim(),
      load: draft.weightKg,
      dateLoad: draft.loadingDate,
      shipping: draft.freightReceivable,
      divideShipping: draft.divideShipping,
      acordoFrete: {
        freteCliente: draft.freightReceivable,
        freteMotorista: draft.freightPayable,
        prazoClienteDias: draft.clientTermDays,
        prazoMotoristaDias: draft.driverTermDays,
      },
    } satisfies CriarViagemInput),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response, "Não foi possível salvar a viagem"));
  }

  return (await response.json()) as TripDetail;
}

async function postEvento(id: string, caminho: string, body: unknown): Promise<TripDetail> {
  const response = await fetch(`${TRIPS_URL}/${id}/${caminho}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response, "Não foi possível registrar o evento"));
  }

  return (await response.json()) as TripDetail;
}

export function issueCte(id: string, number: string, emitted: string): Promise<TripDetail> {
  const body: CteInput = { number, emitted };
  return postEvento(id, "cte", body);
}

export function attachPhoto(id: string, name: string, received: string, content: string): Promise<TripDetail> {
  const body: FotoInput = { name, content, received };
  return postEvento(id, "foto", body);
}

export function registerUnload(id: string, occurredAt: string): Promise<TripDetail> {
  const body: EventoInput = { occurredAt };
  return postEvento(id, "descarga", body);
}

export function registerDocuments(id: string, occurredAt: string): Promise<TripDetail> {
  const body: EventoInput = { occurredAt };
  return postEvento(id, "comprovantes", body);
}

export function settleTitle(id: string, papel: PapelTitulo, occurredAt: string): Promise<TripDetail> {
  const body: TituloInput = { papel, occurredAt };
  return postEvento(id, "liquidacao", body);
}

export function cancelTrip(id: string): Promise<TripDetail> {
  return postEvento(id, "cancelamento", {});
}

export function scheduleBalance(id: string, scheduledAt: string): Promise<TripDetail> {
  const body: ProgramacaoInput = { papel: "saldo", scheduledAt };
  return postEvento(id, "programacao", body);
}

export function registerAdvance(id: string, occurredAt: string): Promise<TripDetail> {
  const body: EventoInput = { occurredAt };
  return postEvento(id, "adiantamento", body);
}
