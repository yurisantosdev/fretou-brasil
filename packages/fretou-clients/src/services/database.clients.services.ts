import { Client } from "../types/clients";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const CLIENTS_URL = `${API_URL}/api/clients`;

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("fretou_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listClients(signal: AbortSignal): Promise<Client[]> {
  const response = await fetch(CLIENTS_URL, {
    signal,
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os clientes");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de clientes");
  }

  return data as Client[];
}

export async function createClients(
  signal: AbortSignal,
  client: Client
): Promise<Client> {
  const { _id: _ignorado, ...body } = client;
  const response = await fetch(CLIENTS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 409
        ? "Já existe um cliente com este CNPJ."
        : "Não foi possível salvar o cliente"
    );
  }

  return await response.json() as Client;
}

export async function updateClients(
  id: string,
  signal: AbortSignal,
  client: Client
): Promise<Client> {
  const { _id: _ignorado, ...body } = client;
  const response = await fetch(`${CLIENTS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 409
        ? "Já existe um cliente com este CNPJ."
        : "Não foi possível atualizar o cliente"
    );
  }

  return await response.json() as Client;
}
