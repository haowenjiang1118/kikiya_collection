/**
 * Session-based authentication.
 *
 * - Passwords are hashed with scrypt (see lib/password.ts).
 * - On login we create a Session row and set an httpOnly cookie holding a
 *   random token. The cookie never contains user data — just the token.
 * - getCurrentUser() reads the cookie, looks up the session, and returns the
 *   user (or null). Expired sessions are treated as logged out.
 */

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** A user safe to send to the client (no passwordHash). */
export type SafeUser = Pick<User, "id" | "name" | "email" | "role">;

export function toSafeUser(user: User): SafeUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ---------------------------------------------------------------------------
// Registration & login
// ---------------------------------------------------------------------------

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      role: "customer",
      passwordHash: hashPassword(input.password),
    },
  });
}

/** Returns the user if credentials are valid, otherwise null. */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !user.passwordHash) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/** Create a session for the user and set the session cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({ data: { token, userId, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
}

/** Read the current user from the session cookie, or null if not logged in. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    // Expired — clean it up.
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return session.user;
}

/** Destroy the current session (logout). */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    jar.delete(SESSION_COOKIE);
  }
}
