import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one, run } from "./db";
import { hashPassword } from "./password";

const COOKIE = "mnc_session";
const SESSION_DAYS = 14;

export type User = { id: number; name: string; mobile: string; role: "customer" | "admin" };

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function startSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const maxAge = SESSION_DAYS * 86400;
  await run("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?,?,?)", sha256(token), userId, Math.floor(Date.now() / 1000) + maxAge);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token_hash = ?", sha256(token));
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = await one(`SELECT u.id, u.name, u.mobile, u.role FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`, sha256(token), Math.floor(Date.now() / 1000));
  return (row as User | undefined) ?? null;
}

/** Only same-site paths may be used as a post-login destination. */
export function safeNext(next: FormDataEntryValue | string | null | undefined, fallback = "/orders") {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : fallback;
}

export async function requireUser(next?: string): Promise<User> {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/** Creates the admin account the first time it signs in. Later password edits in the settings have no effect. */
export async function ensureAdmin(attempted: string) {
  const mobile = process.env.ADMIN_MOBILE;
  const password = process.env.ADMIN_PASSWORD;
  if (!mobile || !password || attempted !== mobile) return;
  const existing = await one("SELECT id FROM users WHERE mobile = ?", mobile) as { id: number } | undefined;
  if (!existing) {
    await run("INSERT INTO users (name, mobile, password_hash, role) VALUES (?,?,?,'admin')", "Admin", mobile, await hashPassword(password));
  }
}

// Basic brute-force guard, kept in the database because Workers share no memory.
const MAX_FAILS = 8;
const LOCK_SECONDS = 15 * 60;
const nowSeconds = () => Math.floor(Date.now() / 1000);

export async function loginLocked(mobile: string) {
  const row = await one<{ count: number; until: number }>("SELECT count, until FROM login_failures WHERE mobile = ?", mobile);
  return !!row && row.count >= MAX_FAILS && row.until > nowSeconds();
}

export async function recordLoginFailure(mobile: string) {
  await run(
    `INSERT INTO login_failures (mobile, count, until) VALUES (?1, 1, ?2)
     ON CONFLICT(mobile) DO UPDATE SET
       count = CASE WHEN until > unixepoch() THEN count + 1 ELSE 1 END,
       until = ?2`,
    mobile, nowSeconds() + LOCK_SECONDS,
  );
}

export async function clearLoginFailures(mobile: string) {
  await run("DELETE FROM login_failures WHERE mobile = ?", mobile);
}
