"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, SIZES } from "@/lib/store";

interface VariantDraft {
  size: string;
  color: string;
  stock: string;
}

export default function AddProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([
    { size: "M", color: "", stock: "10" },
  ]);

  function reset() {
    setName("");
    setBrand("");
    setCategory(CATEGORIES[0]);
    setPrice("");
    setDescription("");
    setImageUrl("");
    setVariants([{ size: "M", color: "", stock: "10" }]);
    setError(null);
  }

  function updateVariant(i: number, patch: Partial<VariantDraft>) {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNumber = parseFloat(price);
    if (!name.trim()) return setError("Name is required");
    if (!Number.isFinite(priceNumber) || priceNumber < 0)
      return setError("Enter a valid price");

    setBusy(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand,
          category,
          description,
          imageUrl,
          priceCents: Math.round(priceNumber * 100),
          variants: variants
            .filter((v) => v.color.trim() !== "")
            .map((v) => ({
              size: v.size,
              color: v.color,
              stock: parseInt(v.stock, 10) || 0,
            })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to add product");
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        + Add product
      </button>
    );
  }

  const field =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <h2 className="font-semibold">New product</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <input
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Classic Cotton Tee"
          />
        </label>
        <label className="text-sm">
          Brand
          <input
            className={field}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Everyday"
          />
        </label>
        <label className="text-sm">
          Category
          <select
            className={field}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Price (USD)
          <input
            className={field}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="19.99"
            inputMode="decimal"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm">
        Description
        <textarea
          className={field}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="mt-4 block text-sm">
        Image URL (optional — a placeholder is generated if blank)
        <input
          className={field}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
        />
      </label>

      <div className="mt-4">
        <p className="text-sm font-medium">Variants</p>
        <p className="text-xs text-gray-400">
          Rows with a blank color are ignored.
        </p>
        <div className="mt-2 space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex gap-2">
              <select
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                value={v.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                placeholder="Color"
                value={v.color}
                onChange={(e) => updateVariant(i, { color: e.target.value })}
              />
              <input
                className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                placeholder="Stock"
                inputMode="numeric"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: e.target.value })}
              />
              <button
                type="button"
                onClick={() =>
                  setVariants((vs) => vs.filter((_, idx) => idx !== i))
                }
                className="px-2 text-gray-400 hover:text-red-600"
                aria-label="Remove variant"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setVariants((vs) => [...vs, { size: "M", color: "", stock: "10" }])
          }
          className="mt-2 text-sm text-indigo-600 hover:underline"
        >
          + Add variant
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save product"}
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
