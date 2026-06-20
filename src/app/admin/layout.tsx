import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin-only guard. Non-admins (and logged-out users) are sent to login.
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login?next=/admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Threads<span className="text-indigo-600">.</span>
          </Link>
          <p className="mt-0.5 text-xs text-gray-400">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            Products
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            Users
          </Link>
          <Link
            href="/"
            className="mt-4 rounded-md px-3 py-2 text-gray-400 hover:bg-gray-100"
          >
            ← Back to store
          </Link>
        </nav>
        <div className="border-t border-gray-200 px-4 py-4">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="mb-2 text-xs text-gray-400">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
