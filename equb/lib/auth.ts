import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { COOKIE, sessionKey } from "./secret";

export const hashPassword = (pw: string, salt = randomBytes(16).toString("hex")) =>
  ({ salt, hash: scryptSync(pw, salt, 64).toString("hex") });

export function checkPassword(pw: string, salt: string, hash: string) {
  const a = Buffer.from(scryptSync(pw, salt, 64).toString("hex"));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function startSession(userId: string) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime("7d").sign(sessionKey());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function endSession() { (await cookies()).delete(COOKIE); }

/** Layer 2: verifies the cookie AND that the user still exists in the data store. */
export async function getUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    return payload.sub ? db.userById(payload.sub) ?? null : null;
  } catch { return null; }
}
/** Layer 3: every server action starts here, because the interface alone proves nothing. */
export async function requireUser() {
  const u = await getUser();
  if (!u) redirect("/signin");
  return u;
}
/** Only same-site relative paths survive; anything else falls back to /groups. */
export function safeNext(n: unknown) {
  return typeof n === "string" && n.length < 200 && /^\/(?!\/)[^\\\s]*$/.test(n) ? n : "/groups";
}
