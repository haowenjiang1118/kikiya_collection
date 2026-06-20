// Seeds the database with sample products and users.
// Idempotent: clears existing rows first, then inserts the seed set.
// Run with: npm run db:seed  (also runs automatically after `prisma migrate dev`)

import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

const prisma = new PrismaClient();

// Mirror of src/lib/password.ts (kept inline so the seed has no app imports).
// Format: "<saltHex>:<derivedKeyHex>" using scrypt with a 64-byte key.
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function img(seed) {
  return `https://picsum.photos/seed/${seed}/600/800`;
}

const products = [
  {
    name: "Classic Cotton Tee",
    description:
      "A soft, breathable 100% cotton t-shirt for everyday wear.",
    brand: "Everyday",
    category: "Tops",
    priceCents: 1999,
    imageUrl: img("tee"),
    variants: [
      { size: "S", color: "White", stock: 25 },
      { size: "M", color: "White", stock: 30 },
      { size: "L", color: "Black", stock: 12 },
    ],
  },
  {
    name: "Vintage Denim Jacket",
    description: "Timeless washed denim jacket with a relaxed fit.",
    brand: "Northbound",
    category: "Outerwear",
    priceCents: 7900,
    imageUrl: img("denim"),
    variants: [
      { size: "M", color: "Blue", stock: 8 },
      { size: "L", color: "Blue", stock: 5 },
    ],
  },
  {
    name: "Slim-Fit Chinos",
    description: "Versatile stretch chinos that go from office to weekend.",
    brand: "Everyday",
    category: "Bottoms",
    priceCents: 4500,
    imageUrl: img("chino"),
    variants: [
      { size: "M", color: "Khaki", stock: 18 },
      { size: "L", color: "Navy", stock: 14 },
    ],
  },
  {
    name: "Floral Summer Dress",
    description: "Lightweight floral midi dress, perfect for warm days.",
    brand: "Bloom",
    category: "Dresses",
    priceCents: 5900,
    imageUrl: img("dress"),
    variants: [
      { size: "S", color: "Floral", stock: 10 },
      { size: "M", color: "Floral", stock: 7 },
    ],
  },
  {
    name: "Everyday Sneakers",
    description: "Cushioned low-top sneakers with a minimalist design.",
    brand: "Stride",
    category: "Footwear",
    priceCents: 6500,
    imageUrl: img("sneaker"),
    variants: [
      { size: "M", color: "White", stock: 20 },
      { size: "L", color: "Grey", stock: 9 },
    ],
  },
  {
    name: "Merino Wool Beanie",
    description: "Warm, itch-free merino wool beanie for cold days.",
    brand: "Northbound",
    category: "Accessories",
    priceCents: 2400,
    imageUrl: img("beanie"),
    variants: [{ size: "M", color: "Charcoal", stock: 40 }],
  },
];

// Default passwords for local dev / testing only.
const users = [
  {
    name: "Store Owner",
    email: "owner@store.test",
    role: "admin",
    password: "admin1234",
  },
  {
    name: "Jane Customer",
    email: "jane@example.com",
    role: "customer",
    password: "password123",
  },
];

async function main() {
  // Clear existing data (variants cascade with products).
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  for (const p of products) {
    const { variants, ...rest } = p;
    await prisma.product.create({
      data: { ...rest, variants: { create: variants } },
    });
  }

  for (const u of users) {
    const { password, ...rest } = u;
    await prisma.user.create({
      data: { ...rest, passwordHash: hashPassword(password) },
    });
  }

  const [productCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
  ]);
  console.log(`Seeded ${productCount} products and ${userCount} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
