"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, InventoryWithProduct } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/lib/types";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const supabase = createClient();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    const [{ data: p }, { data: inv }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase
        .from("inventory")
        .select("*, products(name, base_price, image_url)")
        .order("created_at", { ascending: false }),
    ]);
    setProducts((p as Product[]) || []);
    setInventory((inv as InventoryWithProduct[]) || []);
    setLoading(false);
  }

  const lowStockCount = inventory.filter(
    (i) => i.quantity_available <= LOW_STOCK_THRESHOLD
  ).length;

  // Derive filtered inventory
  const filteredInventory = inventory.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(item.products?.name || "").toLowerCase().includes(q)) return false;
    }
    if (stockFilter === "out") return item.quantity_available === 0;
    if (stockFilter === "low")
      return item.quantity_available > 0 && item.quantity_available <= LOW_STOCK_THRESHOLD;
    if (stockFilter === "in") return item.quantity_available > LOW_STOCK_THRESHOLD;
    return true;
  });

  const hasFilters = searchQuery || stockFilter;

  function clearFilters() {
    setSearchQuery("");
    setStockFilter("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Add Product
          </button>
          <button
            onClick={() => setShowAddStock(!showAddStock)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-6 text-sm">
          Warning: {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running
          low on stock.
        </div>
      )}

      {showAddProduct && (
        <AddProductForm
          onDone={() => {
            setShowAddProduct(false);
            fetchData();
          }}
          onCancel={() => setShowAddProduct(false)}
        />
      )}

      {showAddStock && (
        <AddStockForm
          products={products}
          onDone={() => {
            setShowAddStock(false);
            fetchData();
          }}
          onCancel={() => setShowAddStock(false)}
        />
      )}

      {/* Filter Bar */}
      {inventory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Product name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {hasFilters && (
            <p className="text-xs text-gray-500 mt-2">
              Showing {filteredInventory.length} of {inventory.length} entries
            </p>
          )}
        </div>
      )}

      {/* Stock Table */}
      {inventory.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500">No stock entries yet.</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500">No stock entries match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-medium text-gray-500">
                  Image
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Product
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Size
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Color
                </th>
                <th className="text-center p-4 font-medium text-gray-500">
                  Available
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <StockRow
                  key={item.id}
                  item={item}
                  onUpdate={fetchData}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StockRow({
  item,
  onUpdate,
}: {
  item: InventoryWithProduct;
  onUpdate: () => void;
}) {
  const [qty, setQty] = useState(item.quantity_available.toString());
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleUpdate() {
    setSaving(true);
    await supabase
      .from("inventory")
      .update({ quantity_available: parseInt(qty) || 0 })
      .eq("id", item.id);
    setSaving(false);
    onUpdate();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this stock entry?")) return;
    await supabase.from("inventory").delete().eq("id", item.id);
    onUpdate();
  }

  const status =
    item.quantity_available === 0
      ? { label: "Out of Stock", cls: "bg-red-50 text-red-700 border-red-200" }
      : item.quantity_available <= LOW_STOCK_THRESHOLD
        ? {
            label: "Low Stock",
            cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
          }
        : {
            label: "In Stock",
            cls: "bg-green-50 text-green-700 border-green-200",
          };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50">
      <td className="p-4">
        {item.products?.image_url ? (
          <img
            src={item.products.image_url}
            alt={item.products?.name || "Product"}
            className="w-10 h-10 object-contain rounded border border-gray-200 bg-gray-50"
          />
        ) : (
          <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </td>
      <td className="p-4 font-medium text-gray-900">
        {item.products?.name || "Unknown"}
      </td>
      <td className="p-4 text-gray-600">{item.size}</td>
      <td className="p-4 text-gray-600">{item.color}</td>
      <td className="p-4 text-center font-medium text-gray-900">
        {item.quantity_available}
      </td>
      <td className="p-4">
        <span
          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${status.cls}`}
        >
          {status.label}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? "..." : "Update"}
          </button>
          <button
            onClick={handleDelete}
            className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete stock entry"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddProductForm({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data: productData, error: err } = await supabase
      .from("products")
      .insert({
        name,
        description: description || null,
        base_price: parseFloat(basePrice) || 0,
      })
      .select("id")
      .single();

    if (err || !productData) {
      setError(err?.message || "Failed to create product");
      setSaving(false);
      return;
    }

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `products/${productData.id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, imageFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(path);
        await supabase
          .from("products")
          .update({ image_url: urlData.publicUrl })
          .eq("id", productData.id);
      }
    }

    onDone();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Add Product
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Classic Tee"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <div className="flex items-center gap-4">
            {imageFile ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Product preview"
                  className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AddStockForm({
  products,
  onDone,
  onCancel,
}: {
  products: Product[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: err } = await supabase.from("inventory").upsert(
      {
        product_id: productId,
        size,
        color,
        quantity_available: parseInt(quantity) || 0,
      },
      { onConflict: "product_id,size,color" }
    );

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    onDone();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Stock</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size <span className="text-red-500">*</span>
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Stock"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
