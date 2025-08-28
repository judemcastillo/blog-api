export function getToken() {
	return localStorage.getItem("token");
}

export function isAuthed() {
	return !!getToken();
}

export function logout() {
	localStorage.removeItem("token");
}

function base64UrlDecode(str) {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if missing
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

function decodeJwt(token) {
	try {
		const [, payload] = token.split("."); // skip header, get payload
		const json = base64UrlDecode(payload);
		return JSON.parse(json);
	} catch {
		return null;
	}
}

export function getRole() {
  const token = getToken();
  if (!token) return null;

  const payload = decodeJwt(token); // may return null
  if (!payload || !payload.role) return null;

  return payload.role; // "USER" | "AUTHOR" | "ADMIN"
}

export function getUser() {
	const token = getToken();
	const payload = token ? decodeJwt(token) : null;
	if (!payload) return null;
	return {
		id: payload.sub ?? null,
		email: payload.email ?? null,
		username: payload.username ?? null,
		role: payload.role ?? null,
		exp: payload.exp ?? null,
	};
}
