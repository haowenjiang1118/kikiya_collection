import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Password hashing with Node's built-in scrypt (no external dependency).
 * Stored format: "<saltHex>:<derivedKeyHex>".
 *
 * Keep this in sync with the inline copy in prisma/seed.mjs.
 */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;

  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");

  // timingSafeEqual throws on length mismatch, so guard first.
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(keyBuf, derived);
}
