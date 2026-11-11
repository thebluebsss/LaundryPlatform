export type AppActorScope = "customer" | "driver" | "store_owner" | "admin";

export const AUTH_KEYS: Record<
  AppActorScope,
  { token: string; profile: string }
> = {
  customer: {
    token: "sachse_customer_token",
    profile: "sachse_customer_profile",
  },
  driver: {
    token: "sachse_driver_token",
    profile: "sachse_driver_profile",
  },
  store_owner: {
    token: "sachse_store_owner_token",
    profile: "sachse_store_owner_profile",
  },
  admin: {
    token: "sachse_admin_token",
    profile: "sachse_admin_profile",
  },
};

export const detectActiveScopeFromUrl = (pathname?: string): AppActorScope => {
  const path =
    pathname ||
    (typeof window !== "undefined"
      ? window.location.hash.replace(/^#/, "") || window.location.pathname
      : "/");

  if (path.startsWith("/mobile-driver")) return "driver";
  if (path.startsWith("/mobile-customer")) return "customer";
  if (path.startsWith("/store-owner")) return "store_owner";
  if (path.startsWith("/admin")) return "admin";
  return "customer";
};

export const getScopedToken = (scope?: AppActorScope): string | null => {
  const target = scope || detectActiveScopeFromUrl();
  const keys = AUTH_KEYS[target];
  return localStorage.getItem(keys.token);
};

export const getScopedProfile = <T = any>(scope?: AppActorScope): T | null => {
  const target = scope || detectActiveScopeFromUrl();
  const keys = AUTH_KEYS[target];
  const raw = localStorage.getItem(keys.profile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setScopedSession = (
  scope: AppActorScope,
  token: string,
  profile: any,
) => {
  const keys = AUTH_KEYS[scope];
  localStorage.setItem(keys.token, token);
  localStorage.setItem(keys.profile, JSON.stringify(profile));
  // Remove legacy shared keys so they never leak between apps
  localStorage.removeItem("sachse_user_token");
  localStorage.removeItem("sachse_user_profile");
  window.dispatchEvent(new Event("storage"));
};

export const clearScopedSession = (scope: AppActorScope) => {
  const keys = AUTH_KEYS[scope];
  localStorage.removeItem(keys.token);
  localStorage.removeItem(keys.profile);
  localStorage.removeItem("sachse_user_token");
  localStorage.removeItem("sachse_user_profile");
  window.dispatchEvent(new Event("storage"));
};
