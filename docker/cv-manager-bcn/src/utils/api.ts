import { Candidatura, JobOffer, UserProfileAccount } from '../types';

export interface AppState {
  profiles: UserProfileAccount[];
  activeProfileId: string;
  candidaturas: Candidatura[];
  offers: JobOffer[];
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function authorizationHeader(credentials: AuthCredentials): string {
  const bytes = new TextEncoder().encode(`${credentials.username}:${credentials.password}`);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `Basic ${btoa(binary)}`;
}

async function requireSuccess(response: Response): Promise<void> {
  if (response.ok) return;
  const body = await response.json().catch(() => null);
  throw new ApiError(body?.error || `Request failed (${response.status}).`, response.status);
}

export async function authenticate(credentials: AuthCredentials): Promise<void> {
  const response = await fetch('/cv/api/login', {
    method: 'POST',
    headers: { Authorization: authorizationHeader(credentials) },
  });
  await requireSuccess(response);
}

export async function fetchAppState(credentials: AuthCredentials): Promise<AppState | null> {
  const response = await fetch('/cv/api/state', {
    headers: { Authorization: authorizationHeader(credentials) },
  });
  await requireSuccess(response);
  const result = await response.json();
  return result.state as AppState | null;
}

export async function initializeAppState(
  credentials: AuthCredentials,
  state: AppState
): Promise<AppState> {
  const response = await fetch('/cv/api/state/initialize', {
    method: 'POST',
    headers: {
      Authorization: authorizationHeader(credentials),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  });
  await requireSuccess(response);
  const result = await response.json();
  return result.state as AppState;
}

let pendingSave: Promise<void> = Promise.resolve();

export function saveAppState(credentials: AuthCredentials, state: AppState): Promise<void> {
  const request = pendingSave.catch(() => undefined).then(async () => {
    const response = await fetch('/cv/api/state', {
      method: 'PUT',
      headers: {
        Authorization: authorizationHeader(credentials),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state }),
    });
    await requireSuccess(response);
  });
  pendingSave = request;
  return request;
}