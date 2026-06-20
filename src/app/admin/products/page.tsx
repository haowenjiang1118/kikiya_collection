import Link from "next/link";
import AddProductForm from "@/components/admin/AddProductForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatPrice, listProducts, totalStock } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            {products.length} item{products.length === 1 ? "" : "s"} for sale
          </p>
        </div>
        <AddProductForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = totalStock(p);
              return (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-12 w-10 rounded object-cover"
                      />
                      <div>
                        <Link
                          href={`/products/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.priceCents)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        stock === 0
                          ? "text-red-500"
                          : stock <= 5
                            ? "text-amber-600"
                            : "text-gray-700"
                      }
                    >
                      {stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton endpoint={`/api/products/${p.id}`} />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No products yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
