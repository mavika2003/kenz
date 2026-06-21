export type AuthUser = {
  id?: string;
  email: string;
  name: string;
  username?: string | null;
  picture?: string | null;
};

export type AuthMode = "signup" | "login";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";
const TOKEN_KEY = "kenz_auth_token";
const USER_KEY = "kenz_auth_user";

export function isAuthConfigured(): boolean {
  return API_URL.length > 0;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuth(accessToken: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseAuthResponse(response: Response, fallback: string): Promise<AuthUser> {
  if (!response.ok) {
    let detail = fallback;
    if (response.status === 404) {
      detail =
        "Auth API not found. Make sure the KenZ API is running (port 8001 locally).";
    } else {
      try {
        const body = (await response.json()) as { detail?: string };
        if (body.detail) detail = body.detail;
      } catch {
        // keep default
      }
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as {
    access_token: string;
    user: AuthUser;
  };

  storeAuth(data.access_token, data.user);
  return data.user;
}

export async function registerWithEmail(input: {
  email: string;
  username: string;
  password: string;
  name?: string;
}): Promise<AuthUser> {
  if (!API_URL) throw new Error("API is not configured.");

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseAuthResponse(response, "Could not create your account.");
}

export async function loginWithEmail(input: {
  email_or_username: string;
  password: string;
}): Promise<AuthUser> {
  if (!API_URL) throw new Error("API is not configured.");

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseAuthResponse(response, "Invalid email/username or password.");
}

export async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  if (!API_URL) return null;

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return (await response.json()) as AuthUser;
}

export function loginPageUrl(mode: AuthMode = "login", next = "/chat"): string {
  const params = new URLSearchParams({ mode, next });
  return `/login?${params.toString()}`;
}
