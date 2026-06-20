import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatPrice, getProduct, totalStock } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const stock = totalStock(product);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-indigo-600 hover:underline"
        >
          ← Back to shop
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {product.brand} · {product.category}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            <p className="mt-4 text-2xl font-semibold">
              {formatPrice(product.priceCents)}
            </p>
            <p className="mt-4 text-gray-600">{product.description}</p>

            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">
                Available variants
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  >
                    {v.size} · {v.color}
                    <span className="ml-2 text-gray-400">({v.stock})</span>
                  </span>
                ))}
                {product.variants.length === 0 && (
                  <span className="text-sm text-gray-400">
                    No variants configured.
                  </span>
                )}
              </div>
            </div>

            <button
              disabled={stock === 0}
              className="mt-8 w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {stock > 0 ? "Add to cart" : "Sold out"}
            </button>
            <p className="mt-2 text-center text-xs text-gray-400">
              (Cart &amp; checkout arrive in a later phase.)
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
