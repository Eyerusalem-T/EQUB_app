"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, checkPassword, startSession, endSession, safeNext } from "@/lib/auth";
import { blocked, fail, clear } from "@/lib/ratelimit";

export type State = { error?: string };
const HANDLE = /^[a-z0-9_]{3,20}$/;
const field = (fd: FormData, k: string) => { const v = fd.get(k); return typeof v === "string" ? v : ""; };

export async function signUp(_: State, fd: FormData): Promise<State> {
  const handle = field(fd, "handle").trim().toLowerCase();
  const pw = field(fd, "password");
  if (!HANDLE.test(handle)) return { error: "Handle: 3 to 20 lowercase letters, numbers or underscores." };
  if (pw.length < 8 || pw.length > 128) return { error: "Password must be 8 to 128 characters." };
  if (db.userByHandle(handle)) return { error: "That handle is taken. Pick another." };
  const { salt, hash } = hashPassword(pw);
  await startSession(db.createUser(handle, salt, hash).id);
  redirect("/groups");
}
export async function signIn(_: State, fd: FormData): Promise<State> {
  const handle = field(fd, "handle").trim().toLowerCase().slice(0, 20);
  const pw = field(fd, "password").slice(0, 128);
  if (blocked(handle)) return { error: "Too many attempts. Try again in 15 minutes." };
  const u = db.userByHandle(handle);
  // One message for unknown handle and wrong password: never reveal which exists.
  if (!u || !checkPassword(pw, u.salt, u.hash)) { fail(handle); return { error: "Handle or password is wrong." }; }
  clear(handle);
  await startSession(u.id);
  redirect(safeNext(field(fd, "next")));
}
export async function signOut() { await endSession(); redirect("/"); }
