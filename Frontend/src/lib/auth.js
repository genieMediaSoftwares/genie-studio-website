/**
 * Unified Admin Authentication Helper
 *
 * Keeps admin JWT tokens in both localStorage and sessionStorage so that
 * admin sessions remain valid across multiple tabs and browser reloads.
 * Validates expiration before returning tokens to prevent sending stale tokens.
 */

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {
    /* ignore storage access errors */
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!raw) return null;

    const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : raw.trim();
    if (!token) {
      clearToken();
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      clearToken();
      return null;
    }

    // Safely check JWT expiration (base64url decoded)
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      clearToken();
      return null;
    }

    // Sync across both storages so all tabs have the valid token
    localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
    return token;
  } catch {
    clearToken();
    return null;
  }
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (!token) {
    clearToken();
    return;
  }
  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
    localStorage.setItem("token", cleanToken);
    sessionStorage.setItem("token", cleanToken);
  } catch {
    /* ignore storage errors */
  }
}

export function getAuthHeader() {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function isAuthenticated() {
  return Boolean(getToken());
}
