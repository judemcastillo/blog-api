const BASE = import.meta.env.VITE_API_URL;

export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers||{}) },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).message || res.statusText);
  return res.json();
}
