import { NextResponse } from "next/server";
import { addProduct, listProducts, type Size } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await listProducts());
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
  const description =
    typeof b.description === "string" ? b.description.trim() : "";
  const brand = typeof b.brand === "string" ? b.brand.trim() : "";
  const category = typeof b.category === "string" ? b.category.trim() : "";
  const priceCents = Number(b.priceCents);
  const imageUrl = typeof b.imageUrl === "string" ? b.imageUrl : undefined;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    return NextResponse.json(
      { error: "Price must be a non-negative number (in cents)" },
      { status: 400 }
    );
  }

  const variants = Array.isArray(b.variants)
    ? (b.variants as Record<string, unknown>[]).map((v) => ({
        size: String(v.size ?? "M") as Size,
        color: String(v.color ?? "").trim() || "Default",
        stock: Math.max(0, Number(v.stock) || 0),
      }))
    : [];

  const product = await addProduct({
    name,
    description,
    brand,
    category,
    priceCents: Math.round(priceCents),
    imageUrl,
    variants,
  });

  return NextResponse.json(product, { status: 201 });
}
