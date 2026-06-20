/**
 * Data access layer — backed by Prisma + SQLite.
 *
 * This is the only module the rest of the app uses to read/write data.
 * The DB functions are async (they hit the database); the pure helpers
 * (formatPrice, totalStock) and the shared constants/types stay synchronous.
 */

import { prisma } from "@/lib/db";
import type {
  Product as PrismaProduct,
  Variant,
  User,
} from "@prisma/client";

export type { Variant, User };

/** A product with its variants loaded — the shape the UI works with. */
export type Product = PrismaProduct & { variants: Variant[] };

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Dresses",
  "Footwear",
  "Accessories",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Role = "customer" | "admin";

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function listProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getProduct(productId: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
}

export interface NewProductInput {
  name: string;
  description: string;
  brand: string;
  category: string;
  /** Price in integer cents. */
  priceCents: number;
  imageUrl?: string;
  variants?: Omit<Variant, "id" | "productId">[];
}

export function addProduct(input: NewProductInput): Promise<Product> {
  const imageUrl =
    input.imageUrl?.trim() ||
    `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 10)}/600/800`;

  return prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      brand: input.brand,
      category: input.category,
      priceCents: input.priceCents,
      imageUrl,
      variants: { create: input.variants ?? [] },
    },
    include: { variants: true },
  });
}

export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id: productId } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function listUsers(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
}

export interface NewUserInput {
  name: string;
  email: string;
  role?: Role;
}

export function addUser(input: NewUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role ?? "customer",
    },
  });
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Pure helpers (no DB access)
// ---------------------------------------------------------------------------

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}
