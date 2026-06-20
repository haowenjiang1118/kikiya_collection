# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

A **single-store clothing e-commerce website**. One shop owner manages the catalog;
customers browse, add to cart, and check out with Stripe (test mode).

Status: **Phase 1 + database + auth** — working frontend + backend, real
database (Prisma + SQLite at `prisma/dev.db`), and session-based authentication
(customer + admin roles; `/admin` is admin-only). Cart/checkout and Stripe are
later phases.

> DB note: local dev uses **SQLite** for zero-setup persistence. The schema is
> Postgres-compatible; switch the `datasource` provider in `prisma/schema.prisma`
> to `postgresql` for production.

## Tech Stack

| Layer      | Choice                              |
|------------|-------------------------------------|
| Framework  | Next.js (App Router) + TypeScript   |
| Styling    | Tailwind CSS                        |
| Database   | PostgreSQL                          |
| ORM        | Prisma                              |
| Auth       | NextAuth.js (email/password + OAuth)|
| Payments   | Stripe (test mode, webhooks)        |
| State      | React Context / Zustand (cart)      |
| Images     | Local `/public` to start (Cloudinary later) |

## Architecture

- One Next.js app for both frontend and API (API routes / server actions).
- `customer` and `admin` roles. Admin = the single store owner.
- Prisma schema is the source of truth for the data model.

### Core data model (planned)
- **Product** — name, description, brand, price, category, images
- **Variant** — size + color + SKU + stock, belongs to a Product
- **Category / Collection**
- **User** — auth, role, profile, addresses, sizes
- **Cart / CartItem**
- **Order / OrderItem** — lifecycle: pending → paid → shipped → delivered
- **Review** — rating, text, photos
- **Wishlist**
- **Discount / Coupon**

## Feature Domains

1. Catalog & inventory (product CRUD, variants, stock, search/filter)
2. Users & accounts (auth, profiles, addresses, wishlist, order history)
3. Admin dashboard (product/inventory management, sales analytics)
4. Cart & checkout (persistent cart, shipping, discounts, tax)
5. Payments (Stripe test mode, receipts, refunds, webhooks)
6. Orders & fulfillment (lifecycle, tracking, returns)
7. Recommendations ("you may also like", trending, personalized feed)
8. Engagement (reviews/ratings, email notifications)

## Build Order (Phases)

1. Foundation — scaffold, Prisma schema, seed data
2. Catalog — listing, detail pages, search/filter
3. Auth & users
4. Cart & checkout + Stripe (test mode)
5. Orders — creation, history, status
6. Admin dashboard — product CRUD, inventory
7. Recommendations + reviews
8. Polish — responsive design, emails, analytics

## Conventions

- TypeScript throughout; prefer server components, use client components only when needed.
- Keep the Prisma schema and generated client in sync (`prisma generate` after schema edits).
- Stripe keys and DB URL live in `.env` (never commit). Provide `.env.example`.
- Money stored in integer cents to avoid float errors.

## Current State

- **Database:** Prisma + SQLite. Schema in `prisma/schema.prisma`
  (Product, Variant, User). Migrations in `prisma/migrations/`.
  Seed data in `prisma/seed.mjs`.
- **Prisma client:** `src/lib/db.ts` exports a singleton `prisma` (guarded on
  `globalThis` to survive dev hot-reloads).
- **Data layer:** `src/lib/store.ts` — the single module the app uses for data.
  Wraps Prisma; functions (`listProducts`, `addProduct`, etc.) are **async**.
  Pure helpers (`formatPrice`, `totalStock`) and constants (`SIZES`,
  `CATEGORIES`) stay synchronous.
- **API routes:** `src/app/api/products` and `src/app/api/users`
  (GET list, POST create, DELETE by id).
- **Storefront:** `/` (product grid), `/products/[id]` (detail).
- **Admin:** `/admin` (dashboard), `/admin/products`, `/admin/users`
  — add via slide-out forms, delete inline. Layout in `src/app/admin/layout.tsx`
  enforces an **admin-only guard** (redirects non-admins to `/login`).
- **Auth:** session-based, no external lib.
  - `src/lib/password.ts` — scrypt hashing (Node `crypto`, no deps).
  - `src/lib/auth.ts` — `registerCustomer`, `verifyCredentials`,
    `createSession`, `getCurrentUser`, `destroySession`. Sessions are rows in
    the `Session` table; an httpOnly cookie (`session`) holds a random token.
  - API: `src/app/api/auth/{register,login,logout,me}`.
  - Pages: `/login`, `/register`. `Navbar` shows auth state + logout.
- Prices are integer cents everywhere (`formatPrice` to display).

> Note: Node was installed via Homebrew (`node` 26.x). If `node`/`npm` aren't
> on PATH in a fresh shell, they live in `/opt/homebrew/bin`.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build (also type-checks)
npm start          # run the production build

# Database (Prisma + SQLite)
npm run db:migrate # create/apply migrations (prisma migrate dev)
npm run db:seed    # reseed sample products/users (clears existing data)
npm run db:reset   # drop, re-migrate, and reseed from scratch
npm run db:studio  # open Prisma Studio (visual DB browser)
```

## Test Scripts

End-to-end scripts under `scripts/` (run against a live dev server):

```bash
bash scripts/test-auth.sh   # register/login/logout/me + admin access control
```

## Default Accounts (dev/seed only)

| Role     | Email              | Password      |
|----------|--------------------|---------------|
| Admin    | owner@store.test   | `admin1234`   |
| Customer | jane@example.com   | `password123` |
