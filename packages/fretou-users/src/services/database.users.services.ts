import { User } from "../types/users";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const USERS_URL = `${API_URL}/api/users`;

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("fretou_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listUsers(signal: AbortSignal): Promise<User[]> {
  const response = await fetch(USERS_URL, {
    signal,
    credentials: "include",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os usuários");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de usuários");
  }

  return data as User[];
}

export async function createUsers(
  signal: AbortSignal,
  user: User
): Promise<User> {
  const { _id: _ignorado, ...body } = user;
  const response = await fetch(USERS_URL, {
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
        ? "Já existe um usuário com este CPF."
        : "Não foi possível salvar o usuário"
    );
  }

  return await response.json() as User;
}

export async function updateUsers(
  id: string,
  signal: AbortSignal,
  user: User
): Promise<User> {
  const { _id: _ignorado, ...body } = user;
  const response = await fetch(`${USERS_URL}/${id}`, {
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
        ? "Já existe um usuário com este CPF."
        : "Não foi possível atualizar o usuário"
    );
  }

  return await response.json() as User;
}
