import { NextResponse } from "next/server";
import { addUser, listUsers, type Role } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await listUsers());
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const role: Role = b.role === "admin" ? "admin" : "customer";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 }
    );
  }

  try {
    const user = await addUser({ name, email, role });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    // Prisma throws P2002 when the unique email constraint is violated.
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
