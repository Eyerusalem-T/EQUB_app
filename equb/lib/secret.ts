/** Shared by the proxy and the server. Fails closed in production if the secret is missing or weak. */
export function sessionKey() {
  const s = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!s || s.length < 32)) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in production");
  }
  return new TextEncoder().encode(s || "dev-only-secret-change-me-please-32chars");
}
export const COOKIE = "eq_session";
