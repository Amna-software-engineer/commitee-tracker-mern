// Thin wrapper around fetch() so every API call gets the same base URL,
// JSON headers, and error handling. Every backend controller responds with
// JSON (either the resource or { message }), so we can share this everywhere.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch() itself throws on network failure (server down, wrong port, etc.)
    throw new Error(
      `Could not reach the API at ${BASE_URL}. Is the backend running (npm run dev)?`
    );
  }

  // 204 No Content (not currently used, but safe to handle) has no body to parse.
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
