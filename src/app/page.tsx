import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-12 text-white">
          <h1 className="text-3xl font-bold sm:text-4xl">New Season Arrivals</h1>
          <p className="mt-2 max-w-lg text-indigo-100">
            Quality everyday clothing, curated for comfort and style. Browse the
            full collection below.
          </p>
        </section>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Products</h2>
          <span className="text-sm text-gray-500">
            {products.length} items
          </span>
        </div>

        {products.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No products yet. Add some from the Admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
