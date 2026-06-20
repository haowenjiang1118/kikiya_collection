import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Threads<span className="text-indigo-600">.</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Shop
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700"
            >
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-500">
                Hi, <span className="text-gray-900">{user.name}</span>
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-gray-900">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
