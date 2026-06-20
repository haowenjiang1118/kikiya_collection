import Link from "next/link";
import { formatPrice, totalStock, type Product } from "@/lib/store";

export default function ProductCard({ product }: { product: Product }) {
  const stock = totalStock(product);
  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          {product.brand}
        </p>
        <h3 className="mt-1 font-medium text-gray-900">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">
            {formatPrice(product.priceCents)}
          </span>
          <span
            className={
              stock > 0
                ? "text-xs text-green-600"
                : "text-xs text-red-500"
            }
          >
            {stock > 0 ? `${stock} in stock` : "Sold out"}
          </span>
        </div>
      </div>
    </Link>
  );
}
