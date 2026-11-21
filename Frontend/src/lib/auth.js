// Bearer tokens stay in this browser tab rather than persistent local storage.
export function clearToken() {
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) return null;
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part));
    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
      clearToken();
      return null;
    }
    // This is only a navigation convenience. The API verifies the signature and admin account.
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
    return token;
  } catch {
    clearToken();
    return null;
  }
}

export function setToken(token) {
  clearToken();
  sessionStorage.setItem('token', token);
}
