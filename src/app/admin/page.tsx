import Link from "next/link";
import {
  formatPrice,
  listProducts,
  listUsers,
  totalStock,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, users] = await Promise.all([listProducts(), listUsers()]);

  const inventoryValue = products.reduce(
    (sum, p) => sum + p.priceCents * totalStock(p),
    0
  );
  const lowStock = products.filter((p) => totalStock(p) > 0 && totalStock(p) <= 5);
  const outOfStock = products.filter((p) => totalStock(p) === 0);

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products" },
    { label: "Users", value: users.length, href: "/admin/users" },
    { label: "Inventory value", value: formatPrice(inventoryValue) },
    { label: "Low / out of stock", value: lowStock.length + outOfStock.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your store (static data for now).
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
            {s.href && (
              <Link
                href={s.href}
                className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
              >
                Manage →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold">Quick actions</h2>
        <div className="mt-3 flex gap-3">
          <Link
            href="/admin/products"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            + Add product
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            + Add user
          </Link>
        </div>
      </div>
    </div>
  );
}
