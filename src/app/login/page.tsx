import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const target = next && next.startsWith("/") ? next : "/";

  // Already logged in — no need to show the form.
  if (user) {
    redirect(target);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="mb-6 text-2xl font-bold tracking-tight">
        Threads<span className="text-indigo-600">.</span>
      </Link>
      <LoginForm next={target} />
    </main>
  );
}
