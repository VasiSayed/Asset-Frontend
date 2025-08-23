import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

const API_BASE = "http://127.0.0.1:8000";

export interface TenantInfo {
  alias: string;
  client_username: string;
  client_id: number;
  user_id: number;
  username: string;
}

export interface AuthState {
  token_type: string;
  access_token: string;
  refresh_token?: string | null;
  permissions: Record<string, any>;
  tenant: TenantInfo;
}

let authState: AuthState | null = null;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send/receive httpOnly refresh cookie
});

// ---------------- Helpers ----------------
function parseError(err: any): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    "Request failed"
  );
}

export function getAuthState(): AuthState | null {
  return authState;
}

function setAuthFromRefresh(data: any) {
  // require access_token; if missing, treat as failure
  if (!data || !data.access_token) return false;

  if (!authState) {
    authState = {
      token_type: "Bearer",
      access_token: data.access_token,
      refresh_token: null,
      permissions:
        data.permissions ||
        JSON.parse(localStorage.getItem("permissions") || "{}"),
      tenant: data.tenant,
    };
  } else {
    authState.access_token = data.access_token;
    if (data.permissions) authState.permissions = data.permissions;
    if (data.tenant) authState.tenant = data.tenant;
  }
  return true;
}

// ---------------- Interceptors ----------------
api.interceptors.request.use((config) => {
  const token = authState?.access_token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// concurrency guards for refresh + interactive login
let refreshInFlight: Promise<string | null> | null = null;
let interactiveLoginInFlight: Promise<boolean> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const isRefreshCall = original?.url?.includes("/api/refresh/");

    // Only handle 401 once per request and never for the refresh call itself
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isRefreshCall
    ) {
      original._retry = true;

      // 1) Try to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      // 2) Refresh failed (no/expired cookie). Prompt user once.
      const ok = await interactiveLogin();
      if (ok && authState?.access_token) {
        original.headers = original.headers ?? {};
        (
          original.headers as any
        ).Authorization = `Bearer ${authState.access_token}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

// ---------------- Login ----------------
export async function getToken(
  username: string,
  password: string,
  clientUsername?: string
): Promise<AuthState | null> {
  try {
    const payload: Record<string, any> = { username, password };
    if (clientUsername?.trim()) {
      payload.client_username = clientUsername.trim();
      sessionStorage.setItem("client_username", clientUsername.trim());
    }

    const { data } = await api.post("/api/login/", payload, {
      withCredentials: true,
    });

    localStorage.setItem("permissions", JSON.stringify(data.permissions || {}));

    authState = {
      token_type: data.token_type,
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? null,
      permissions: data.permissions || {},
      tenant: data.tenant,
    };

    return authState;
  } catch (err: any) {
    console.error("Login failed:", err?.response?.data || err);
    alert(`❌ Login failed: ${parseError(err)}`);
    return null;
  }
}

// ---------------- Refresh (cookie) ----------------
export async function refreshAccessToken(): Promise<string | null> {
  try {
    // de-duplicate concurrent refreshes
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const { data } = await api.post(
          "/api/refresh/",
          {},
          { withCredentials: true }
        );
        const ok = setAuthFromRefresh(data);
        return ok ? authState!.access_token : null;
      })().finally(() => {
        refreshInFlight = null;
      });
    }
    return await refreshInFlight;
  } catch (err: any) {
    // No/expired cookie or server rejected → treat as hard failure
    console.warn("❌ Refresh failed:", err?.response?.data || err);
    return null;
  }
}

// ---------------- Interactive prompt (dev/demo) ----------------
export async function interactiveLogin(): Promise<boolean> {
  if (!interactiveLoginInFlight) {
    interactiveLoginInFlight = (async () => {
      const username = prompt("Enter username:");
      const password = prompt("Enter password:");
      const clientUsername =
        prompt('Enter client_username (optional, e.g. "NEWHOUSE"):') || "";

      if (username && password) {
        const st = await getToken(
          username,
          password,
          clientUsername.trim() || undefined
        );
        return !!st;
      }
      return false;
    })().finally(() => {
      interactiveLoginInFlight = null;
    });
  }
  return await interactiveLoginInFlight;
}

// ---------------- Bootstrap (first load) ----------------
export async function bootstrapAuth(): Promise<boolean> {
  // Try refresh via cookie; DO NOT prompt here. The caller decides if/when to prompt.
  const token = await refreshAccessToken();
  return !!(token && getAuthState());
}

// ---------------- Logout ----------------
export function logoutLocal() {
  authState = null;
  localStorage.removeItem("permissions");
  sessionStorage.removeItem("client_username");
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/logout/", {}, { withCredentials: true });
  } catch (err) {
    console.warn("⚠️ Backend logout failed, clearing local anyway:", err);
  }

  logoutLocal();
  document.cookie =
    "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
